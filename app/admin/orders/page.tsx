import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { formatPrice } from "@/lib/utils/currency";
import { EmptyState } from "@/components/ui/EmptyState";

const STATUS_LABEL: Record<string, string> = {
  pending: "قيد الانتظار",
  confirmed: "تم التأكيد",
  preparing: "قيد التجهيز",
  shipped: "تم الشحن",
  delivered: "تم التوصيل",
  cancelled: "ملغي",
  returned: "مرتجع",
};

const STATUS_FILTERS = ["all", ...Object.keys(STATUS_LABEL)];

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: { status?: string; q?: string };
}) {
  const supabase = createClient();
  const status = searchParams.status ?? "all";

  let query = supabase
    .from("orders")
    .select("id, order_number, full_name, phone, status, payment_status, total, created_at")
    .order("created_at", { ascending: false });

  if (status !== "all") query = query.eq("status", status);
  if (searchParams.q) {
    query = query.or(
      `order_number.ilike.%${searchParams.q}%,phone.ilike.%${searchParams.q}%,full_name.ilike.%${searchParams.q}%`,
    );
  }

  const { data: orders } = await query;

  return (
    <div>
      <h1 className="mb-6 font-display text-2xl">الطلبات</h1>

      <form className="mb-4 flex gap-2" action="/admin/orders">
        <input type="hidden" name="status" value={status} />
        <input
          name="q"
          defaultValue={searchParams.q}
          placeholder="ابحث برقم الطلب أو الاسم أو الهاتف"
          className="w-72 border border-stone-light bg-transparent px-3 py-2 text-sm"
        />
      </form>

      <div className="mb-6 flex flex-wrap gap-2 text-xs">
        {STATUS_FILTERS.map((s) => (
          <Link
            key={s}
            href={`/admin/orders?status=${s}`}
            className={`border px-3 py-1.5 ${
              status === s ? "border-ink bg-ink text-bone" : "border-stone-light"
            }`}
          >
            {s === "all" ? "الكل" : STATUS_LABEL[s]}
          </Link>
        ))}
      </div>

      {!orders?.length ? (
        <EmptyState title="لا توجد طلبات" />
      ) : (
                <div className="overflow-x-auto">
          <table className="min-w-[640px] w-full text-sm">
          <thead>
            <tr className="border-b border-stone-light text-start text-xs uppercase tracking-widest2 text-stone">
              <th className="pb-3 text-start">رقم الطلب</th>
              <th className="pb-3 text-start">العميل</th>
              <th className="pb-3 text-start">الحالة</th>
              <th className="pb-3 text-start">الدفع</th>
              <th className="pb-3 text-start">الإجمالي</th>
              <th className="pb-3 text-start">التاريخ</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o.id} className="border-b border-stone-light/50">
                <td className="py-3">
                  <Link href={`/admin/orders/${o.id}`} className="underline">
                    {o.order_number}
                  </Link>
                </td>
                <td className="py-3">
                  {o.full_name} <span className="text-stone">— {o.phone}</span>
                </td>
                <td className="py-3">{STATUS_LABEL[o.status]}</td>
                <td className="py-3">{o.payment_status === "paid" ? "مدفوع" : "قيد الانتظار"}</td>
                <td className="py-3">{formatPrice(o.total)}</td>
                <td className="py-3 text-stone">
                  {new Date(o.created_at).toLocaleDateString("ar-EG")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      )}
    </div>
  );
}
