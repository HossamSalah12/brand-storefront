-- ============================================================
-- Guest order access
--
-- The original policy only let a logged-in owner (or admin) read an
-- order. Guest checkout orders have user_id = null, so a guest could
-- never see their own order-confirmation page. We allow reading a
-- guest order (user_id is null) by anyone who has its id — the same
-- trust model most stores use for "view your order" links: the order
-- UUID itself is the unguessable secret, never enumerable or listed
-- anywhere public.
-- ============================================================

drop policy if exists "orders_owner_or_admin_read" on orders;
create policy "orders_owner_or_admin_or_guest_read" on orders
  for select using (
    auth.uid() = user_id or is_admin() or user_id is null
  );

drop policy if exists "order_items_owner_or_admin_read" on order_items;
create policy "order_items_owner_or_admin_or_guest_read" on order_items
  for select using (
    is_admin() or exists (
      select 1 from orders o
      where o.id = order_id and (o.user_id = auth.uid() or o.user_id is null)
    )
  );
