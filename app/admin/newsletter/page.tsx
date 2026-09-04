import { createClient } from "@/lib/supabase/server";
import { EmptyState } from "@/components/ui/EmptyState";

export default async function AdminNewsletterPage() {
  const supabase = createClient();
  const { data: subscribers } = await supabase
    .from("newsletter_subscribers")
    .select("id, email, created_at")
    .order("created_at", { ascending: false });

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-display text-2xl">النشرة البريدية</h1>
        <span className="text-sm text-stone">{subscribers?.length ?? 0} مشترك</span>
      </div>

      {!subscribers?.length ? (
        <EmptyState title="لا يوجد مشتركين بعد" />
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-[400px] w-full text-sm">
            <thead>
              <tr className="border-b border-stone-light text-start text-xs uppercase tracking-widest2 text-stone">
                <th className="pb-3 text-start">البريد الإلكتروني</th>
                <th className="pb-3 text-start">تاريخ الاشتراك</th>
              </tr>
            </thead>
            <tbody>
              {subscribers.map((s) => (
                <tr key={s.id} className="border-b border-stone-light/50">
                  <td className="py-3">{s.email}</td>
                  <td className="py-3 text-stone">
                    {new Date(s.created_at).toLocaleDateString("ar-EG")}
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
