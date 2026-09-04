import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { formatPrice } from "@/lib/utils/currency";
import { OrderStatusTimeline } from "@/components/account/OrderStatusTimeline";
import { CancelOrderButton } from "@/components/account/CancelOrderButton";
import { getLocale } from "@/lib/i18n/locale";
import { getDictionary } from "@/lib/i18n/getDictionary";

export default async function OrderDetailsPage({
  params,
}: {
  params: { id: string };
}) {
  const locale = getLocale();
  const { t } = getDictionary(locale);

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(`/account/login?redirect=/account/orders/${params.id}`);

  const { data: order } = await supabase
    .from("orders")
    .select(
      `
      id, order_number, status, payment_status, full_name, phone,
      governorate, city, full_address, subtotal, discount_amount, shipping_amount, total, created_at,
      tracking_carrier, tracking_number, tracking_url,
      order_items(product_name, color_name, size_name, quantity, unit_price, line_total)
    `,
    )
    .eq("id", params.id)
    .eq("user_id", user.id)
    .single();

  if (!order) notFound();

  return (
    <main className="mx-auto max-w-2xl px-6 py-16">
      <h1 className="mb-2 font-display text-2xl">{order.order_number}</h1>
      <p className="mb-8 text-sm text-stone">
        {new Date(order.created_at).toLocaleDateString(locale === "en" ? "en-US" : "ar-EG")}
      </p>

      <div className="mb-10">
        <OrderStatusTimeline status={order.status} />
      </div>

      {order.status === "pending" && (
        <div className="mb-10">
          <CancelOrderButton orderId={order.id} />
        </div>
      )}

      {(order.tracking_number || order.tracking_url) && (
        <div className="mb-10 border border-stone-light p-4 text-sm">
          <p className="mb-2 text-xs uppercase tracking-widest2 text-stone">
            {locale === "en" ? "Shipment tracking" : "تتبع الشحنة"}
          </p>
          {order.tracking_carrier && <p>{order.tracking_carrier}</p>}
          {order.tracking_number && <p className="text-stone">{order.tracking_number}</p>}
          {order.tracking_url && (
            <a
              href={order.tracking_url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-block text-ink underline"
            >
              {locale === "en" ? "Track your shipment" : "تتبع شحنتك"}
            </a>
          )}
        </div>
      )}

      <div className="border border-stone-light p-6">
        <div className="flex flex-col gap-3 border-b border-stone-light pb-4">
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
        <p>{t("account.shippingTo")}</p>
        <p className="mt-1 text-ink">
          {order.full_address}، {order.city}، {order.governorate}
        </p>
        <p className="mt-1">
          {t("orderConfirmation.phone")} {order.phone}
        </p>
      </div>
    </main>
  );
}
