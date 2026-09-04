-- ============================================================
-- Brand Storefront — initial schema
-- Run via: npx supabase db push  (see README)
-- ============================================================

create extension if not exists "pgcrypto";

-- ------------------------------------------------------------
-- Helper: updated_at trigger
-- ------------------------------------------------------------
create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- ------------------------------------------------------------
-- profiles: one row per auth.users row, carries role + contact info
-- ------------------------------------------------------------
create type user_role as enum ('customer', 'admin');

create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role user_role not null default 'customer',
  full_name text,
  phone text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger profiles_updated_at before update on profiles
  for each row execute function set_updated_at();

-- Auto-create a profile row whenever a new auth user signs up
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, phone)
  values (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'phone');
  return new;
end;
$$ language plpgsql security definer set search_path = public;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- ------------------------------------------------------------
-- categories
-- ------------------------------------------------------------
create table categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  image_url text,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger categories_updated_at before update on categories
  for each row execute function set_updated_at();

-- ------------------------------------------------------------
-- colors / sizes (shared lookup tables, reusable across products)
-- ------------------------------------------------------------
create table colors (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  hex_value text
);

create table sizes (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,       -- 'S', 'M', 'L', 'XL' ...
  sort_order int not null default 0
);

-- ------------------------------------------------------------
-- products
-- ------------------------------------------------------------
create type product_status as enum ('active', 'draft', 'archived');

create table products (
  id uuid primary key default gen_random_uuid(),
  category_id uuid references categories(id) on delete set null,
  name text not null,
  slug text not null unique,
  description text,
  material text,
  care_instructions text,
  base_price numeric(10,2) not null check (base_price >= 0),
  compare_at_price numeric(10,2) check (compare_at_price >= 0),
  status product_status not null default 'draft',
  is_featured boolean not null default false,
  is_new_arrival boolean not null default false,
  is_best_seller boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index products_status_idx on products(status);
create index products_category_idx on products(category_id);
create trigger products_updated_at before update on products
  for each row execute function set_updated_at();

create table product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products(id) on delete cascade,
  url text not null,
  alt_text text,
  sort_order int not null default 0
);
create index product_images_product_idx on product_images(product_id);

-- Per-size measurement chart for a product (chest/shoulder/length/sleeve...)
create table product_measurements (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products(id) on delete cascade,
  size_id uuid not null references sizes(id) on delete cascade,
  chest_cm numeric(5,1),
  shoulder_cm numeric(5,1),
  length_cm numeric(5,1),
  sleeve_cm numeric(5,1),
  unique (product_id, size_id)
);

-- ------------------------------------------------------------
-- product_variants: the sellable unit (color + size)
-- ------------------------------------------------------------
create table product_variants (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products(id) on delete cascade,
  color_id uuid references colors(id) on delete restrict,
  size_id uuid references sizes(id) on delete restrict,
  sku text not null unique,
  price_override numeric(10,2) check (price_override >= 0),
  image_url text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  unique (product_id, color_id, size_id)
);
create index product_variants_product_idx on product_variants(product_id);

-- Stock lives in its own table so it can be updated/audited independently
create table variant_inventory (
  variant_id uuid primary key references product_variants(id) on delete cascade,
  quantity int not null default 0 check (quantity >= 0),
  low_stock_threshold int not null default 5,
  updated_at timestamptz not null default now()
);
create trigger variant_inventory_updated_at before update on variant_inventory
  for each row execute function set_updated_at();

-- ------------------------------------------------------------
-- addresses
-- ------------------------------------------------------------
create table addresses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade,
  full_name text not null,
  phone text not null,
  governorate text not null,
  city text not null,
  full_address text not null,
  building text,
  apartment text,
  floor text,
  landmark text,
  is_default boolean not null default false,
  created_at timestamptz not null default now()
);
create index addresses_user_idx on addresses(user_id);

-- ------------------------------------------------------------
-- shipping: zones + rates, configurable from the admin dashboard
-- ------------------------------------------------------------
create table shipping_zones (
  id uuid primary key default gen_random_uuid(),
  governorate text not null unique,
  created_at timestamptz not null default now()
);

create table shipping_rates (
  id uuid primary key default gen_random_uuid(),
  zone_id uuid not null references shipping_zones(id) on delete cascade,
  price numeric(10,2) not null check (price >= 0),
  is_active boolean not null default true
);
create index shipping_rates_zone_idx on shipping_rates(zone_id);

-- Global settings, e.g. free-shipping threshold. Single-row-per-key table.
create table settings (
  key text primary key,
  value jsonb not null
);

-- ------------------------------------------------------------
-- coupons
-- ------------------------------------------------------------
create type coupon_type as enum ('percentage', 'fixed');

create table coupons (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  type coupon_type not null,
  value numeric(10,2) not null check (value > 0),
  min_order_amount numeric(10,2) not null default 0,
  usage_limit int,
  times_used int not null default 0,
  is_active boolean not null default true,
  expires_at timestamptz,
  created_at timestamptz not null default now()
);

create table coupon_usage (
  id uuid primary key default gen_random_uuid(),
  coupon_id uuid not null references coupons(id) on delete cascade,
  order_id uuid not null,
  user_id uuid references profiles(id) on delete set null,
  used_at timestamptz not null default now()
);

-- ------------------------------------------------------------
-- orders
-- ------------------------------------------------------------
create type order_status as enum
  ('pending', 'confirmed', 'preparing', 'shipped', 'delivered', 'cancelled', 'returned');
create type payment_status as enum ('pending', 'paid', 'failed', 'refunded');
create type payment_method as enum ('cod'); -- extend later: 'card', 'wallet', ...

create table orders (
  id uuid primary key default gen_random_uuid(),
  order_number text not null unique,
  user_id uuid references profiles(id) on delete set null, -- null for guest checkout
  guest_email text,
  full_name text not null,
  phone text not null,
  email text,
  governorate text not null,
  city text not null,
  full_address text not null,
  building text,
  apartment text,
  floor text,
  landmark text,
  subtotal numeric(10,2) not null check (subtotal >= 0),
  discount_amount numeric(10,2) not null default 0,
  shipping_amount numeric(10,2) not null default 0,
  total numeric(10,2) not null check (total >= 0),
  coupon_id uuid references coupons(id) on delete set null,
  payment_method payment_method not null default 'cod',
  payment_status payment_status not null default 'pending',
  status order_status not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index orders_user_idx on orders(user_id);
create index orders_status_idx on orders(status);
create trigger orders_updated_at before update on orders
  for each row execute function set_updated_at();

create table order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders(id) on delete cascade,
  variant_id uuid not null references product_variants(id) on delete restrict,
  product_name text not null,   -- snapshot, in case product is edited/archived later
  color_name text,
  size_name text,
  sku text not null,
  unit_price numeric(10,2) not null check (unit_price >= 0),
  quantity int not null check (quantity > 0),
  line_total numeric(10,2) not null check (line_total >= 0)
);
create index order_items_order_idx on order_items(order_id);

create table payments (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders(id) on delete cascade,
  provider text not null default 'cod', -- 'cod' today; 'stripe'/'paymob' later
  amount numeric(10,2) not null,
  status payment_status not null default 'pending',
  provider_reference text,
  created_at timestamptz not null default now()
);
create index payments_order_idx on payments(order_id);

-- ------------------------------------------------------------
-- reviews
-- ------------------------------------------------------------
create table reviews (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products(id) on delete cascade,
  user_id uuid not null references profiles(id) on delete cascade,
  order_item_id uuid references order_items(id) on delete set null, -- proves purchase
  rating int not null check (rating between 1 and 5),
  comment text,
  is_approved boolean not null default false,
  created_at timestamptz not null default now()
);
create index reviews_product_idx on reviews(product_id);

-- ------------------------------------------------------------
-- wishlists
-- ------------------------------------------------------------
create table wishlists (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade unique,
  created_at timestamptz not null default now()
);

create table wishlist_items (
  id uuid primary key default gen_random_uuid(),
  wishlist_id uuid not null references wishlists(id) on delete cascade,
  product_id uuid not null references products(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (wishlist_id, product_id)
);

-- ============================================================
-- Row Level Security
-- ============================================================

alter table profiles enable row level security;
alter table categories enable row level security;
alter table colors enable row level security;
alter table sizes enable row level security;
alter table products enable row level security;
alter table product_images enable row level security;
alter table product_measurements enable row level security;
alter table product_variants enable row level security;
alter table variant_inventory enable row level security;
alter table addresses enable row level security;
alter table shipping_zones enable row level security;
alter table shipping_rates enable row level security;
alter table settings enable row level security;
alter table coupons enable row level security;
alter table coupon_usage enable row level security;
alter table orders enable row level security;
alter table order_items enable row level security;
alter table payments enable row level security;
alter table reviews enable row level security;
alter table wishlists enable row level security;
alter table wishlist_items enable row level security;

-- Helper to check admin role without recursive RLS lookups
create or replace function is_admin()
returns boolean as $$
  select exists (
    select 1 from profiles
    where id = auth.uid() and role = 'admin'
  );
$$ language sql security definer stable set search_path = public;

-- profiles: user sees/edits their own row; admins see all
create policy "profiles_select_own_or_admin" on profiles
  for select using (auth.uid() = id or is_admin());
create policy "profiles_update_own" on profiles
  for update using (auth.uid() = id);

-- Public catalog data: readable by everyone, writable by admins only
create policy "categories_public_read" on categories for select using (true);
create policy "categories_admin_write" on categories for all using (is_admin()) with check (is_admin());

create policy "colors_public_read" on colors for select using (true);
create policy "colors_admin_write" on colors for all using (is_admin()) with check (is_admin());

create policy "sizes_public_read" on sizes for select using (true);
create policy "sizes_admin_write" on sizes for all using (is_admin()) with check (is_admin());

create policy "products_public_read_active" on products
  for select using (status = 'active' or is_admin());
create policy "products_admin_write" on products for all using (is_admin()) with check (is_admin());

create policy "product_images_public_read" on product_images for select using (true);
create policy "product_images_admin_write" on product_images for all using (is_admin()) with check (is_admin());

create policy "product_measurements_public_read" on product_measurements for select using (true);
create policy "product_measurements_admin_write" on product_measurements for all using (is_admin()) with check (is_admin());

create policy "product_variants_public_read" on product_variants for select using (true);
create policy "product_variants_admin_write" on product_variants for all using (is_admin()) with check (is_admin());

create policy "variant_inventory_public_read" on variant_inventory for select using (true);
create policy "variant_inventory_admin_write" on variant_inventory for all using (is_admin()) with check (is_admin());

-- Addresses: strictly owner or admin
create policy "addresses_owner_rw" on addresses
  for all using (auth.uid() = user_id or is_admin())
  with check (auth.uid() = user_id or is_admin());

-- Shipping/settings: public read (checkout needs it), admin write
create policy "shipping_zones_public_read" on shipping_zones for select using (true);
create policy "shipping_zones_admin_write" on shipping_zones for all using (is_admin()) with check (is_admin());

create policy "shipping_rates_public_read" on shipping_rates for select using (true);
create policy "shipping_rates_admin_write" on shipping_rates for all using (is_admin()) with check (is_admin());

create policy "settings_public_read" on settings for select using (true);
create policy "settings_admin_write" on settings for all using (is_admin()) with check (is_admin());

-- Coupons: no public read of the whole table (avoid leaking codes);
-- validation happens through a server function instead. Admin full access.
create policy "coupons_admin_all" on coupons for all using (is_admin()) with check (is_admin());
create policy "coupon_usage_admin_read" on coupon_usage for select using (is_admin());

-- Orders: owner (by user_id) or admin. Guest orders are only reachable
-- via the server's service-role client immediately after checkout.
create policy "orders_owner_or_admin_read" on orders
  for select using (auth.uid() = user_id or is_admin());
create policy "orders_admin_write" on orders
  for update using (is_admin()) with check (is_admin());
-- Inserts happen exclusively through server-side code using the service
-- role client (server validates stock/pricing), so no direct insert policy
-- is granted to authenticated/anon roles.

create policy "order_items_owner_or_admin_read" on order_items
  for select using (
    is_admin() or exists (
      select 1 from orders o where o.id = order_id and o.user_id = auth.uid()
    )
  );

create policy "payments_admin_read" on payments for select using (is_admin());

-- Reviews: anyone can read approved reviews; owner can read/insert their own;
-- only admin can approve/delete.
create policy "reviews_public_read_approved" on reviews
  for select using (is_approved = true or user_id = auth.uid() or is_admin());
create policy "reviews_owner_insert" on reviews
  for insert with check (user_id = auth.uid());
create policy "reviews_admin_moderate" on reviews
  for update using (is_admin()) with check (is_admin());
create policy "reviews_admin_delete" on reviews
  for delete using (is_admin());

-- Wishlists: strictly owner
create policy "wishlists_owner_rw" on wishlists
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "wishlist_items_owner_rw" on wishlist_items
  for all using (
    exists (select 1 from wishlists w where w.id = wishlist_id and w.user_id = auth.uid())
  )
  with check (
    exists (select 1 from wishlists w where w.id = wishlist_id and w.user_id = auth.uid())
  );

-- ------------------------------------------------------------
-- Seed baseline settings row (free shipping threshold, etc.)
-- ------------------------------------------------------------
insert into settings (key, value) values
  ('free_shipping_threshold', '{"amount": 1500}'),
  ('default_shipping_price', '{"amount": 100}')
on conflict (key) do nothing;
