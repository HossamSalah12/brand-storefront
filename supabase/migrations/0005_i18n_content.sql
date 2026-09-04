-- ============================================================
-- Bilingual content support
--
-- Adds optional English columns alongside the existing Arabic content.
-- Nothing is required to be filled in — every query falls back to the
-- Arabic value when the English one is empty, so existing products
-- keep working exactly as before until an admin adds translations.
-- ============================================================

alter table products
  add column if not exists name_en text,
  add column if not exists description_en text,
  add column if not exists material_en text,
  add column if not exists care_instructions_en text;

alter table categories
  add column if not exists name_en text;

alter table colors
  add column if not exists name_en text;

alter table sizes
  add column if not exists name_en text;
