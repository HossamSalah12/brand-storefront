"use client";

import { useState, useTransition } from "react";
import { updateVariantStockAction } from "@/lib/actions/products";

export function InventoryRow({
  variantId,
  productName,
  colorSize,
  sku,
  quantity,
  lowStockThreshold,
}: {
  variantId: string;
  productName: string;
  colorSize: string;
  sku: string;
  quantity: number;
  lowStockThreshold: number;
}) {
  const [value, setValue] = useState(quantity);
  const [isPending, startTransition] = useTransition();
  const isLow = value <= lowStockThreshold;

  function save() {
    startTransition(async () => {
      await updateVariantStockAction(variantId, value);
    });
  }

  return (
    <tr className="border-b border-stone-light/50">
      <td className="py-3">{productName}</td>
      <td className="py-3 text-stone">{colorSize}</td>
      <td className="py-3 text-xs">{sku}</td>
      <td className="py-3">
        <input
          type="number"
          min={0}
          value={value}
          onChange={(e) => setValue(Number(e.target.value))}
          className={`w-20 border px-2 py-1.5 text-xs ${
            isLow ? "border-clay text-clay" : "border-stone-light"
          }`}
        />
        {isLow && (
          <span className="ms-2 text-xs text-clay">مخزون منخفض</span>
        )}
      </td>
      <td className="py-3">
        <button
          onClick={save}
          disabled={isPending || value === quantity}
          className="text-xs underline disabled:opacity-40"
        >
          {isPending ? "جارٍ الحفظ..." : "حفظ"}
        </button>
      </td>
    </tr>
  );
}
