"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { fetchQuickViewProductAction } from "@/lib/actions/quickview";
import { VariantSelector, type ProductVariant } from "@/components/product/VariantSelector";
import { WishlistButton } from "@/components/product/WishlistButton";
import { Button } from "@/components/ui/Button";
import { useCart } from "@/lib/cart/CartContext";
import { useToast } from "@/lib/toast/ToastContext";
import { useLocale } from "@/lib/i18n/LocaleContext";
import { formatPrice } from "@/lib/utils/currency";

export function QuickViewModal({
  slug,
  fallbackName,
  fallbackImage,
  onClose,
}: {
  slug: string;
  fallbackName: string;
  fallbackImage: string | null;
  onClose: () => void;
}) {
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [visible, setVisible] = useState(false);
  const [selected, setSelected] = useState<ProductVariant | null>(null);
  const [quantity, setQuantity] = useState(1);

  const { addItem } = useCart();
  const { showToast } = useToast();
  const { t, locale } = useLocale();

  useEffect(() => {
    const id = requestAnimationFrame(() => setVisible(true));
    fetchQuickViewProductAction(slug).then((p) => {
      setProduct(p);
      setLoading(false);
    });
    document.body.style.overflow = "hidden";
    return () => {
      cancelAnimationFrame(id);
      document.body.style.overflow = "";
    };
  }, [slug]);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  function handleAddToCart() {
    if (!selected || !product) {
      showToast(t("product.selectFirst"), "error");
      return;
    }
    const inv = Array.isArray(selected.variant_inventory)
      ? selected.variant_inventory[0]
      : selected.variant_inventory;
    addItem(
      {
        variantId: selected.id,
        productSlug: product.slug,
        productName: product.name,
        colorName: selected.colors?.name ?? null,
        sizeName: selected.sizes?.name ?? null,
        sku: selected.sku,
        unitPrice: selected.price_override ?? product.base_price,
        image: product.product_images?.[0]?.url ?? fallbackImage,
        maxStock: inv?.quantity ?? 0,
      },
      quantity,
    );
    showToast(t("product.addedToCart"), "success");
    onClose();
  }

  const image = product?.product_images?.[0]?.url ?? fallbackImage;
  const isOnSale =
    product?.compare_at_price != null && product.compare_at_price > product.base_price;

  return (
    <div
      className={`fixed inset-0 z-[150] flex items-end justify-center bg-ink/40 transition-opacity duration-300 ease-editorial md:items-center ${
        visible ? "opacity-100" : "opacity-0"
      }`}
      onClick={onClose}
    >
      <div
        className={`relative grid max-h-[90vh] w-full max-w-3xl grid-cols-1 overflow-y-auto bg-bone transition-all duration-300 ease-editorial md:grid-cols-2 ${
          visible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0 md:translate-y-0 md:scale-95"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          aria-label={t("common.close")}
          className="absolute end-4 top-4 z-10 flex h-8 w-8 items-center justify-center bg-bone/90 text-xl leading-none text-ink shadow-sm"
        >
          ×
        </button>

        <div className="relative aspect-[3/4] bg-stone-light">
          {image && <Image src={image} alt={fallbackName} fill sizes="50vw" className="object-cover" />}
        </div>

        <div className="flex flex-col gap-4 p-6">
          <h2 className="font-display text-2xl">{product?.name ?? fallbackName}</h2>

          {loading ? (
            <div className="flex flex-col gap-3">
              <div className="h-4 w-24 animate-pulse bg-stone-light" />
              <div className="h-20 w-full animate-pulse bg-stone-light/60" />
              <div className="h-9 w-full animate-pulse bg-stone-light/60" />
            </div>
          ) : product ? (
            <>
              <div className="flex items-center gap-3">
                <span className={isOnSale ? "text-clay" : "text-ink"}>
                  {formatPrice(product.base_price, locale)}
                </span>
                {isOnSale && (
                  <span className="text-stone line-through">
                    {formatPrice(product.compare_at_price, locale)}
                  </span>
                )}
              </div>

              {product.description && (
                <p className="text-sm text-stone">{product.description}</p>
              )}

              <VariantSelector
                variants={(product.product_variants ?? []) as ProductVariant[]}
                onSelect={(v, q) => {
                  setSelected(v);
                  setQuantity(q);
                }}
              />

              <div className="mt-2 flex gap-3">
                <Button size="lg" className="flex-1" onClick={handleAddToCart}>
                  {t("product.addToCart")}
                </Button>
                <WishlistButton
                  productId={product.id}
                  className="static h-auto w-auto border border-stone-light px-4 py-3"
                />
              </div>

              <Link href={`/product/${product.slug}`} className="text-center text-xs text-stone underline">
                {locale === "en" ? "View full details" : "عرض التفاصيل الكاملة"}
              </Link>
            </>
          ) : (
            <p className="text-sm text-clay">
              {locale === "en" ? "Couldn't load this product." : "تعذر تحميل هذا المنتج."}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
