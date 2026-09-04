import { createClient } from "@/lib/supabase/server";
import { toggleCouponAction, deleteCouponAction } from "@/lib/actions/coupons";
import { CouponForm } from "@/components/admin/CouponForm";
import { EmptyState } from "@/components/ui/EmptyState";

export default async function AdminCouponsPage() {
  const supabase = createClient();
  const { data: coupons } = await supabase
    .from("coupons")
    .select("id, code, type, value, min_order_amount, usage_limit, times_used, is_active, expires_at")
    .order("created_at", { ascending: false });

  return (
    <div>
      <h1 className="mb-6 font-display text-2xl">الكوبونات</h1>

      <CouponForm />

      <div className="mt-10 border-t border-stone-light pt-6">
        {!coupons?.length ? (
          <EmptyState title="لا توجد كوبونات بعد" />
        ) : (
                    <div className="overflow-x-auto">
            <table className="min-w-[640px] w-full text-sm">
            <thead>
              <tr className="border-b border-stone-light text-start text-xs uppercase tracking-widest2 text-stone">
                <th className="pb-3 text-start">الكود</th>
                <th className="pb-3 text-start">الخصم</th>
                <th className="pb-3 text-start">أقل قيمة</th>
                <th className="pb-3 text-start">الاستخدام</th>
                <th className="pb-3 text-start">الحالة</th>
                <th className="pb-3 text-start"></th>
              </tr>
            </thead>
            <tbody>
              {coupons.map((c) => (
                <tr key={c.id} className="border-b border-stone-light/50">
                  <td className="py-3">{c.code}</td>
                  <td className="py-3">
                    {c.type === "percentage" ? `${c.value}%` : `${c.value} ج.م`}
                  </td>
                  <td className="py-3">{c.min_order_amount} ج.م</td>
                  <td className="py-3">
                    {c.times_used} / {c.usage_limit ?? "∞"}
                  </td>
                  <td className="py-3">
                    <span className={c.is_active ? "text-moss" : "text-stone"}>
                      {c.is_active ? "فعال" : "متوقف"}
                    </span>
                  </td>
                  <td className="py-3">
                    <div className="flex justify-end gap-4 text-xs">
                      <form
                        action={async () => {
                          "use server";
                          await toggleCouponAction(c.id, !c.is_active);
                        }}
                      >
                        <button className="underline">
                          {c.is_active ? "إيقاف" : "تفعيل"}
                        </button>
                      </form>
                      <form
                        action={async () => {
                          "use server";
                          await deleteCouponAction(c.id);
                        }}
                      >
                        <button className="text-clay underline">حذف</button>
                      </form>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        )}
      </div>
    </div>
  );
}
