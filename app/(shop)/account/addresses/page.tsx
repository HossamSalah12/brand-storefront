import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AddressForm } from "@/components/account/AddressForm";
import { AddressCard } from "@/components/account/AddressCard";
import { getLocale } from "@/lib/i18n/locale";
import { getDictionary } from "@/lib/i18n/getDictionary";

export default async function AddressesPage() {
  const locale = getLocale();
  const { t } = getDictionary(locale);

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/account/login?redirect=/account/addresses");

  const { data: addresses } = await supabase
    .from("addresses")
    .select("id, full_name, phone, governorate, city, full_address, building, apartment, floor, landmark, is_default")
    .eq("user_id", user.id)
    .order("is_default", { ascending: false });

  return (
    <main className="mx-auto max-w-2xl px-6 py-16">
      <h1 className="mb-8 font-display text-2xl">{t("account.myAddresses")}</h1>

      <div className="mb-10 flex flex-col gap-4">
        {(addresses ?? []).map((addr) => (
          <AddressCard key={addr.id} address={addr} />
        ))}
        {!addresses?.length && <p className="text-sm text-stone">{t("account.noAddresses")}</p>}
      </div>

      <section>
        <h2 className="mb-4 font-display text-lg">{t("account.addAddress")}</h2>
        <AddressForm />
      </section>
    </main>
  );
}
