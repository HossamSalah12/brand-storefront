"use client";

import { formatPrice } from "@/lib/utils/currency";
import { useLocale } from "@/lib/i18n/LocaleContext";

export function AnnouncementBar({ freeShippingThreshold }: { freeShippingThreshold: number }) {
  const { t, locale } = useLocale();

  if (freeShippingThreshold <= 0) return null;

  return (
    <div className="bg-navy px-4 py-2 text-center text-xs uppercase tracking-widest2 text-bone">
      {locale === "en"
        ? `Free shipping on orders over ${formatPrice(freeShippingThreshold, locale)}`
        : `شحن مجاني للطلبات فوق ${formatPrice(freeShippingThreshold, locale)}`}
    </div>
  );
}
