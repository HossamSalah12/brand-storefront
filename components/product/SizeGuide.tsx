"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { useLocale } from "@/lib/i18n/LocaleContext";

export type Measurement = {
  size_id: string;
  chest_cm: number | null;
  shoulder_cm: number | null;
  length_cm: number | null;
  sleeve_cm: number | null;
  sizes: { name: string; sort_order: number } | { name: string; sort_order: number }[] | null;
};

export function SizeGuide({ measurements }: { measurements: Measurement[] }) {
  const [open, setOpen] = useState(false);
  const { t } = useLocale();

  if (!measurements.length) return null;

  const rows = measurements
    .map((m) => ({
      ...m,
      sizeInfo: Array.isArray(m.sizes) ? m.sizes[0] : m.sizes,
    }))
    .sort((a, b) => (a.sizeInfo?.sort_order ?? 0) - (b.sizeInfo?.sort_order ?? 0));

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="text-sm underline underline-offset-4"
      >
        {t("product.sizeGuide")}
      </button>

      <Modal open={open} onClose={() => setOpen(false)} title={t("sizeGuideModal.title")}>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-stone-light text-xs uppercase tracking-widest2 text-stone">
              <th className="pb-3 text-start">{t("sizeGuideModal.sizeCol")}</th>
              <th className="pb-3 text-start">{t("sizeGuideModal.chest")}</th>
              <th className="pb-3 text-start">{t("sizeGuideModal.shoulder")}</th>
              <th className="pb-3 text-start">{t("sizeGuideModal.length")}</th>
              <th className="pb-3 text-start">{t("sizeGuideModal.sleeve")}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.size_id} className="border-b border-stone-light/50">
                <td className="py-3">{row.sizeInfo?.name}</td>
                <td className="py-3">{row.chest_cm ?? "—"}</td>
                <td className="py-3">{row.shoulder_cm ?? "—"}</td>
                <td className="py-3">{row.length_cm ?? "—"}</td>
                <td className="py-3">{row.sleeve_cm ?? "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="mt-4 text-xs text-stone">{t("sizeGuideModal.note")}</p>
      </Modal>
    </>
  );
}
