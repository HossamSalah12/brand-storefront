"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useLocale } from "@/lib/i18n/LocaleContext";

type Option = { id: string; name: string };

export function FilterBar({
  colors,
  sizes,
}: {
  colors: Option[];
  sizes: Option[];
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [open, setOpen] = useState(false);
  const [mobileVisible, setMobileVisible] = useState(false);
  const { locale } = useLocale();

  useEffect(() => {
    if (open) {
      const id = requestAnimationFrame(() => setMobileVisible(true));
      return () => cancelAnimationFrame(id);
    }
    setMobileVisible(false);
  }, [open]);

  function updateParam(key: string, value: string | null) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    router.push(`${pathname}?${params.toString()}`);
  }

  function toggleMultiParam(key: string, id: string) {
    const params = new URLSearchParams(searchParams.toString());
    const current = params.get(key)?.split(",").filter(Boolean) ?? [];
    const next = current.includes(id)
      ? current.filter((v) => v !== id)
      : [...current, id];
    if (next.length) params.set(key, next.join(","));
    else params.delete(key);
    router.push(`${pathname}?${params.toString()}`);
  }

  const activeColors = searchParams.get("colors")?.split(",").filter(Boolean) ?? [];
  const activeSizes = searchParams.get("sizes")?.split(",").filter(Boolean) ?? [];
  const activeCount = activeColors.length + activeSizes.length +
    (searchParams.get("min") ? 1 : 0) + (searchParams.get("max") ? 1 : 0);
  const sort = searchParams.get("sort") ?? "newest";

  const labels = locale === "en"
    ? {
        filters: "Filters",
        color: "Color",
        size: "Size",
        priceFrom: "Price from",
        priceTo: "to",
        sortNewest: "Newest",
        sortPriceAsc: "Price: Low to High",
        sortPriceDesc: "Price: High to Low",
        sortBestSelling: "Best Selling",
        apply: "Show results",
        clear: "Clear all",
      }
    : {
        filters: "فلاتر",
        color: "اللون",
        size: "المقاس",
        priceFrom: "السعر من",
        priceTo: "إلى",
        sortNewest: "الأحدث",
        sortPriceAsc: "السعر: من الأقل للأعلى",
        sortPriceDesc: "السعر: من الأعلى للأقل",
        sortBestSelling: "الأكثر مبيعًا",
        apply: "عرض النتائج",
        clear: "مسح الكل",
      };

  function clearAll() {
    const params = new URLSearchParams(searchParams.toString());
    ["colors", "sizes", "min", "max"].forEach((k) => params.delete(k));
    router.push(`${pathname}?${params.toString()}`);
  }

  const filterFields = (
    <div className="flex flex-col gap-6 md:flex-row md:gap-12">
      <div>
        <p className="mb-2 text-xs uppercase tracking-widest2 text-stone">
          {labels.color}
        </p>
        <div className="flex flex-wrap gap-2">
          {colors.map((c) => (
            <button
              key={c.id}
              onClick={() => toggleMultiParam("colors", c.id)}
              className={`border px-3 py-1.5 text-xs ${
                activeColors.includes(c.id)
                  ? "border-ink bg-ink text-bone"
                  : "border-stone-light"
              }`}
            >
              {c.name}
            </button>
          ))}
        </div>
      </div>
      <div>
        <p className="mb-2 text-xs uppercase tracking-widest2 text-stone">
          {labels.size}
        </p>
        <div className="flex flex-wrap gap-2">
          {sizes.map((s) => (
            <button
              key={s.id}
              onClick={() => toggleMultiParam("sizes", s.id)}
              className={`border px-3 py-1.5 text-xs ${
                activeSizes.includes(s.id)
                  ? "border-ink bg-ink text-bone"
                  : "border-stone-light"
              }`}
            >
              {s.name}
            </button>
          ))}
        </div>
      </div>
      <div className="flex items-end gap-2">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs uppercase tracking-widest2 text-stone">
            {labels.priceFrom}
          </label>
          <input
            type="number"
            defaultValue={searchParams.get("min") ?? ""}
            onBlur={(e) => updateParam("min", e.target.value || null)}
            className="w-24 border border-stone-light bg-transparent px-2 py-1.5 text-xs"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs uppercase tracking-widest2 text-stone">
            {labels.priceTo}
          </label>
          <input
            type="number"
            defaultValue={searchParams.get("max") ?? ""}
            onBlur={(e) => updateParam("max", e.target.value || null)}
            className="w-24 border border-stone-light bg-transparent px-2 py-1.5 text-xs"
          />
        </div>
      </div>
    </div>
  );

  return (
    <div className="mb-8 border-b border-stone-light pb-4">
      <div className="flex items-center justify-between">
        <button
          onClick={() => setOpen((v) => !v)}
          className="text-sm uppercase tracking-widest2"
        >
          {labels.filters}
          {activeCount > 0 && ` (${activeCount})`}
          <span className="hidden md:inline"> {open ? "▲" : "▼"}</span>
        </button>
        <select
          value={sort}
          onChange={(e) => updateParam("sort", e.target.value)}
          className="border-none bg-transparent text-sm uppercase tracking-widest2"
        >
          <option value="newest">{labels.sortNewest}</option>
          <option value="price_asc">{labels.sortPriceAsc}</option>
          <option value="price_desc">{labels.sortPriceDesc}</option>
          <option value="best_selling">{labels.sortBestSelling}</option>
        </select>
      </div>

      {/* Desktop: inline expanding panel */}
      {open && <div className="mt-4 hidden md:block">{filterFields}</div>}

      {/* Mobile: bottom-sheet drawer */}
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-end md:hidden"
          onClick={() => setOpen(false)}
        >
          <div
            className={`absolute inset-0 bg-ink/40 transition-opacity duration-300 ease-editorial ${
              mobileVisible ? "opacity-100" : "opacity-0"
            }`}
          />
          <div
            className={`relative flex max-h-[80vh] w-full flex-col overflow-y-auto bg-bone p-6 transition-transform duration-300 ease-editorial ${
              mobileVisible ? "translate-y-0" : "translate-y-full"
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-6 flex items-center justify-between">
              <span className="text-sm uppercase tracking-widest2">{labels.filters}</span>
              <button onClick={() => setOpen(false)} className="text-2xl leading-none">
                ×
              </button>
            </div>
            {filterFields}
            <div className="mt-8 flex gap-3">
              <button
                onClick={clearAll}
                className="flex-1 border border-stone-light py-3 text-xs uppercase tracking-widest2"
              >
                {labels.clear}
              </button>
              <button
                onClick={() => setOpen(false)}
                className="flex-1 bg-ink py-3 text-xs uppercase tracking-widest2 text-bone"
              >
                {labels.apply}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
