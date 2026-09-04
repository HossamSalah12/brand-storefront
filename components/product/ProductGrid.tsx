"use client";

import { ProductCard } from "@/components/product/ProductCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { useLocale } from "@/lib/i18n/LocaleContext";
import type { ProductListItem } from "@/lib/actions/catalog";

export function ProductGrid({
  products,
  wishlistedIds,
}: {
  products: ProductListItem[];
  wishlistedIds?: Set<string>;
}) {
  const { locale } = useLocale();

  if (!products.length) {
    return (
      <EmptyState
        title={locale === "en" ? "No products found" : "لا توجد منتجات"}
        description={
          locale === "en"
            ? "Try changing the filters or searching a different term."
            : "جرّب تغيير الفلاتر أو البحث بكلمة مختلفة."
        }
      />
    );
  }

  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 lg:grid-cols-4">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          initialInWishlist={wishlistedIds?.has(product.id) ?? false}
        />
      ))}
    </div>
  );
}
