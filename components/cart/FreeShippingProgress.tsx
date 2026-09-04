"use client";

import { formatPrice } from "@/lib/utils/currency";
import { useLocale } from "@/lib/i18n/LocaleContext";

export function FreeShippingProgress({
  subtotal,
  threshold,
}: {
  subtotal: number;
  threshold: number;
}) {
  const { t, locale } = useLocale();
  if (threshold <= 0) return null;

  const remaining = threshold - subtotal;
  const percent = Math.min(100, Math.round((subtotal / threshold) * 100));

  return (
    <div className="flex flex-col gap-2">
      <p className="text-xs text-stone">
        {remaining > 0
          ? t("cart.freeShippingRemaining", { amount: formatPrice(Math.ceil(remaining), locale) })
          : t("cart.freeShippingUnlocked")}
      </p>
      <div className="h-1 w-full bg-stone-light">
        <div
          className="h-1 bg-moss transition-all duration-300 ease-editorial"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
