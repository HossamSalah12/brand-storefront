"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { cancelOwnOrderAction } from "@/lib/actions/account";
import { useLocale } from "@/lib/i18n/LocaleContext";

export function CancelOrderButton({ orderId }: { orderId: string }) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [confirming, setConfirming] = useState(false);
  const router = useRouter();
  const { locale } = useLocale();

  function handleClick() {
    if (!confirming) {
      setConfirming(true);
      return;
    }
    startTransition(async () => {
      try {
        await cancelOwnOrderAction(orderId);
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : "تعذر إلغاء الطلب");
      }
    });
  }

  return (
    <div className="flex flex-col items-start gap-2">
      <button
        onClick={handleClick}
        disabled={isPending}
        className="text-sm text-clay underline disabled:opacity-40"
      >
        {isPending
          ? locale === "en" ? "Cancelling..." : "جارٍ الإلغاء..."
          : confirming
            ? locale === "en" ? "Click again to confirm cancellation" : "دوس تاني للتأكيد"
            : locale === "en" ? "Cancel order" : "إلغاء الطلب"}
      </button>
      {error && <p className="text-xs text-clay">{error}</p>}
    </div>
  );
}
