"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useCart } from "@/lib/cart/CartContext";
import { formatPrice } from "@/lib/utils/currency";
import { Button } from "@/components/ui/Button";
import { FreeShippingProgress } from "@/components/cart/FreeShippingProgress";
import { useLocale } from "@/lib/i18n/LocaleContext";

export function CartDrawer({ freeShippingThreshold }: { freeShippingThreshold: number }) {
  const { items, removeItem, updateQuantity, subtotal, isDrawerOpen, closeDrawer } = useCart();
  const { t, isRtl, locale } = useLocale();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (isDrawerOpen) {
      const id = requestAnimationFrame(() => setVisible(true));
      return () => cancelAnimationFrame(id);
    }
    setVisible(false);
  }, [isDrawerOpen]);

  if (!isDrawerOpen) return null;

  // The drawer sits at the inline-end edge (flex justify-end respects
  // dir automatically), so its hidden offscreen position must be toward
  // whichever physical side that actually is: left in RTL, right in LTR.
  const hiddenTransform = isRtl ? "-translate-x-full" : "translate-x-full";

  return (
    <div
      className={`fixed inset-0 z-50 flex justify-end bg-ink/40 transition-opacity duration-300 ease-editorial ${
        visible ? "opacity-100" : "opacity-0"
      }`}
      onClick={closeDrawer}
    >
      <div
        className={`flex h-full w-full max-w-md flex-col bg-bone p-6 transition-transform duration-300 ease-editorial ${
          visible ? "translate-x-0" : hiddenTransform
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-6 flex items-center justify-between">
          <h2 className="font-display text-xl">
            {t("cart.title")} ({items.length})
          </h2>
          <button onClick={closeDrawer} className="text-2xl leading-none" aria-label={t("common.close")}>
            ×
          </button>
        </div>

        {freeShippingThreshold > 0 && (
          <div className="mb-6">
            <FreeShippingProgress subtotal={subtotal} threshold={freeShippingThreshold} />
          </div>
        )}

        {items.length === 0 ? (
          <p className="flex-1 text-sm text-stone">{t("cart.empty")}</p>
        ) : (
          <div className="flex-1 overflow-y-auto">
            {items.map((item) => (
              <div key={item.variantId} className="flex gap-3 border-b border-stone-light/50 py-4">
                <div className="h-20 w-16 shrink-0 bg-stone-light">
                  {item.image && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={item.image} alt="" className="h-full w-full object-cover" />
                  )}
                </div>
                <div className="flex flex-1 flex-col gap-1">
                  <p className="text-sm">{item.productName}</p>
                  <p className="text-xs text-stone">
                    {item.colorName} / {item.sizeName}
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center border border-stone-light">
                      <button
                        className="px-2 py-1 text-xs transition-colors hover:bg-stone-light"
                        onClick={() => updateQuantity(item.variantId, item.quantity - 1)}
                      >
                        −
                      </button>
                      <span className="px-2 text-xs">{item.quantity}</span>
                      <button
                        className="px-2 py-1 text-xs transition-colors hover:bg-stone-light"
                        onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
                        disabled={item.quantity >= item.maxStock}
                      >
                        +
                      </button>
                    </div>
                    <span className="text-sm">{formatPrice(item.unitPrice * item.quantity, locale)}</span>
                  </div>
                  <button
                    onClick={() => removeItem(item.variantId)}
                    className="self-start text-xs text-stone underline transition-colors hover:text-clay"
                  >
                    {t("common.remove")}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {items.length > 0 && (
          <div className="border-t border-stone-light pt-4">
            <div className="mb-4 flex justify-between text-sm">
              <span>{t("cart.subtotal")}</span>
              <span>{formatPrice(subtotal, locale)}</span>
            </div>
            <Link href="/checkout" onClick={closeDrawer}>
              <Button size="lg" className="w-full">
                {t("cart.checkout")}
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
