import type { Locale } from "@/lib/i18n/locale";

export function formatPrice(value: number, locale: Locale = "ar"): string {
  const formatted = value.toLocaleString("en-US", { minimumFractionDigits: 0 });
  return locale === "en" ? `${formatted} EGP` : `${formatted} ج.م`;
}
