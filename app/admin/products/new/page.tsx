import { createClient } from "@/lib/supabase/server";
import { ProductForm } from "@/components/admin/ProductForm";

export default async function NewProductPage() {
  const supabase = createClient();

  const [{ data: categories }, { data: colors }, { data: sizes }] =
    await Promise.all([
      supabase.from("categories").select("id, name").order("sort_order"),
      supabase.from("colors").select("id, name").order("name"),
      supabase.from("sizes").select("id, name").order("sort_order"),
    ]);

  return (
    <div>
      <h1 className="mb-6 font-display text-2xl">منتج جديد</h1>
      <ProductForm
        categories={categories ?? []}
        colors={colors ?? []}
        sizes={sizes ?? []}
      />
    </div>
  );
}
