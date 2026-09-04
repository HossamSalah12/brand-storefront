"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateOrderStatusAction, updatePaymentStatusAction } from "@/lib/actions/orders";

const ORDER_STATUSES = [
  ["pending", "قيد الانتظار"],
  ["confirmed", "تم التأكيد"],
  ["preparing", "قيد التجهيز"],
  ["shipped", "تم الشحن"],
  ["delivered", "تم التوصيل"],
  ["cancelled", "ملغي"],
  ["returned", "مرتجع"],
];

const PAYMENT_STATUSES = [
  ["pending", "قيد الانتظار"],
  ["paid", "مدفوع"],
  ["failed", "فشل"],
  ["refunded", "مسترجع"],
];

export function OrderStatusControls({
  orderId,
  status,
  paymentStatus,
}: {
  orderId: string;
  status: string;
  paymentStatus: string;
}) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleStatusChange(value: string) {
    startTransition(async () => {
      await updateOrderStatusAction(orderId, value);
      router.refresh();
    });
  }

  function handlePaymentChange(value: string) {
    startTransition(async () => {
      await updatePaymentStatusAction(orderId, value);
      router.refresh();
    });
  }

  return (
    <div className="flex flex-wrap gap-6">
      <div className="flex flex-col gap-1.5">
        <label className="text-xs uppercase tracking-widest2 text-stone">حالة الطلب</label>
        <select
          defaultValue={status}
          disabled={isPending}
          onChange={(e) => handleStatusChange(e.target.value)}
          className="border border-stone-light bg-transparent px-3 py-2 text-sm"
        >
          {ORDER_STATUSES.map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>
      <div className="flex flex-col gap-1.5">
        <label className="text-xs uppercase tracking-widest2 text-stone">حالة الدفع</label>
        <select
          defaultValue={paymentStatus}
          disabled={isPending}
          onChange={(e) => handlePaymentChange(e.target.value)}
          className="border border-stone-light bg-transparent px-3 py-2 text-sm"
        >
          {PAYMENT_STATUSES.map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
