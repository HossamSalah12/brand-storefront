"use server";

import { getProductsByIds } from "@/lib/actions/catalog";
import { getLocale } from "@/lib/i18n/locale";

export async function fetchRecentlyViewedProductsAction(ids: string[]) {
  const locale = getLocale();
  return getProductsByIds(ids, locale);
}
