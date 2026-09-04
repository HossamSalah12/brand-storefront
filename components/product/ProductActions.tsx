"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { VariantSelector, type ProductVariant } from "@/components/product/VariantSelector";
import { Button } from "@/components/ui/Button";
import { WishlistButton } from "@/components/product/WishlistButton";
import { useCart } from "@/lib/cart/CartContext";
import { useToast } from "@/lib/toast/ToastContext";
import { useLocale } from "@/lib/i18n/LocaleContext";

function stockOf(v: ProductVariant) {
  const inv = Array.isArray(v.variant_inventory) ? v.variant_inventory[0] : v.variant_inventory;
  return inv?.quantity ?? 0;
}

export function ProductActions({
  productId,
  productSlug,
  productName,
  image,
  basePrice,
  variants,
  initialInWishlist = false,
}: {
  productId: string;
  productSlug: string;
  productName: string;
  image: string | null;
  basePrice: number;
  variants: ProductVariant[];
  initialInWishlist?: boolean;
}) {
  const [selected, setSelected] = useState<ProductVariant | null>(null);
  const [quantity, setQuantity] = useState(1);
  const { addItem } = useCart();
  const { showToast } = useToast();
  const router = useRouter();
  const { t } = useLocale();

  function buildCartItem() {
    if (!selected) return null;
    return {
      variantId: selected.id,
      productSlug,
      productName,
      colorName: selected.colors?.name ?? null,
      sizeName: selected.sizes?.name ?? null,
      sku: selected.sku,
      unitPrice: selected.price_override ?? basePrice,
      image,
      maxStock: stockOf(selected),
    };
  }

  function handleAddToCart() {
    const item = buildCartItem();
    if (!item) {
      showToast(t("product.selectFirst"), "error");
      return;
    }
    addItem(item, quantity);
    showToast(t("product.addedToCart"), "success");
  }

  function handleBuyNow() {
    const item = buildCartItem();
    if (!item) {
      showToast(t("product.selectFirst"), "error");
      return;
    }
    addItem(item, quantity);
    router.push("/checkout");
  }

  return (
    <div className="flex flex-col gap-6">
      <VariantSelector
        variants={variants}
        onSelect={(v, q) => {
          setSelected(v);
          setQuantity(q);
        }}
      />

      <div className="flex gap-3 md:static fixed inset-x-0 bottom-0 z-40 border-t border-stone-light bg-bone p-4 md:border-t-0 md:bg-transparent md:p-0">
        <Button size="lg" className="flex-1" onClick={handleAddToCart}>
          {t("product.addToCart")}
        </Button>
        <Button variant="secondary" size="lg" className="flex-1" onClick={handleBuyNow}>
          {t("product.buyNow")}
        </Button>
        <WishlistButton
          productId={productId}
          initialInWishlist={initialInWishlist}
          className="static h-auto w-auto border border-stone-light px-4 py-3"
        />
      </div>
    </div>
  );
}
