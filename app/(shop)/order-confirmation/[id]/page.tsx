import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { formatPrice } from "@/lib/utils/currency";
import { Button } from "@/components/ui/Button";
import { getLocale } from "@/lib/i18n/locale";
import { getDictionary } from "@/lib/i18n/getDictionary";

export default async function OrderConfirmationPage({
  params,
}: {
  params: { id: string };
}) {
  const locale = getLocale();
  const { t } = getDictionary(locale);

  const supabase = createClient();
  const { data: order } = await supabase
    .from("orders")
    .select(
      `
      id, order_number, full_name, phone, governorate, city, full_address,
      subtotal, discount_amount, shipping_amount, total, status, payment_method, created_at,
      order_items(product_name, color_name, size_name, quantity, unit_price, line_total)
    `,
    )
    .eq("id", params.id)
    .single();

  if (!order) notFound();

  return (
    <main className="mx-auto max-w-2xl px-6 py-16">
      <div className="mb-10 text-center">
        <p className="text-xs uppercase tracking-widest2 text-moss">{t("orderConfirmation.received")}</p>
        <h1 className="mt-2 font-display text-2xl">
          {t("orderConfirmation.thankYou", { name: order.full_name })}
        </h1>
        <p className="mt-2 text-sm text-stone">
          {t("orderConfirmation.orderNumber")} <span className="text-ink">{order.order_number}</span>
        </p>
      </div>

      <div className="border border-stone-light p-6">
        <div className="mb-4 flex justify-between text-sm">
          <span className="text-stone">{t("orderConfirmation.orderStatus")}</span>
          <span>{t(`orderStatus.${order.status}`)}</span>
        </div>
        <div className="mb-4 flex justify-between text-sm">
          <span className="text-stone">{t("orderConfirmation.payment")}</span>
          <span>{t("orderConfirmation.codLabel")}</span>
        </div>

        <div className="flex flex-col gap-3 border-y border-stone-light py-4">
          {(order.order_items ?? []).map((item: any, i: number) => (
            <div key={i} className="flex justify-between text-sm">
              <span>
                {item.product_name} ({item.color_name}/{item.size_name}) × {item.quantity}
              </span>
              <span>{formatPrice(item.line_total, locale)}</span>
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-2 pt-4 text-sm">
          <div className="flex justify-between">
            <span>{t("cart.subtotal")}</span>
            <span>{formatPrice(order.subtotal, locale)}</span>
          </div>
          {order.discount_amount > 0 && (
            <div className="flex justify-between text-moss">
              <span>{t("checkout.discount")}</span>
              <span>-{formatPrice(order.discount_amount, locale)}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span>{t("checkout.shipping")}</span>
            <span>{order.shipping_amount === 0 ? t("checkout.free") : formatPrice(order.shipping_amount, locale)}</span>
          </div>
          <div className="flex justify-between border-t border-stone-light pt-2 font-display text-base">
            <span>{t("checkout.total")}</span>
            <span>{formatPrice(order.total, locale)}</span>
          </div>
        </div>
      </div>

      <div className="mt-6 text-sm text-stone">
        <p>{t("orderConfirmation.deliverTo")}</p>
        <p className="mt-1 text-ink">
          {order.full_address}، {order.city}، {order.governorate}
        </p>
        <p className="mt-1">
          {t("orderConfirmation.phone")} {order.phone}
        </p>
      </div>

      <Link href="/shop">
        <Button size="lg" className="mt-10 w-full">
          {t("orderConfirmation.continueShopping")}
        </Button>
      </Link>
    </main>
  );
}
