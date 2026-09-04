"use client";

import { useEffect, useMemo, useState } from "react";
import { clsx } from "clsx";
import { useLocale } from "@/lib/i18n/LocaleContext";

export type ProductVariant = {
  id: string;
  color_id: string;
  size_id: string;
  sku: string;
  price_override: number | null;
  colors: { name: string; hex_value: string | null } | null;
  sizes: { name: string; sort_order: number } | null;
  variant_inventory: { quantity: number } | { quantity: number }[] | null;
};

function stockOf(v: ProductVariant) {
  const inv = Array.isArray(v.variant_inventory)
    ? v.variant_inventory[0]
    : v.variant_inventory;
  return inv?.quantity ?? 0;
}

export function VariantSelector({
  variants,
  onSelect,
}: {
  variants: ProductVariant[];
  onSelect: (variant: ProductVariant | null, quantity: number) => void;
}) {
  const { t } = useLocale();

  const colors = useMemo(() => {
    const map = new Map<string, { name: string; hex: string | null }>();
    variants.forEach((v) => {
      if (v.colors) map.set(v.color_id, { name: v.colors.name, hex: v.colors.hex_value });
    });
    return Array.from(map.entries());
  }, [variants]);

  const sizes = useMemo(() => {
    const map = new Map<string, { name: string; sort: number }>();
    variants.forEach((v) => {
      if (v.sizes) map.set(v.size_id, { name: v.sizes.name, sort: v.sizes.sort_order });
    });
    return Array.from(map.entries()).sort((a, b) => a[1].sort - b[1].sort);
  }, [variants]);

  const [colorId, setColorId] = useState(colors[0]?.[0] ?? "");
  const [sizeId, setSizeId] = useState<string>("");
  const [quantity, setQuantity] = useState(1);

  const selectedVariant = useMemo(
    () => variants.find((v) => v.color_id === colorId && v.size_id === sizeId) ?? null,
    [variants, colorId, sizeId],
  );
  const stock = selectedVariant ? stockOf(selectedVariant) : null;

  useEffect(() => {
    setQuantity(1);
  }, [selectedVariant]);

  useEffect(() => {
    onSelect(selectedVariant, quantity);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedVariant, quantity]);

  function isSizeAvailable(sId: string) {
    const v = variants.find((vv) => vv.color_id === colorId && vv.size_id === sId);
    return v ? stockOf(v) > 0 : false;
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="mb-2 text-xs uppercase tracking-widest2 text-stone">{t("product.color")}</p>
        <div className="flex gap-2">
          {colors.map(([id, c]) => (
            <button
              key={id}
              type="button"
              onClick={() => setColorId(id)}
              title={c.name}
              className={clsx(
                "h-9 w-9 rounded-full border-2 transition-transform duration-150 ease-editorial",
                colorId === id ? "scale-110 border-ink" : "border-stone-light",
              )}
              style={{ backgroundColor: c.hex ?? "#ccc" }}
            />
          ))}
        </div>
      </div>

      <div>
        <p className="mb-2 text-xs uppercase tracking-widest2 text-stone">{t("product.size")}</p>
        <div className="flex flex-wrap gap-2">
          {sizes.map(([id, s]) => {
            const available = isSizeAvailable(id);
            return (
              <button
                key={id}
                type="button"
                disabled={!available}
                onClick={() => setSizeId(id)}
                className={clsx(
                  "border px-4 py-2 text-sm transition-colors duration-150 ease-editorial",
                  sizeId === id
                    ? "border-ink bg-ink text-bone"
                    : "border-stone-light",
                  !available && "cursor-not-allowed text-stone line-through",
                )}
              >
                {s.name}
              </button>
            );
          })}
        </div>
      </div>

      {selectedVariant && (
        <div>
          <p
            className={clsx(
              "text-sm",
              stock === 0 ? "text-clay" : stock! <= 5 ? "text-clay" : "text-moss",
            )}
          >
            {stock === 0
              ? t("product.outOfStock")
              : stock! <= 5
                ? t("product.lowStock", { n: stock! })
                : t("product.inStock")}
          </p>
        </div>
      )}

      {selectedVariant && stock! > 0 && (
        <div>
          <p className="mb-2 text-xs uppercase tracking-widest2 text-stone">{t("product.quantity")}</p>
          <div className="flex w-32 items-center border border-stone-light">
            <button
              type="button"
              className="flex-1 py-2 text-sm"
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            >
              −
            </button>
            <span className="flex-1 text-center text-sm">{quantity}</span>
            <button
              type="button"
              className="flex-1 py-2 text-sm"
              onClick={() => setQuantity((q) => Math.min(stock!, q + 1))}
            >
              +
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
