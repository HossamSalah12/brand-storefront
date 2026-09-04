import { createClient } from "@/lib/supabase/server";
import { InventoryRow } from "@/components/admin/InventoryRow";

export default async function AdminInventoryPage() {
  const supabase = createClient();

  const { data: variants } = await supabase
    .from("product_variants")
    .select(
      `
      id, sku,
      products(name),
      colors(name),
      sizes(name),
      variant_inventory(quantity, low_stock_threshold)
    `,
    )
    .order("sku");

  return (
    <div>
      <h1 className="mb-6 font-display text-2xl">المخزون</h1>

      
      <div className="overflow-x-auto">

        <table className="min-w-[640px] w-full text-sm">
        <thead>
          <tr className="border-b border-stone-light text-start text-xs uppercase tracking-widest2 text-stone">
            <th className="pb-3 text-start">المنتج</th>
            <th className="pb-3 text-start">اللون / المقاس</th>
            <th className="pb-3 text-start">SKU</th>
            <th className="pb-3 text-start">المخزون الحالي</th>
            <th className="pb-3 text-start"></th>
          </tr>
        </thead>
        <tbody>
          {(variants ?? []).map((v: any) => {
            const inv = Array.isArray(v.variant_inventory)
              ? v.variant_inventory[0]
              : v.variant_inventory;
            const product = Array.isArray(v.products) ? v.products[0] : v.products;
            const color = Array.isArray(v.colors) ? v.colors[0] : v.colors;
            const size = Array.isArray(v.sizes) ? v.sizes[0] : v.sizes;
            return (
              <InventoryRow
                key={v.id}
                variantId={v.id}
                productName={product?.name ?? "—"}
                colorSize={`${color?.name ?? ""} / ${size?.name ?? ""}`}
                sku={v.sku}
                quantity={inv?.quantity ?? 0}
                lowStockThreshold={inv?.low_stock_threshold ?? 5}
              />
            );
          })}
        </tbody>
      </table>
        </div>
    </div>
  );
}
