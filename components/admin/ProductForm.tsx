"use client";

import { useMemo, useState, useTransition, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { saveProductAction, createColorAction, createSizeAction } from "@/lib/actions/products";
import type { ProductFormInput } from "@/lib/validation/product";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { ImageUploader, type UploadedImage } from "@/components/admin/ImageUploader";

type LookupItem = { id: string; name: string };
type CategoryItem = { id: string; name: string };

type ExistingVariant = {
  color_id: string;
  size_id: string;
  sku: string;
  price_override: number | null;
  image_url: string | null;
  variant_inventory: { quantity: number } | { quantity: number }[] | null;
};

type ExistingMeasurement = {
  size_id: string;
  chest_cm: number | null;
  shoulder_cm: number | null;
  length_cm: number | null;
  sleeve_cm: number | null;
};

export function ProductForm({
  productId,
  categories,
  colors,
  sizes,
  initial,
}: {
  productId?: string;
  categories: CategoryItem[];
  colors: LookupItem[];
  sizes: LookupItem[];
  initial?: {
    name: string;
    name_en?: string | null;
    slug: string;
    description: string | null;
    description_en?: string | null;
    material: string | null;
    material_en?: string | null;
    care_instructions: string | null;
    care_instructions_en?: string | null;
    category_id: string | null;
    base_price: number;
    compare_at_price: number | null;
    status: "active" | "draft" | "archived";
    is_featured: boolean;
    is_new_arrival: boolean;
    is_best_seller: boolean;
    variants: ExistingVariant[];
    measurements: ExistingMeasurement[];
    images: UploadedImage[];
  };
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState(initial?.name ?? "");
  const [nameEn, setNameEn] = useState(initial?.name_en ?? "");
  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(!!initial);
  const [description, setDescription] = useState(initial?.description ?? "");
  const [descriptionEn, setDescriptionEn] = useState(initial?.description_en ?? "");
  const [material, setMaterial] = useState(initial?.material ?? "");
  const [materialEn, setMaterialEn] = useState(initial?.material_en ?? "");
  const [care, setCare] = useState(initial?.care_instructions ?? "");
  const [careEn, setCareEn] = useState(initial?.care_instructions_en ?? "");
  const [categoryId, setCategoryId] = useState(initial?.category_id ?? "");
  const [basePrice, setBasePrice] = useState(String(initial?.base_price ?? ""));
  const [compareAtPrice, setCompareAtPrice] = useState(
    initial?.compare_at_price != null ? String(initial.compare_at_price) : "",
  );
  const [status, setStatus] = useState<"active" | "draft" | "archived">(
    initial?.status ?? "active",
  );
  const [isFeatured, setIsFeatured] = useState(initial?.is_featured ?? false);
  const [isNewArrival, setIsNewArrival] = useState(initial?.is_new_arrival ?? false);
  const [isBestSeller, setIsBestSeller] = useState(initial?.is_best_seller ?? false);

  const [selectedColorIds, setSelectedColorIds] = useState<string[]>(
    Array.from(new Set(initial?.variants.map((v) => v.color_id) ?? [])),
  );
  const [selectedSizeIds, setSelectedSizeIds] = useState<string[]>(
    Array.from(new Set(initial?.variants.map((v) => v.size_id) ?? [])),
  );

  type CellData = { sku: string; quantity: string; priceOverride: string };
  const [cells, setCells] = useState<Record<string, CellData>>(() => {
    const map: Record<string, CellData> = {};
    initial?.variants.forEach((v) => {
      const qty = Array.isArray(v.variant_inventory)
        ? v.variant_inventory[0]?.quantity ?? 0
        : v.variant_inventory?.quantity ?? 0;
      map[`${v.color_id}:${v.size_id}`] = {
        sku: v.sku,
        quantity: String(qty),
        priceOverride: v.price_override != null ? String(v.price_override) : "",
      };
    });
    return map;
  });

  const [measurements, setMeasurements] = useState<
    Record<string, { chest: string; shoulder: string; length: string; sleeve: string }>
  >(() => {
    const map: Record<string, { chest: string; shoulder: string; length: string; sleeve: string }> = {};
    initial?.measurements.forEach((m) => {
      map[m.size_id] = {
        chest: m.chest_cm != null ? String(m.chest_cm) : "",
        shoulder: m.shoulder_cm != null ? String(m.shoulder_cm) : "",
        length: m.length_cm != null ? String(m.length_cm) : "",
        sleeve: m.sleeve_cm != null ? String(m.sleeve_cm) : "",
      };
    });
    return map;
  });

  const [images, setImages] = useState<UploadedImage[]>(initial?.images ?? []);

  const [newColorName, setNewColorName] = useState("");
  const [newColorNameEn, setNewColorNameEn] = useState("");
  const [newColorHex, setNewColorHex] = useState("#141311");
  const [newSizeName, setNewSizeName] = useState("");
  const [newSizeNameEn, setNewSizeNameEn] = useState("");

  function slugify(value: string) {
    return value
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-");
  }

  function toggleColor(id: string) {
    setSelectedColorIds((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id],
    );
  }

  function toggleSize(id: string) {
    setSelectedSizeIds((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id],
    );
  }

  function suggestSku(colorName: string, sizeName: string) {
    const base = slug || slugify(name) || "item";
    return `${base}-${slugify(colorName)}-${slugify(sizeName)}`.toUpperCase();
  }

  function updateCell(colorId: string, sizeId: string, patch: Partial<CellData>) {
    const key = `${colorId}:${sizeId}`;
    setCells((prev) => ({
      ...prev,
      [key]: {
        sku: prev[key]?.sku ?? "",
        quantity: prev[key]?.quantity ?? "0",
        priceOverride: prev[key]?.priceOverride ?? "",
        ...patch,
      },
    }));
  }

  const variantPairs = useMemo(() => {
    const pairs: { colorId: string; sizeId: string }[] = [];
    selectedColorIds.forEach((colorId) => {
      selectedSizeIds.forEach((sizeId) => {
        pairs.push({ colorId, sizeId });
      });
    });
    return pairs;
  }, [selectedColorIds, selectedSizeIds]);

  async function handleAddColor() {
    if (!newColorName.trim()) return;
    await createColorAction(newColorName.trim(), newColorHex, newColorNameEn.trim());
    setNewColorName("");
    setNewColorNameEn("");
    router.refresh();
  }

  async function handleAddSize() {
    if (!newSizeName.trim()) return;
    await createSizeAction(newSizeName.trim(), sizes.length, newSizeNameEn.trim());
    setNewSizeName("");
    setNewSizeNameEn("");
    router.refresh();
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (!variantPairs.length) {
      setError("اختر لون ومقاس واحد على الأقل");
      return;
    }

    const variantsPayload = variantPairs.map(({ colorId, sizeId }) => {
      const key = `${colorId}:${sizeId}`;
      const cell = cells[key];
      const color = colors.find((c) => c.id === colorId)!;
      const size = sizes.find((s) => s.id === sizeId)!;
      return {
        colorId,
        sizeId,
        sku: cell?.sku?.trim() || suggestSku(color.name, size.name),
        quantity: Number(cell?.quantity || 0),
        priceOverride: cell?.priceOverride ? Number(cell.priceOverride) : null,
        imageUrl: null,
      };
    });

    const measurementsPayload = selectedSizeIds
      .filter((sizeId) => {
        const m = measurements[sizeId];
        return m && (m.chest || m.shoulder || m.length || m.sleeve);
      })
      .map((sizeId) => {
        const m = measurements[sizeId];
        return {
          sizeId,
          chestCm: m.chest ? Number(m.chest) : null,
          shoulderCm: m.shoulder ? Number(m.shoulder) : null,
          lengthCm: m.length ? Number(m.length) : null,
          sleeveCm: m.sleeve ? Number(m.sleeve) : null,
        };
      });

    const payload: ProductFormInput = {
      basic: {
        name,
        nameEn,
        slug: slug || slugify(name),
        categoryId: categoryId || null,
        description,
        descriptionEn,
        material,
        materialEn,
        careInstructions: care,
        careInstructionsEn: careEn,
        basePrice: Number(basePrice || 0),
        compareAtPrice: compareAtPrice ? Number(compareAtPrice) : null,
        status,
        isFeatured,
        isNewArrival,
        isBestSeller,
      },
      variants: variantsPayload,
      measurements: measurementsPayload,
      images: images.map((img, i) => ({ url: img.url, sortOrder: i })),
    };

    startTransition(async () => {
      const result = await saveProductAction(productId ?? null, payload);
      if (result?.error) setError(result.error);
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex max-w-3xl flex-col gap-10">
      {/* Basic info */}
      <section className="flex flex-col gap-4">
        <h2 className="font-display text-lg">معلومات أساسية</h2>
        <Input
          label="اسم المنتج"
          name="name"
          required
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            if (!slugTouched) setSlug(slugify(e.target.value));
          }}
        />
        <Input
          label="Product name in English (optional)"
          name="nameEn"
          value={nameEn}
          onChange={(e) => setNameEn(e.target.value)}
        />
        <Input
          label="الرابط (Slug)"
          name="slug"
          required
          value={slug}
          onChange={(e) => {
            setSlugTouched(true);
            setSlug(slugify(e.target.value));
          }}
        />
        <div className="flex flex-col gap-1.5">
          <label className="text-xs uppercase tracking-widest2 text-stone">
            الوصف
          </label>
          <textarea
            className="min-h-28 border border-stone-light bg-transparent px-4 py-3 text-sm"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs uppercase tracking-widest2 text-stone">
            Description in English (optional)
          </label>
          <textarea
            className="min-h-28 border border-stone-light bg-transparent px-4 py-3 text-sm"
            value={descriptionEn}
            onChange={(e) => setDescriptionEn(e.target.value)}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="الخامة"
            name="material"
            value={material}
            onChange={(e) => setMaterial(e.target.value)}
          />
          <Input
            label="Material (English, optional)"
            name="materialEn"
            value={materialEn}
            onChange={(e) => setMaterialEn(e.target.value)}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="تعليمات العناية"
            name="care"
            value={care}
            onChange={(e) => setCare(e.target.value)}
          />
          <Input
            label="Care instructions (English, optional)"
            name="careEn"
            value={careEn}
            onChange={(e) => setCareEn(e.target.value)}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs uppercase tracking-widest2 text-stone">
            الفئة
          </label>
          <select
            className="border border-stone-light bg-transparent px-4 py-3 text-sm"
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
          >
            <option value="">بدون فئة</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="السعر (EGP)"
            name="basePrice"
            type="number"
            min={0}
            step="0.01"
            required
            value={basePrice}
            onChange={(e) => setBasePrice(e.target.value)}
          />
          <Input
            label="السعر قبل الخصم (اختياري)"
            name="compareAtPrice"
            type="number"
            min={0}
            step="0.01"
            value={compareAtPrice}
            onChange={(e) => setCompareAtPrice(e.target.value)}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs uppercase tracking-widest2 text-stone">
            الحالة
          </label>
          <select
            className="border border-stone-light bg-transparent px-4 py-3 text-sm"
            value={status}
            onChange={(e) => setStatus(e.target.value as typeof status)}
          >
            <option value="draft">مسودة</option>
            <option value="active">منشور</option>
            <option value="archived">مؤرشف</option>
          </select>
          <p className={`text-xs ${status === "active" ? "text-moss" : "text-clay"}`}>
            {status === "active"
              ? "هذا المنتج سيظهر لعملائك في المتجر بمجرد الحفظ."
              : 'المنتج لازم يكون "منشور" عشان يظهر للعملاء في المتجر. "مسودة" و"مؤرشف" لا يظهران للعامة.'}
          </p>
        </div>
        <div className="flex flex-wrap gap-6 text-sm">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={isFeatured}
              onChange={(e) => setIsFeatured(e.target.checked)}
            />
            مميز
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={isNewArrival}
              onChange={(e) => setIsNewArrival(e.target.checked)}
            />
            وصل حديثًا
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={isBestSeller}
              onChange={(e) => setIsBestSeller(e.target.checked)}
            />
            الأكثر مبيعًا
          </label>
        </div>
      </section>

      {/* Images */}
      <section>
        <h2 className="mb-4 font-display text-lg">الصور</h2>
        <ImageUploader images={images} onChange={setImages} />
      </section>

      {/* Colors & sizes */}
      <section className="flex flex-col gap-6">
        <h2 className="font-display text-lg">الألوان والمقاسات</h2>

        <div>
          <p className="mb-2 text-xs uppercase tracking-widest2 text-stone">
            الألوان
          </p>
          <div className="mb-3 flex flex-wrap gap-2">
            {colors.map((c) => (
              <button
                type="button"
                key={c.id}
                onClick={() => toggleColor(c.id)}
                className={`border px-3 py-1.5 text-sm ${
                  selectedColorIds.includes(c.id)
                    ? "border-ink bg-ink text-bone"
                    : "border-stone-light"
                }`}
              >
                {c.name}
              </button>
            ))}
          </div>
          <div className="flex items-end gap-2">
            <Input
              label="لون جديد"
              name="newColor"
              value={newColorName}
              onChange={(e) => setNewColorName(e.target.value)}
            />
            <Input
              label="English (optional)"
              name="newColorEn"
              value={newColorNameEn}
              onChange={(e) => setNewColorNameEn(e.target.value)}
            />
            <input
              type="color"
              value={newColorHex}
              onChange={(e) => setNewColorHex(e.target.value)}
              className="h-11 w-11 border border-stone-light"
            />
            <Button type="button" variant="secondary" size="sm" onClick={handleAddColor}>
              إضافة
            </Button>
          </div>
        </div>

        <div>
          <p className="mb-2 text-xs uppercase tracking-widest2 text-stone">
            المقاسات
          </p>
          <div className="mb-3 flex flex-wrap gap-2">
            {sizes.map((s) => (
              <button
                type="button"
                key={s.id}
                onClick={() => toggleSize(s.id)}
                className={`border px-3 py-1.5 text-sm ${
                  selectedSizeIds.includes(s.id)
                    ? "border-ink bg-ink text-bone"
                    : "border-stone-light"
                }`}
              >
                {s.name}
              </button>
            ))}
          </div>
          <div className="flex items-end gap-2">
            <Input
              label="مقاس جديد"
              name="newSize"
              value={newSizeName}
              onChange={(e) => setNewSizeName(e.target.value)}
            />
            <Input
              label="English (optional)"
              name="newSizeEn"
              value={newSizeNameEn}
              onChange={(e) => setNewSizeNameEn(e.target.value)}
            />
            <Button type="button" variant="secondary" size="sm" onClick={handleAddSize}>
              إضافة
            </Button>
          </div>
        </div>
      </section>

      {/* Variant grid: stock + SKU + optional price per color/size */}
      {variantPairs.length > 0 && (
        <section>
          <h2 className="mb-4 font-display text-lg">المتغيرات والمخزون</h2>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-stone-light text-start text-xs uppercase tracking-widest2 text-stone">
                <th className="pb-2 text-start">اللون</th>
                <th className="pb-2 text-start">المقاس</th>
                <th className="pb-2 text-start">SKU</th>
                <th className="pb-2 text-start">الكمية</th>
                <th className="pb-2 text-start">سعر مخصص (اختياري)</th>
              </tr>
            </thead>
            <tbody>
              {variantPairs.map(({ colorId, sizeId }) => {
                const color = colors.find((c) => c.id === colorId)!;
                const size = sizes.find((s) => s.id === sizeId)!;
                const key = `${colorId}:${sizeId}`;
                const cell = cells[key];
                return (
                  <tr key={key} className="border-b border-stone-light/50">
                    <td className="py-2">{color.name}</td>
                    <td className="py-2">{size.name}</td>
                    <td className="py-2">
                      <input
                        className="w-40 border border-stone-light bg-transparent px-2 py-1.5 text-xs"
                        placeholder={suggestSku(color.name, size.name)}
                        value={cell?.sku ?? ""}
                        onChange={(e) =>
                          updateCell(colorId, sizeId, { sku: e.target.value })
                        }
                      />
                    </td>
                    <td className="py-2">
                      <input
                        type="number"
                        min={0}
                        className="w-20 border border-stone-light bg-transparent px-2 py-1.5 text-xs"
                        value={cell?.quantity ?? "0"}
                        onChange={(e) =>
                          updateCell(colorId, sizeId, { quantity: e.target.value })
                        }
                      />
                    </td>
                    <td className="py-2">
                      <input
                        type="number"
                        min={0}
                        step="0.01"
                        className="w-28 border border-stone-light bg-transparent px-2 py-1.5 text-xs"
                        value={cell?.priceOverride ?? ""}
                        onChange={(e) =>
                          updateCell(colorId, sizeId, { priceOverride: e.target.value })
                        }
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </section>
      )}

      {/* Measurements per size */}
      {selectedSizeIds.length > 0 && (
        <section>
          <h2 className="mb-4 font-display text-lg">
            جدول المقاسات (سم) — اختياري
          </h2>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-stone-light text-start text-xs uppercase tracking-widest2 text-stone">
                <th className="pb-2 text-start">المقاس</th>
                <th className="pb-2 text-start">الصدر</th>
                <th className="pb-2 text-start">الكتف</th>
                <th className="pb-2 text-start">الطول</th>
                <th className="pb-2 text-start">الكم</th>
              </tr>
            </thead>
            <tbody>
              {selectedSizeIds.map((sizeId) => {
                const size = sizes.find((s) => s.id === sizeId)!;
                const m = measurements[sizeId] ?? {
                  chest: "",
                  shoulder: "",
                  length: "",
                  sleeve: "",
                };
                function updateM(patch: Partial<typeof m>) {
                  setMeasurements((prev) => ({
                    ...prev,
                    [sizeId]: { ...m, ...patch },
                  }));
                }
                return (
                  <tr key={sizeId} className="border-b border-stone-light/50">
                    <td className="py-2">{size.name}</td>
                    <td className="py-2">
                      <input
                        type="number"
                        className="w-20 border border-stone-light bg-transparent px-2 py-1.5 text-xs"
                        value={m.chest}
                        onChange={(e) => updateM({ chest: e.target.value })}
                      />
                    </td>
                    <td className="py-2">
                      <input
                        type="number"
                        className="w-20 border border-stone-light bg-transparent px-2 py-1.5 text-xs"
                        value={m.shoulder}
                        onChange={(e) => updateM({ shoulder: e.target.value })}
                      />
                    </td>
                    <td className="py-2">
                      <input
                        type="number"
                        className="w-20 border border-stone-light bg-transparent px-2 py-1.5 text-xs"
                        value={m.length}
                        onChange={(e) => updateM({ length: e.target.value })}
                      />
                    </td>
                    <td className="py-2">
                      <input
                        type="number"
                        className="w-20 border border-stone-light bg-transparent px-2 py-1.5 text-xs"
                        value={m.sleeve}
                        onChange={(e) => updateM({ sleeve: e.target.value })}
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </section>
      )}

      {error && (
        <p role="alert" className="text-sm text-clay">
          {error}
        </p>
      )}

      <Button type="submit" size="lg" disabled={isPending} className="self-start">
        {isPending ? "جارٍ الحفظ..." : productId ? "حفظ التعديلات" : "إنشاء المنتج"}
      </Button>
    </form>
  );
}
