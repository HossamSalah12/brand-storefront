import { getShippingZones, getStoreSettings } from "@/lib/actions/settings";
import { CheckoutForm } from "@/components/checkout/CheckoutForm";
import { getLocale } from "@/lib/i18n/locale";
import { getDictionary } from "@/lib/i18n/getDictionary";
import { createClient } from "@/lib/supabase/server";

export default async function CheckoutPage() {
  const locale = getLocale();
  const { t } = getDictionary(locale);
  const [zones, settings] = await Promise.all([getShippingZones(), getStoreSettings()]);

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let savedAddresses: {
    id: string;
    full_name: string;
    phone: string;
    governorate: string;
    city: string;
    full_address: string;
    building: string | null;
    apartment: string | null;
    floor: string | null;
    landmark: string | null;
    is_default: boolean;
  }[] = [];

  if (user) {
    const { data } = await supabase
      .from("addresses")
      .select("id, full_name, phone, governorate, city, full_address, building, apartment, floor, landmark, is_default")
      .eq("user_id", user.id)
      .order("is_default", { ascending: false });
    savedAddresses = data ?? [];
  }

  return (
    <main className="mx-auto max-w-5xl px-6 py-12">
      <h1 className="mb-8 font-display text-2xl">{t("checkout.title")}</h1>
      <CheckoutForm
        zones={zones}
        freeShippingThreshold={settings.freeShippingThreshold}
        defaultShippingPrice={settings.defaultShippingPrice}
        savedAddresses={savedAddresses}
        defaultEmail={user?.email ?? ""}
      />
    </main>
  );
}
