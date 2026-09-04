import { createClient } from "@/lib/supabase/server";
import { deleteCategoryAction } from "@/lib/actions/products";
import { CategoryForm } from "@/components/admin/CategoryForm";

export default async function AdminCategoriesPage() {
  const supabase = createClient();
  const { data: categories } = await supabase
    .from("categories")
    .select("id, name, slug")
    .order("sort_order");

  return (
    <div>
      <h1 className="mb-6 font-display text-2xl">الفئات</h1>

      <CategoryForm />

      <div className="mt-10 border-t border-stone-light pt-6">
                <div className="overflow-x-auto">
          <table className="min-w-[640px] w-full text-sm">
          <thead>
            <tr className="border-b border-stone-light text-start text-xs uppercase tracking-widest2 text-stone">
              <th className="pb-3 text-start">الاسم</th>
              <th className="pb-3 text-start">الرابط</th>
              <th className="pb-3 text-start"></th>
            </tr>
          </thead>
          <tbody>
            {(categories ?? []).map((c: { id: string; name: string; slug: string }) => (
              <tr key={c.id} className="border-b border-stone-light/50">
                <td className="py-3">{c.name}</td>
                <td className="py-3 text-stone">{c.slug}</td>
                <td className="py-3 text-end">
                  <form
                    action={async () => {
                      "use server";
                      await deleteCategoryAction(c.id);
                    }}
                  >
                    <button className="text-xs text-clay underline">
                      حذف
                    </button>
                  </form>
                </td>
              </tr>
            ))}
            {!categories?.length && (
              <tr>
                <td colSpan={3} className="py-6 text-center text-stone">
                  لا توجد فئات بعد
                </td>
              </tr>
            )}
          </tbody>
        </table>
        </div>
      </div>
    </div>
  );
}
