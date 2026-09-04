"use client";

import Link from "next/link";
import { useCart } from "@/lib/cart/CartContext";
import { formatPrice } from "@/lib/utils/currency";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { useLocale } from "@/lib/i18n/LocaleContext";

export default function CartPage() {
  const { items, removeItem, updateQuantity, subtotal } = useCart();
  const { t, locale } = useLocale();

  if (items.length === 0) {
    return (
      <main className="mx-auto max-w-3xl px-6 py-24">
        <h1 className="mb-8 font-display text-2xl">{t("cart.title")}</h1>
        <EmptyState
          title={t("cart.empty")}
          description={t("cart.emptyDescription")}
          action={
            <Link href="/shop">
              <Button size="sm">{t("common.shopNow")}</Button>
            </Link>
          }
        />
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-5xl px-6 py-12">
      <h1 className="mb-8 font-display text-2xl">{t("cart.title")}</h1>

      <div className="grid gap-10 md:grid-cols-3">
        <div className="md:col-span-2">
          {items.map((item) => (
            <div
              key={item.variantId}
              className="flex gap-4 border-b border-stone-light py-6"
            >
              <div className="h-32 w-24 shrink-0 bg-stone-light">
                {item.image && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={item.image} alt="" className="h-full w-full object-cover" />
                )}
              </div>
              <div className="flex flex-1 flex-col gap-2">
                <div className="flex justify-between">
                  <div>
                    <Link href={`/product/${item.productSlug}`} className="text-sm">
                      {item.productName}
                    </Link>
                    <p className="text-xs text-stone">
                      {item.colorName} / {item.sizeName}
                    </p>
                  </div>
                  <span className="text-sm">{formatPrice(item.unitPrice, locale)}</span>
                </div>

                <div className="mt-auto flex items-center justify-between">
                  <div className="flex items-center border border-stone-light">
                    <button
                      className="px-3 py-1.5 text-sm"
                      onClick={() => updateQuantity(item.variantId, item.quantity - 1)}
                    >
                      −
                    </button>
                    <span className="px-3 text-sm">{item.quantity}</span>
                    <button
                      className="px-3 py-1.5 text-sm"
                      onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
                      disabled={item.quantity >= item.maxStock}
                    >
                      +
                    </button>
                  </div>
                  <button
                    onClick={() => removeItem(item.variantId)}
                    className="text-xs text-stone underline"
                  >
                    {t("common.remove")}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="h-fit border border-stone-light p-6">
          <div className="flex justify-between text-sm">
            <span>{t("cart.subtotal")}</span>
            <span>{formatPrice(subtotal, locale)}</span>
          </div>
          <p className="mt-2 text-xs text-stone">{t("cart.shippingNote")}</p>
          <Link href="/checkout">
            <Button size="lg" className="mt-6 w-full">
              {t("cart.checkout")}
            </Button>
          </Link>
        </div>
      </div>
    </main>
  );
}
