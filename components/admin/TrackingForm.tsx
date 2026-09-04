"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateOrderTrackingAction } from "@/lib/actions/orders";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

export function TrackingForm({
  orderId,
  defaultCarrier,
  defaultNumber,
  defaultUrl,
}: {
  orderId: string;
  defaultCarrier: string;
  defaultNumber: string;
  defaultUrl: string;
}) {
  const [carrier, setCarrier] = useState(defaultCarrier);
  const [number, setNumber] = useState(defaultNumber);
  const [url, setUrl] = useState(defaultUrl);
  const [isPending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);
  const router = useRouter();

  function handleSave() {
    startTransition(async () => {
      await updateOrderTrackingAction(orderId, { carrier, number, url });
      setSaved(true);
      router.refresh();
      setTimeout(() => setSaved(false), 2000);
    });
  }

  return (
    <div className="flex flex-wrap items-end gap-4">
      <div className="w-40">
        <Input label="شركة الشحن" name="carrier" value={carrier} onChange={(e) => setCarrier(e.target.value)} />
      </div>
      <div className="w-48">
        <Input label="رقم التتبع" name="number" value={number} onChange={(e) => setNumber(e.target.value)} />
      </div>
      <div className="w-64">
        <Input label="رابط التتبع (اختياري)" name="url" value={url} onChange={(e) => setUrl(e.target.value)} />
      </div>
      <Button size="sm" variant="secondary" onClick={handleSave} disabled={isPending}>
        {isPending ? "..." : saved ? "تم الحفظ ✓" : "حفظ بيانات الشحن"}
      </Button>
    </div>
  );
}
