import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { formatPrice } from "@/lib/utils/currency";
import { OrderStatusControls } from "@/components/admin/OrderStatusControls";
import { TrackingForm } from "@/components/admin/TrackingForm";

export default async function AdminOrderDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = createClient();
  const { data: order } = await supabase
    .from("orders")
    .select(
      `
      id, order_number, status, payment_status, payment_method,
      full_name, phone, email, governorate, city, full_address, building, apartment, floor, landmark,
      subtotal, discount_amount, shipping_amount, total, created_at,
      tracking_carrier, tracking_number, tracking_url,
      order_items(product_name, color_name, size_name, sku, quantity, unit_price, line_total)
    `,
    )
    .eq("id", params.id)
    .single();

  if (!order) notFound();

  return (
    <div className="max-w-3xl">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-display text-2xl">{order.order_number}</h1>
        <span className="text-sm text-stone">
          {new Date(order.created_at).toLocaleString("ar-EG")}
        </span>
      </div>

      <div className="mb-8">
        <OrderStatusControls
          orderId={order.id}
          status={order.status}
          paymentStatus={order.payment_status}
        />
      </div>

      <div className="mb-8 border border-stone-light p-4">
        <p className="mb-3 text-xs uppercase tracking-widest2 text-stone">بيانات الشحن</p>
        <TrackingForm
          orderId={order.id}
          defaultCarrier={order.tracking_carrier ?? ""}
          defaultNumber={order.tracking_number ?? ""}
          defaultUrl={order.tracking_url ?? ""}
        />
      </div>

      <div className="mb-8 grid grid-cols-2 gap-8 text-sm">
        <div>
          <p className="mb-2 text-xs uppercase tracking-widest2 text-stone">العميل</p>
          <p>{order.full_name}</p>
          <p>{order.phone}</p>
          {order.email && <p>{order.email}</p>}
        </div>
        <div>
          <p className="mb-2 text-xs uppercase tracking-widest2 text-stone">عنوان الشحن</p>
          <p>{order.full_address}</p>
          <p>
            {order.city}، {order.governorate}
          </p>
          {order.building && <p>مبنى {order.building}</p>}
          {order.apartment && <p>شقة {order.apartment}</p>}
          {order.floor && <p>دور {order.floor}</p>}
          {order.landmark && <p className="text-stone">{order.landmark}</p>}
        </div>
      </div>

      
      <div className="overflow-x-auto">

        <table className="min-w-[640px] w-full text-sm">
        <thead>
          <tr className="border-b border-stone-light text-start text-xs uppercase tracking-widest2 text-stone">
            <th className="pb-3 text-start">المنتج</th>
            <th className="pb-3 text-start">SKU</th>
            <th className="pb-3 text-start">الكمية</th>
            <th className="pb-3 text-start">السعر</th>
            <th className="pb-3 text-start">الإجمالي</th>
          </tr>
        </thead>
        <tbody>
          {(order.order_items ?? []).map((item: any, i: number) => (
            <tr key={i} className="border-b border-stone-light/50">
              <td className="py-3">
                {item.product_name} ({item.color_name}/{item.size_name})
              </td>
              <td className="py-3 text-xs text-stone">{item.sku}</td>
              <td className="py-3">{item.quantity}</td>
              <td className="py-3">{formatPrice(item.unit_price)}</td>
              <td className="py-3">{formatPrice(item.line_total)}</td>
            </tr>
          ))}
        </tbody>
      </table>
        </div>

      <div className="mt-6 flex flex-col gap-2 border-t border-stone-light pt-4 text-sm">
        <div className="flex justify-between">
          <span>الإجمالي الفرعي</span>
          <span>{formatPrice(order.subtotal)}</span>
        </div>
        {order.discount_amount > 0 && (
          <div className="flex justify-between text-moss">
            <span>الخصم</span>
            <span>-{formatPrice(order.discount_amount)}</span>
          </div>
        )}
        <div className="flex justify-between">
          <span>الشحن</span>
          <span>{formatPrice(order.shipping_amount)}</span>
        </div>
        <div className="flex justify-between border-t border-stone-light pt-2 font-display text-base">
          <span>الإجمالي</span>
          <span>{formatPrice(order.total)}</span>
        </div>
      </div>
    </div>
  );
}
