"use client";

import { useFormState, useFormStatus } from "react-dom";
import { useEffect, useRef } from "react";
import { createCouponAction } from "@/lib/actions/coupons";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="md" disabled={pending}>
      {pending ? "جارٍ الإنشاء..." : "إنشاء كوبون"}
    </Button>
  );
}

export function CouponForm() {
  const [state, formAction] = useFormState(createCouponAction, null);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state?.success) formRef.current?.reset();
  }, [state]);

  return (
    <form ref={formRef} action={formAction} className="flex flex-wrap items-end gap-4">
      <div className="w-40">
        <Input label="الكود" name="code" required placeholder="SALE20" />
      </div>
      <div className="flex flex-col gap-1.5">
        <label className="text-xs uppercase tracking-widest2 text-stone">النوع</label>
        <select
          name="type"
          className="border border-stone-light bg-transparent px-3 py-3 text-sm"
        >
          <option value="percentage">نسبة %</option>
          <option value="fixed">مبلغ ثابت</option>
        </select>
      </div>
      <div className="w-28">
        <Input label="القيمة" name="value" type="number" min={1} required />
      </div>
      <div className="w-40">
        <Input label="أقل قيمة طلب" name="minOrderAmount" type="number" min={0} />
      </div>
      <div className="w-32">
        <Input label="حد الاستخدام" name="usageLimit" type="number" min={1} />
      </div>
      <div className="w-40">
        <Input label="تاريخ الانتهاء" name="expiresAt" type="date" />
      </div>
      <SubmitButton />
      {state?.error && <p className="text-sm text-clay">{state.error}</p>}
    </form>
  );
}
