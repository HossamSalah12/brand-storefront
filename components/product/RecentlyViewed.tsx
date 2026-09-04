"use client";

import { useEffect, useState } from "react";
import { getRecentlyViewedIds } from "@/lib/utils/recentlyViewed";
import { fetchRecentlyViewedProductsAction } from "@/lib/actions/recentlyViewed";
import { ProductGrid } from "@/components/product/ProductGrid";
import { ScrollReveal } from "@/components/layout/ScrollReveal";
import { useLocale } from "@/lib/i18n/LocaleContext";
import type { ProductListItem } from "@/lib/actions/catalog";

export function RecentlyViewed({ excludeId }: { excludeId?: string }) {
  const [products, setProducts] = useState<ProductListItem[] | null>(null);
  const { t, locale } = useLocale();

  useEffect(() => {
    const ids = getRecentlyViewedIds(excludeId);
    if (!ids.length) {
      setProducts([]);
      return;
    }
    fetchRecentlyViewedProductsAction(ids).then(setProducts);
  }, [excludeId]);

  if (!products || products.length === 0) return null;

  return (
    <ScrollReveal>
      <section className="mx-auto max-w-7xl px-6 py-[var(--space-block)]">
        <h2 className="mb-8 font-display text-xl">
          {locale === "en" ? "Recently viewed" : "شوفته قريبًا"}
        </h2>
        <ProductGrid products={products} />
      </section>
    </ScrollReveal>
  );
}
