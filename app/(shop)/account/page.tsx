import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { logoutAction } from "@/lib/actions/auth";
import { ProfileForm } from "@/components/account/ProfileForm";
import { getLocale } from "@/lib/i18n/locale";
import { getDictionary } from "@/lib/i18n/getDictionary";

export default async function AccountPage() {
  const locale = getLocale();
  const { t } = getDictionary(locale);

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/account/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, phone, role")
    .eq("id", user.id)
    .single();

  return (
    <main className="mx-auto max-w-2xl px-6 py-16">
      <div className="mb-10 flex items-center justify-between">
        <h1 className="font-display text-2xl">{t("account.welcome", { name: profile?.full_name ?? "" })}</h1>
        <form action={logoutAction}>
          <button className="text-xs text-stone underline">{t("account.logout")}</button>
        </form>
      </div>

      <nav className="mb-10 grid grid-cols-3 gap-4 text-center text-sm">
        <Link href="/account/orders" className="border border-stone-light py-4">
          {t("account.myOrders")}
        </Link>
        <Link href="/account/addresses" className="border border-stone-light py-4">
          {t("account.myAddresses")}
        </Link>
        <Link href="/account/wishlist" className="border border-stone-light py-4">
          {t("account.wishlist")}
        </Link>
      </nav>

      {profile?.role === "admin" && (
        <Link href="/admin" className="mb-10 block text-sm underline">
          {t("account.goToAdmin")}
        </Link>
      )}

      <section>
        <h2 className="mb-4 font-display text-lg">{t("account.personalInfo")}</h2>
        <ProfileForm defaultFullName={profile?.full_name ?? ""} defaultPhone={profile?.phone ?? ""} />
      </section>
    </main>
  );
}
