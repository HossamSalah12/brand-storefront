import { createClient } from "@/lib/supabase/server";
import { approveReviewAction, deleteReviewAction } from "@/lib/actions/products";
import { EmptyState } from "@/components/ui/EmptyState";

export default async function AdminReviewsPage() {
  const supabase = createClient();
  const { data: reviews } = await supabase
    .from("reviews")
    .select("id, rating, comment, is_approved, created_at, products(name), profiles(full_name)")
    .order("created_at", { ascending: false });

  return (
    <div>
      <h1 className="mb-6 font-display text-2xl">التقييمات</h1>

      {!reviews?.length ? (
        <EmptyState title="لا توجد تقييمات بعد" />
      ) : (
        <div className="flex flex-col gap-4">
          {reviews.map((r: any) => (
            <div key={r.id} className="border border-stone-light p-4 text-sm">
              <div className="flex items-start justify-between">
                <div>
                  <p>{r.products?.name}</p>
                  <p className="text-stone">{"★".repeat(r.rating)}{"☆".repeat(5 - r.rating)}</p>
                  {r.comment && <p className="mt-2">{r.comment}</p>}
                  <p className="mt-2 text-xs text-stone">
                    {r.profiles?.full_name ?? "عميل"} —{" "}
                    {new Date(r.created_at).toLocaleDateString("ar-EG")}
                  </p>
                </div>
                <span
                  className={`text-xs ${r.is_approved ? "text-moss" : "text-clay"}`}
                >
                  {r.is_approved ? "معتمد" : "قيد المراجعة"}
                </span>
              </div>
              <div className="mt-3 flex gap-4 text-xs">
                {!r.is_approved && (
                  <form
                    action={async () => {
                      "use server";
                      await approveReviewAction(r.id);
                    }}
                  >
                    <button className="underline">اعتماد</button>
                  </form>
                )}
                <form
                  action={async () => {
                    "use server";
                    await deleteReviewAction(r.id);
                  }}
                >
                  <button className="text-clay underline">حذف</button>
                </form>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
