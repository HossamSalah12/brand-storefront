-- ============================================================
-- Newsletter subscribers
--
-- The footer newsletter form previously submitted to nowhere. This adds
-- a real table for it: anyone can insert their own email (subscribe),
-- but only admins can read the list — so the form isn't a way to
-- enumerate or harvest other people's emails.
-- ============================================================

create table newsletter_subscribers (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  created_at timestamptz not null default now()
);

alter table newsletter_subscribers enable row level security;

create policy "newsletter_subscribers_public_insert" on newsletter_subscribers
  for insert with check (true);

create policy "newsletter_subscribers_admin_read" on newsletter_subscribers
  for select using (is_admin());

create policy "newsletter_subscribers_admin_delete" on newsletter_subscribers
  for delete using (is_admin());
