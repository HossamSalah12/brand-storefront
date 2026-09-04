import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { archiveProductAction, deleteProductAction, publishProductAction } from "@/lib/actions/products";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";

const STATUS_LABEL: Record<string, string> = {
  active: "منشور",
  draft: "مسودة",
  archived: "مؤرشف",
};

export default async function AdminProductsPage() {
  const supabase = createClient();
  const { data: products } = await supabase
    .from("products")
    .select(
      "id, name, base_price, status, is_featured, product_variants(variant_inventory(quantity))",
    )
    .order("created_at", { ascending: false });

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-display text-2xl">المنتجات</h1>
        <Link href="/admin/products/new">
          <Button size="sm">+ إضافة منتج</Button>
        </Link>
      </div>

      {!products?.length ? (
        <EmptyState
          title="لا توجد منتجات بعد"
          description="ابدأ بإضافة أول منتج في المتجر."
          action={
            <Link href="/admin/products/new">
              <Button size="sm">+ إضافة منتج</Button>
            </Link>
          }
        />
      ) : (
        <>
          <p className="mb-4 text-xs text-stone">
            المنتجات بحالة "منشور" فقط هي اللي بتظهر لعملائك في المتجر —
            "مسودة" و"مؤرشف" مخفيان عن الزوار.
          </p>
                    <div className="overflow-x-auto">
            <table className="min-w-[640px] w-full text-sm">
            <thead>
              <tr className="border-b border-stone-light text-start text-xs uppercase tracking-widest2 text-stone">
                <th className="pb-3 text-start">المنتج</th>
                <th className="pb-3 text-start">السعر</th>
                <th className="pb-3 text-start">الحالة</th>
                <th className="pb-3 text-start">إجمالي المخزون</th>
                <th className="pb-3 text-start"></th>
              </tr>
            </thead>
            <tbody>
              {products.map((p: any) => {
                const totalStock = (p.product_variants ?? []).reduce(
                  (sum: number, v: any) => {
                    const inv = Array.isArray(v.variant_inventory)
                      ? v.variant_inventory[0]
                      : v.variant_inventory;
                    return sum + (inv?.quantity ?? 0);
                  },
                  0,
                );
                return (
                  <tr key={p.id} className="border-b border-stone-light/50">
                    <td className="py-3">{p.name}</td>
                    <td className="py-3">{p.base_price} EGP</td>
                    <td className="py-3">
                      <span className={p.status === "active" ? "text-moss" : "text-clay"}>
                        {STATUS_LABEL[p.status]}
                      </span>
                    </td>
                    <td className="py-3">
                      <span className={totalStock === 0 ? "text-clay" : ""}>
                        {totalStock}
                      </span>
                    </td>
                    <td className="py-3">
                      <div className="flex justify-end gap-4 text-xs">
                        {p.status !== "active" && (
                          <form
                            action={async () => {
                              "use server";
                              await publishProductAction(p.id);
                            }}
                          >
                            <button className="text-moss underline">نشر الآن</button>
                          </form>
                        )}
                        <Link
                          href={`/admin/products/${p.id}/edit`}
                          className="underline"
                        >
                          تعديل
                        </Link>
                        {p.status === "active" && (
                          <form
                            action={async () => {
                              "use server";
                              await archiveProductAction(p.id);
                            }}
                          >
                            <button className="text-stone underline">أرشفة</button>
                          </form>
                        )}
                        <form
                          action={async () => {
                            "use server";
                            await deleteProductAction(p.id);
                          }}
                        >
                          <button className="text-clay underline">حذف</button>
                        </form>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        </>
      )}
    </div>
  );
}
