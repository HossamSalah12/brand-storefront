-- ============================================================
-- Shipment tracking
--
-- Lets an admin attach a carrier name and tracking number/link to an
-- order once it ships. Nullable — most small-brand shipping doesn't
-- have real-time tracking, so this is optional, not required.
-- ============================================================

alter table orders
  add column if not exists tracking_carrier text,
  add column if not exists tracking_number text,
  add column if not exists tracking_url text;
