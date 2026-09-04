-- ============================================================
-- Storage: product images bucket
-- ============================================================

insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do nothing;

-- Anyone can view product images (it's a public storefront)
create policy "product_images_bucket_public_read"
  on storage.objects for select
  using (bucket_id = 'product-images');

-- Only admins can upload/replace/delete files in this bucket
create policy "product_images_bucket_admin_insert"
  on storage.objects for insert
  with check (bucket_id = 'product-images' and is_admin());

create policy "product_images_bucket_admin_update"
  on storage.objects for update
  using (bucket_id = 'product-images' and is_admin());

create policy "product_images_bucket_admin_delete"
  on storage.objects for delete
  using (bucket_id = 'product-images' and is_admin());
