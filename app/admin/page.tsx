import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { formatPrice } from "@/lib/utils/currency";
import { CountUp } from "@/components/admin/CountUp";

export default async function AdminOverviewPage() {
  const supabase = createClient();

  const [
    { data: orders },
    { count: totalCustomers },
    { count: totalProducts },
    { data: lowStockVariants },
    { data: recentOrders },
    { data: allOrderItems },
  ] = await Promise.all([
    supabase.from("orders").select("total, status"),
    supabase.from("profiles").select("id", { count: "exact", head: true }).eq("role", "customer"),
    supabase.from("products").select("id", { count: "exact", head: true }).eq("status", "active"),
    supabase
      .from("variant_inventory")
      .select("quantity, low_stock_threshold, product_variants(sku, products(name))")
      .order("quantity", { ascending: true }),
    supabase
      .from("orders")
      .select("id, order_number, full_name, total, status, created_at")
      .order("created_at", { ascending: false })
      .limit(5),
    supabase.from("order_items").select("product_name, quantity"),
  ]);

  const totalSales = (orders ?? []).reduce((sum, o) => sum + o.total, 0);
  const totalOrders = orders?.length ?? 0;
  const pendingOrders = (orders ?? []).filter((o) => o.status === "pending").length;
  const lowStock = (lowStockVariants ?? []).filter(
    (v) => v.quantity <= v.low_stock_threshold,
  );

  const bestSellersMap = new Map<string, number>();
  (allOrderItems ?? []).forEach((item) => {
    bestSellersMap.set(
      item.product_name,
      (bestSellersMap.get(item.product_name) ?? 0) + item.quantity,
    );
  });
  const bestSellers = Array.from(bestSellersMap.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  const cards = [
    { label: "إجمالي المبيعات", value: formatPrice(totalSales) },
    { label: "إجمالي الطلبات", value: totalOrders },
    { label: "إجمالي العملاء", value: totalCustomers ?? 0 },
    { label: "إجمالي المنتجات", value: totalProducts ?? 0 },
    { label: "طلبات قيد الانتظار", value: pendingOrders },
    { label: "منتجات على وشك النفاد", value: lowStock.length },
  ];

  return (
    <div>
      <h1 className="mb-6 font-display text-2xl">نظرة عامة</h1>

      <div className="mb-10 grid grid-cols-2 gap-4 md:grid-cols-3">
        {cards.map((card) => (
          <div key={card.label} className="border border-stone-light p-6">
            <p className="text-xs uppercase tracking-widest2 text-stone">{card.label}</p>
            <p className="mt-2 font-display text-3xl">
              <CountUp value={card.value} />
            </p>
          </div>
        ))}
      </div>

      <div className="grid gap-10 md:grid-cols-2">
        <section>
          <h2 className="mb-4 font-display text-lg">أحدث الطلبات</h2>
          <div className="flex flex-col">
            {(recentOrders ?? []).map((o) => (
              <Link
                key={o.id}
                href={`/admin/orders/${o.id}`}
                className="flex justify-between border-b border-stone-light/50 py-3 text-sm"
              >
                <span>{o.order_number}</span>
                <span className="text-stone">{o.full_name}</span>
                <span>{formatPrice(o.total)}</span>
              </Link>
            ))}
            {!recentOrders?.length && <p className="text-sm text-stone">لا توجد طلبات بعد</p>}
          </div>
        </section>

        <section>
          <h2 className="mb-4 font-display text-lg">الأكثر مبيعًا</h2>
          <div className="flex flex-col">
            {bestSellers.map(([name, qty]) => (
              <div key={name} className="flex justify-between border-b border-stone-light/50 py-3 text-sm">
                <span>{name}</span>
                <span className="text-stone">{qty} قطعة</span>
              </div>
            ))}
            {!bestSellers.length && <p className="text-sm text-stone">لا توجد مبيعات بعد</p>}
          </div>
        </section>
      </div>

      {lowStock.length > 0 && (
        <section className="mt-10">
          <h2 className="mb-4 font-display text-lg text-clay">تنبيه مخزون منخفض</h2>
          <div className="flex flex-col">
            {lowStock.map((v: any, i: number) => (
              <div key={i} className="flex justify-between border-b border-stone-light/50 py-3 text-sm">
                <span>
                  {v.product_variants?.products?.name} — {v.product_variants?.sku}
                </span>
                <span className="text-clay">{v.quantity} متبقي</span>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
