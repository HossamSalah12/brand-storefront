"use server";

import { getProductBySlug } from "@/lib/actions/catalog";
import { getLocale } from "@/lib/i18n/locale";

export async function fetchQuickViewProductAction(slug: string) {
  const locale = getLocale();
  return getProductBySlug(slug, locale);
}
