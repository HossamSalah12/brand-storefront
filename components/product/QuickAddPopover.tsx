"use client";

import { useEffect, useRef, useState } from "react";
import { useCart } from "@/lib/cart/CartContext";
import { useToast } from "@/lib/toast/ToastContext";
import { useLocale } from "@/lib/i18n/LocaleContext";
import type { ProductListItem } from "@/lib/actions/catalog";

function stockOf(v: ProductListItem["product_variants"][number]) {
  const inv = Array.isArray(v.variant_inventory) ? v.variant_inventory[0] : v.variant_inventory;
  return inv?.quantity ?? 0;
}

export function QuickAddPopover({
  product,
  image,
  onClose,
}: {
  product: ProductListItem;
  image: string | null;
  onClose: () => void;
}) {
  const { addItem } = useCart();
  const { showToast } = useToast();
  const { t, locale } = useLocale();
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const id = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(id);
  }, []);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [onClose]);

  // Default to the first color that has any stock at all, then list its sizes.
  const firstColorId = product.product_variants.find((v) => stockOf(v) > 0)?.color_id
    ?? product.product_variants[0]?.color_id;
  const sizeOptions = product.product_variants
    .filter((v) => v.color_id === firstColorId)
    .sort((a, b) => (a.sizes?.sort_order ?? 0) - (b.sizes?.sort_order ?? 0));

  function handlePick(variant: ProductListItem["product_variants"][number]) {
    const stock = stockOf(variant);
    if (stock <= 0) return;
    addItem(
      {
        variantId: variant.id,
        productSlug: product.slug,
        productName: product.name,
        colorName: variant.colors?.name ?? null,
        sizeName: variant.sizes?.name ?? null,
        sku: variant.sku,
        unitPrice: variant.price_override ?? product.base_price,
        image: variant.image_url ?? image,
        maxStock: stock,
      },
      1,
    );
    showToast(t("product.addedToCart"), "success");
    onClose();
  }

  if (!sizeOptions.length) return null;

  return (
    <div
      ref={ref}
      className={`absolute inset-x-2 bottom-2 z-20 bg-bone p-3 shadow-sm transition-all duration-200 ease-editorial ${
        visible ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"
      }`}
      onClick={(e) => e.stopPropagation()}
    >
      <p className="mb-2 text-[10px] uppercase tracking-widest2 text-stone">
        {locale === "en" ? "Select size" : "اختر المقاس"}
      </p>
      <div className="flex flex-wrap gap-1.5">
        {sizeOptions.map((v) => {
          const inStock = stockOf(v) > 0;
          return (
            <button
              key={v.id}
              onClick={() => handlePick(v)}
              disabled={!inStock}
              className={`border px-2.5 py-1.5 text-xs ${
                inStock
                  ? "border-stone-light hover:border-ink"
                  : "cursor-not-allowed border-stone-light text-stone line-through"
              }`}
            >
              {v.sizes?.name}
            </button>
          );
        })}
      </div>
    </div>
  );
}
