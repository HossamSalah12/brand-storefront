"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useLocale } from "@/lib/i18n/LocaleContext";
import type { Measurement } from "@/components/product/SizeGuide";
import { recommendSize } from "@/lib/utils/sizeRecommendation";

export function FindMySize({ measurements }: { measurements: Measurement[] }) {
  const [open, setOpen] = useState(false);
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [chest, setChest] = useState("");
  const [shoulder, setShoulder] = useState("");
  const [result, setResult] = useState<string | null>(null);
  const { t } = useLocale();

  if (!measurements.length) return null;

  const rows = measurements.map((m) => {
    const sizeInfo = Array.isArray(m.sizes) ? m.sizes[0] : m.sizes;
    return {
      sizeId: m.size_id,
      sizeName: sizeInfo?.name ?? "",
      chestCm: m.chest_cm,
      shoulderCm: m.shoulder_cm,
    };
  });

  function recommend() {
    if (!chest && !shoulder) {
      setResult(t("findMySizeModal.needInput"));
      return;
    }

    const sizeName = recommendSize(rows, {
      chestCm: chest ? Number(chest) : null,
      shoulderCm: shoulder ? Number(shoulder) : null,
    });

    setResult(
      sizeName
        ? t("findMySizeModal.recommendation", { size: sizeName })
        : t("findMySizeModal.noData"),
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="text-sm underline underline-offset-4"
      >
        {t("product.findMySize")}
      </button>

      <Modal open={open} onClose={() => setOpen(false)} title={t("findMySizeModal.title")}>
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label={t("findMySizeModal.height")}
              name="height"
              type="number"
              value={height}
              onChange={(e) => setHeight(e.target.value)}
            />
            <Input
              label={t("findMySizeModal.weight")}
              name="weight"
              type="number"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
            />
            <Input
              label={t("findMySizeModal.chest")}
              name="chest"
              type="number"
              value={chest}
              onChange={(e) => setChest(e.target.value)}
            />
            <Input
              label={t("findMySizeModal.shoulder")}
              name="shoulder"
              type="number"
              value={shoulder}
              onChange={(e) => setShoulder(e.target.value)}
            />
          </div>

          <Button type="button" onClick={recommend}>
            {t("findMySizeModal.submit")}
          </Button>

          {result && (
            <p className="border-t border-stone-light pt-4 text-sm">
              {result}
            </p>
          )}

          <p className="text-xs text-stone">{t("findMySizeModal.disclaimer")}</p>
        </div>
      </Modal>
    </>
  );
}
