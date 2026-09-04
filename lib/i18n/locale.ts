import { cookies } from "next/headers";

export type Locale = "ar" | "en";
export const LOCALE_COOKIE = "NEXT_LOCALE";
export const DEFAULT_LOCALE: Locale = "ar";

export function getLocale(): Locale {
  const value = cookies().get(LOCALE_COOKIE)?.value;
  return value === "en" ? "en" : DEFAULT_LOCALE;
}

export function isRtl(locale: Locale) {
  return locale === "ar";
}
