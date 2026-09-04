"use client";

import { useRef, useState, useTransition } from "react";
import { createShippingZoneAction } from "@/lib/actions/shipping";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

export function ShippingZoneForm() {
  const [governorate, setGovernorate] = useState("");
  const [price, setPrice] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      try {
        await createShippingZoneAction(governorate.trim(), Number(price));
        setGovernorate("");
        setPrice("");
      } catch (err) {
        setError(err instanceof Error ? err.message : "حدث خطأ");
      }
    });
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="flex flex-wrap items-end gap-4">
      <div className="w-48">
        <Input
          label="المحافظة"
          name="governorate"
          required
          value={governorate}
          onChange={(e) => setGovernorate(e.target.value)}
        />
      </div>
      <div className="w-32">
        <Input
          label="السعر (ج.م)"
          name="price"
          type="number"
          min={0}
          required
          value={price}
          onChange={(e) => setPrice(e.target.value)}
        />
      </div>
      <Button type="submit" size="md" disabled={isPending}>
        {isPending ? "جارٍ الإضافة..." : "إضافة"}
      </Button>
      {error && <p className="text-sm text-clay">{error}</p>}
    </form>
  );
}
