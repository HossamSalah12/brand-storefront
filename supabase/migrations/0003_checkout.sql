-- ============================================================
-- Order creation as a single atomic Postgres function.
--
-- This is the ONLY path that creates an order. It never trusts any
-- price, subtotal, or total sent from the client — it looks up each
-- variant's current price and stock itself, locks the stock rows
-- (FOR UPDATE) to prevent two simultaneous checkouts from both
-- succeeding on the last unit, then decrements stock and inserts the
-- order in the same transaction. If anything fails, everything rolls
-- back — an order is never left half-created.
-- ============================================================

create or replace function create_order(
  p_guest_email text,
  p_full_name text,
  p_phone text,
  p_email text,
  p_governorate text,
  p_city text,
  p_full_address text,
  p_building text,
  p_apartment text,
  p_floor text,
  p_landmark text,
  p_coupon_code text,
  p_items jsonb -- [{"variant_id": "...", "quantity": 2}, ...]
) returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_order_id uuid;
  v_order_number text;
  v_item jsonb;
  v_variant record;
  v_subtotal numeric := 0;
  v_unit_price numeric;
  v_discount numeric := 0;
  v_shipping numeric := 0;
  v_total numeric;
  v_coupon record;
  v_free_shipping_threshold numeric;
  v_default_shipping numeric;
  v_zone_price numeric;
  v_qty int;
begin
  if p_items is null or jsonb_array_length(p_items) = 0 then
    raise exception 'CART_EMPTY';
  end if;
  if coalesce(trim(p_full_name), '') = '' or coalesce(trim(p_phone), '') = '' then
    raise exception 'MISSING_CONTACT_INFO';
  end if;
  if coalesce(trim(p_governorate), '') = '' or coalesce(trim(p_city), '') = ''
     or coalesce(trim(p_full_address), '') = '' then
    raise exception 'MISSING_ADDRESS';
  end if;

  -- Pass 1: lock stock rows and validate + total up the real, current price.
  for v_item in select * from jsonb_array_elements(p_items)
  loop
    v_qty := (v_item->>'quantity')::int;
    if v_qty is null or v_qty < 1 then
      raise exception 'INVALID_QUANTITY';
    end if;

    select pv.id, pv.sku, pv.price_override, p.base_price, vi.quantity as stock
    into v_variant
    from product_variants pv
    join products p on p.id = pv.product_id
    join variant_inventory vi on vi.variant_id = pv.id
    where pv.id = (v_item->>'variant_id')::uuid
    for update of vi;

    if v_variant.id is null then
      raise exception 'VARIANT_NOT_FOUND';
    end if;
    if v_variant.stock < v_qty then
      raise exception 'INSUFFICIENT_STOCK:%', v_variant.sku;
    end if;

    v_unit_price := coalesce(v_variant.price_override, v_variant.base_price);
    v_subtotal := v_subtotal + v_unit_price * v_qty;
  end loop;

  -- Coupon: validated and applied server-side only.
  if p_coupon_code is not null and trim(p_coupon_code) <> '' then
    select * into v_coupon from coupons
    where code = p_coupon_code
      and is_active = true
      and (expires_at is null or expires_at > now())
      and (usage_limit is null or times_used < usage_limit)
    for update;

    if v_coupon.id is null then
      raise exception 'INVALID_COUPON';
    end if;
    if v_subtotal < v_coupon.min_order_amount then
      raise exception 'COUPON_MIN_NOT_MET';
    end if;

    v_discount := case
      when v_coupon.type = 'percentage' then round(v_subtotal * v_coupon.value / 100, 2)
      else least(v_coupon.value, v_subtotal)
    end;
  end if;

  -- Shipping: configurable rate by governorate, with free-shipping threshold.
  select (value->>'amount')::numeric into v_free_shipping_threshold
    from settings where key = 'free_shipping_threshold';
  select (value->>'amount')::numeric into v_default_shipping
    from settings where key = 'default_shipping_price';

  select sr.price into v_zone_price
  from shipping_zones sz
  join shipping_rates sr on sr.zone_id = sz.id and sr.is_active = true
  where sz.governorate = p_governorate
  limit 1;

  if (v_subtotal - v_discount) >= coalesce(v_free_shipping_threshold, 2147483647) then
    v_shipping := 0;
  else
    v_shipping := coalesce(v_zone_price, v_default_shipping, 0);
  end if;

  v_total := v_subtotal - v_discount + v_shipping;

  v_order_number := 'ORD-' || to_char(now(), 'YYYYMMDD') || '-' ||
    upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 6));

  insert into orders (
    order_number, user_id, guest_email, full_name, phone, email,
    governorate, city, full_address, building, apartment, floor, landmark,
    subtotal, discount_amount, shipping_amount, total,
    coupon_id, payment_method, payment_status, status
  ) values (
    v_order_number, auth.uid(), p_guest_email, p_full_name, p_phone, p_email,
    p_governorate, p_city, p_full_address, p_building, p_apartment, p_floor, p_landmark,
    v_subtotal, v_discount, v_shipping, v_total,
    v_coupon.id, 'cod', 'pending', 'pending'
  )
  returning id into v_order_id;

  -- Pass 2: write line items (snapshotting name/color/size) and decrement stock.
  for v_item in select * from jsonb_array_elements(p_items)
  loop
    v_qty := (v_item->>'quantity')::int;

    select pv.id, pv.sku, pv.price_override, p.base_price, p.name as product_name,
           c.name as color_name, s.name as size_name
    into v_variant
    from product_variants pv
    join products p on p.id = pv.product_id
    left join colors c on c.id = pv.color_id
    left join sizes s on s.id = pv.size_id
    where pv.id = (v_item->>'variant_id')::uuid;

    v_unit_price := coalesce(v_variant.price_override, v_variant.base_price);

    insert into order_items (
      order_id, variant_id, product_name, color_name, size_name, sku, unit_price, quantity, line_total
    ) values (
      v_order_id, v_variant.id, v_variant.product_name, v_variant.color_name, v_variant.size_name,
      v_variant.sku, v_unit_price, v_qty, v_unit_price * v_qty
    );

    update variant_inventory
    set quantity = quantity - v_qty
    where variant_id = v_variant.id;
  end loop;

  insert into payments (order_id, provider, amount, status)
  values (v_order_id, 'cod', v_total, 'pending');

  if v_coupon.id is not null then
    update coupons set times_used = times_used + 1 where id = v_coupon.id;
    insert into coupon_usage (coupon_id, order_id, user_id) values (v_coupon.id, v_order_id, auth.uid());
  end if;

  return jsonb_build_object(
    'order_id', v_order_id,
    'order_number', v_order_number,
    'total', v_total
  );
end;
$$;

-- Both guests (anon) and logged-in customers (authenticated) can check out.
grant execute on function create_order(
  text, text, text, text, text, text, text, text, text, text, text, text, jsonb
) to anon, authenticated;
