"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { formatPrice } from "@/lib/utils/currency";
import { WishlistButton } from "@/components/product/WishlistButton";
import { QuickAddPopover } from "@/components/product/QuickAddPopover";
import { QuickViewModal } from "@/components/product/QuickViewModal";
import { useLocale } from "@/lib/i18n/LocaleContext";
import type { ProductListItem } from "@/lib/actions/catalog";

export function ProductCard({
  product,
  initialInWishlist = false,
}: {
  product: ProductListItem;
  initialInWishlist?: boolean;
}) {
  const { t, locale } = useLocale();
  const [quickAddOpen, setQuickAddOpen] = useState(false);
  const [quickViewOpen, setQuickViewOpen] = useState(false);

  const images = [...(product.product_images ?? [])].sort(
    (a, b) => a.sort_order - b.sort_order,
  );
  const primaryImage = images[0]?.url;
  const secondaryImage = images[1]?.url ?? primaryImage;

  const isOnSale =
    product.compare_at_price != null &&
    product.compare_at_price > product.base_price;

  const uniqueColors = Array.from(
    new Map(
      (product.product_variants ?? [])
        .filter((v) => v.colors)
        .map((v) => [v.color_id, v.colors!]),
    ).values(),
  );

  const totalStock = (product.product_variants ?? []).reduce((sum, v) => {
    const inv = Array.isArray(v.variant_inventory)
      ? v.variant_inventory[0]
      : v.variant_inventory;
    return sum + (inv?.quantity ?? 0);
  }, 0);

  return (
    <div className="group relative">
      <Link href={`/product/${product.slug}`} className="block">
        <div className="relative aspect-[3/4] overflow-hidden bg-stone-light">
          {primaryImage && (
            <Image
              src={primaryImage}
              alt={product.name}
              fill
              sizes="(max-width: 768px) 50vw, 25vw"
              className="object-cover transition-all duration-500 ease-editorial group-hover:scale-105 group-hover:opacity-0"
            />
          )}
          {secondaryImage && (
            <Image
              src={secondaryImage}
              alt=""
              fill
              sizes="(max-width: 768px) 50vw, 25vw"
              className="object-cover opacity-0 transition-all duration-500 ease-editorial group-hover:scale-105 group-hover:opacity-100"
            />
          )}

          {isOnSale && (
            <span className="absolute start-3 top-3 bg-clay px-2 py-1 text-xs uppercase tracking-widest2 text-bone">
              {t("product.sale")}
            </span>
          )}
          {totalStock === 0 && (
            <span className="absolute start-3 top-3 bg-ink px-2 py-1 text-xs uppercase tracking-widest2 text-bone">
              {t("product.soldOutBadge")}
            </span>
          )}

          <WishlistButton
            productId={product.id}
            initialInWishlist={initialInWishlist}
            className="absolute end-3 top-3"
          />

          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setQuickViewOpen(true);
            }}
            aria-label={locale === "en" ? "Quick view" : "معاينة سريعة"}
            className="absolute end-3 top-14 hidden h-8 w-8 items-center justify-center bg-bone/90 text-sm opacity-0 transition-opacity duration-200 ease-editorial group-hover:opacity-100 md:flex"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          </button>

          {totalStock > 0 && !quickAddOpen && (
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setQuickAddOpen(true);
              }}
              className="absolute inset-x-2 bottom-2 z-10 hidden bg-ink py-2.5 text-xs uppercase tracking-widest2 text-bone opacity-0 transition-opacity duration-200 ease-editorial group-hover:opacity-100 md:block"
            >
              {locale === "en" ? "Quick Add" : "إضافة سريعة"}
            </button>
          )}

          {quickAddOpen && (
            <QuickAddPopover
              product={product}
              image={primaryImage ?? null}
              onClose={() => setQuickAddOpen(false)}
            />
          )}
        </div>

        <div className="mt-3 flex flex-col gap-1">
          <h3 className="text-sm text-ink">{product.name}</h3>
          <div className="flex items-center gap-2 text-sm">
            <span className={isOnSale ? "text-clay" : "text-ink"}>
              {formatPrice(product.base_price, locale)}
            </span>
            {isOnSale && (
              <span className="text-stone line-through">
                {formatPrice(product.compare_at_price!, locale)}
              </span>
            )}
          </div>
          {uniqueColors.length > 0 && (
            <div className="flex gap-1.5 pt-1">
              {uniqueColors.map((c) => (
                <span
                  key={c.name}
                  title={c.name}
                  className="h-3 w-3 rounded-full border border-stone-light"
                  style={{ backgroundColor: c.hex_value ?? "#ccc" }}
                />
              ))}
            </div>
          )}
        </div>
      </Link>

      {quickViewOpen && (
        <QuickViewModal
          slug={product.slug}
          fallbackName={product.name}
          fallbackImage={primaryImage ?? null}
          onClose={() => setQuickViewOpen(false)}
        />
      )}
    </div>
  );
}
