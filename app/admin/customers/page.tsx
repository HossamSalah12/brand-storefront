import { createClient } from "@/lib/supabase/server";
import { formatPrice } from "@/lib/utils/currency";
import { EmptyState } from "@/components/ui/EmptyState";

export default async function AdminCustomersPage() {
  const supabase = createClient();

  const { data: customers } = await supabase
    .from("profiles")
    .select("id, full_name, phone, role, created_at")
    .eq("role", "customer")
    .order("created_at", { ascending: false });

  const { data: orders } = await supabase
    .from("orders")
    .select("user_id, total")
    .not("user_id", "is", null);

  const statsByUser = new Map<string, { count: number; total: number }>();
  (orders ?? []).forEach((o) => {
    if (!o.user_id) return;
    const current = statsByUser.get(o.user_id) ?? { count: 0, total: 0 };
    current.count += 1;
    current.total += o.total;
    statsByUser.set(o.user_id, current);
  });

  return (
    <div>
      <h1 className="mb-6 font-display text-2xl">العملاء</h1>

      {!customers?.length ? (
        <EmptyState title="لا يوجد عملاء مسجلون بعد" />
      ) : (
                <div className="overflow-x-auto">
          <table className="min-w-[640px] w-full text-sm">
          <thead>
            <tr className="border-b border-stone-light text-start text-xs uppercase tracking-widest2 text-stone">
              <th className="pb-3 text-start">الاسم</th>
              <th className="pb-3 text-start">الهاتف</th>
              <th className="pb-3 text-start">عدد الطلبات</th>
              <th className="pb-3 text-start">إجمالي الإنفاق</th>
              <th className="pb-3 text-start">تاريخ التسجيل</th>
            </tr>
          </thead>
          <tbody>
            {customers.map((c) => {
              const stats = statsByUser.get(c.id) ?? { count: 0, total: 0 };
              return (
                <tr key={c.id} className="border-b border-stone-light/50">
                  <td className="py-3">{c.full_name ?? "—"}</td>
                  <td className="py-3">{c.phone ?? "—"}</td>
                  <td className="py-3">{stats.count}</td>
                  <td className="py-3">{formatPrice(stats.total)}</td>
                  <td className="py-3 text-stone">
                    {new Date(c.created_at).toLocaleDateString("ar-EG")}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        </div>
      )}
    </div>
  );
}
