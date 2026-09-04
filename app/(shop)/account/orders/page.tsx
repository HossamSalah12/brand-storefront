import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { formatPrice } from "@/lib/utils/currency";
import { EmptyState } from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/Button";
import { getLocale } from "@/lib/i18n/locale";
import { getDictionary } from "@/lib/i18n/getDictionary";

export default async function OrdersPage() {
  const locale = getLocale();
  const { t } = getDictionary(locale);

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/account/login?redirect=/account/orders");

  const { data: orders } = await supabase
    .from("orders")
    .select("id, order_number, status, total, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="mb-8 font-display text-2xl">{t("account.myOrders")}</h1>

      {!orders?.length ? (
        <EmptyState
          title={t("account.noOrders")}
          description={t("account.noOrdersDescription")}
          action={
            <Link href="/shop">
              <Button size="sm">{t("common.shopNow")}</Button>
            </Link>
          }
        />
      ) : (
        <div className="flex flex-col">
          {orders.map((order) => (
            <Link
              key={order.id}
              href={`/account/orders/${order.id}`}
              className="flex items-center justify-between border-b border-stone-light py-4 text-sm"
            >
              <div>
                <p>{order.order_number}</p>
                <p className="text-xs text-stone">
                  {new Date(order.created_at).toLocaleDateString(locale === "en" ? "en-US" : "ar-EG")}
                </p>
              </div>
              <span className="text-stone">{t(`orderStatus.${order.status}`)}</span>
              <span>{formatPrice(order.total, locale)}</span>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
