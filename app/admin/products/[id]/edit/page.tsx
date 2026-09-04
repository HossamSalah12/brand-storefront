import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ProductForm } from "@/components/admin/ProductForm";

export default async function EditProductPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = createClient();

  const [{ data: categories }, { data: colors }, { data: sizes }] =
    await Promise.all([
      supabase.from("categories").select("id, name").order("sort_order"),
      supabase.from("colors").select("id, name").order("name"),
      supabase.from("sizes").select("id, name").order("sort_order"),
    ]);

  const { data: product } = await supabase
    .from("products")
    .select(
      `
      id, name, name_en, slug, description, description_en,
      material, material_en, care_instructions, care_instructions_en, category_id,
      base_price, compare_at_price, status, is_featured, is_new_arrival, is_best_seller,
      product_images(url, sort_order),
      product_measurements(size_id, chest_cm, shoulder_cm, length_cm, sleeve_cm),
      product_variants(color_id, size_id, sku, price_override, image_url, variant_inventory(quantity))
    `,
    )
    .eq("id", params.id)
    .single();

  if (!product) notFound();

  return (
    <div>
      <h1 className="mb-6 font-display text-2xl">تعديل: {product.name}</h1>
      <ProductForm
        productId={product.id}
        categories={categories ?? []}
        colors={colors ?? []}
        sizes={sizes ?? []}
        initial={{
          name: product.name,
          name_en: product.name_en,
          slug: product.slug,
          description: product.description,
          description_en: product.description_en,
          material: product.material,
          material_en: product.material_en,
          care_instructions: product.care_instructions,
          care_instructions_en: product.care_instructions_en,
          category_id: product.category_id,
          base_price: product.base_price,
          compare_at_price: product.compare_at_price,
          status: product.status,
          is_featured: product.is_featured,
          is_new_arrival: product.is_new_arrival,
          is_best_seller: product.is_best_seller,
          variants: (product.product_variants ?? []) as any,
          measurements: (product.product_measurements ?? []) as any,
          images: (product.product_images ?? [])
            .sort((a: any, b: any) => a.sort_order - b.sort_order)
            .map((img: any, i: number) => ({ url: img.url, sortOrder: i })),
        }}
      />
    </div>
  );
}
