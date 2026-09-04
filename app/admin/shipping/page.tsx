import { createClient } from "@/lib/supabase/server";
import {
  createShippingZoneAction,
  deleteShippingZoneAction,
} from "@/lib/actions/shipping";
import { getStoreSettings } from "@/lib/actions/settings";
import { ShippingZoneForm } from "@/components/admin/ShippingZoneForm";
import { SettingInput } from "@/components/admin/SettingInput";

export default async function AdminShippingPage() {
  const supabase = createClient();
  const { data: zones } = await supabase
    .from("shipping_zones")
    .select("id, governorate, shipping_rates(price)")
    .order("governorate");

  const settings = await getStoreSettings();

  return (
    <div>
      <h1 className="mb-6 font-display text-2xl">الشحن</h1>

      <section className="mb-10 max-w-md">
        <h2 className="mb-4 font-display text-lg">إعدادات عامة</h2>
        <SettingInput
          settingKey="free_shipping_threshold"
          label="الحد الأدنى للشحن المجاني (ج.م)"
          defaultValue={settings.freeShippingThreshold}
        />
        <div className="mt-4">
          <SettingInput
            settingKey="default_shipping_price"
            label="سعر الشحن الافتراضي (لأي محافظة غير مضافة)"
            defaultValue={settings.defaultShippingPrice}
          />
        </div>
      </section>

      <section>
        <h2 className="mb-4 font-display text-lg">أسعار الشحن حسب المحافظة</h2>
        <ShippingZoneForm />

        
        <div className="overflow-x-auto">

          <table className="min-w-[640px] mt-6 w-full text-sm">
          <thead>
            <tr className="border-b border-stone-light text-start text-xs uppercase tracking-widest2 text-stone">
              <th className="pb-3 text-start">المحافظة</th>
              <th className="pb-3 text-start">السعر</th>
              <th className="pb-3 text-start"></th>
            </tr>
          </thead>
          <tbody>
            {(zones ?? []).map((z: any) => (
              <tr key={z.id} className="border-b border-stone-light/50">
                <td className="py-3">{z.governorate}</td>
                <td className="py-3">{z.shipping_rates?.[0]?.price ?? "—"} ج.م</td>
                <td className="py-3 text-end">
                  <form
                    action={async () => {
                      "use server";
                      await deleteShippingZoneAction(z.id);
                    }}
                  >
                    <button className="text-xs text-clay underline">حذف</button>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      </section>
    </div>
  );
}
