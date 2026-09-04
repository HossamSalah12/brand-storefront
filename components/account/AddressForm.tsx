"use client";

import { useFormState, useFormStatus } from "react-dom";
import { useEffect, useRef } from "react";
import { addAddressAction } from "@/lib/actions/account";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useLocale } from "@/lib/i18n/LocaleContext";

function SubmitButton() {
  const { pending } = useFormStatus();
  const { t } = useLocale();
  return (
    <Button type="submit" size="md" disabled={pending}>
      {pending ? "..." : t("account.addAddress")}
    </Button>
  );
}

export function AddressForm() {
  const [state, formAction] = useFormState(addAddressAction, null);
  const formRef = useRef<HTMLFormElement>(null);
  const { t } = useLocale();

  useEffect(() => {
    if (state?.success) formRef.current?.reset();
  }, [state]);

  return (
    <form ref={formRef} action={formAction} className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-4">
        <Input label={t("checkout.fullName")} name="fullName" required />
        <Input label={t("checkout.phone")} name="phone" type="tel" required />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Input label={t("checkout.governorate")} name="governorate" required />
        <Input label={t("checkout.city")} name="city" required />
      </div>
      <Input label={t("checkout.fullAddress")} name="fullAddress" required />
      <div className="grid grid-cols-3 gap-4">
        <Input label={t("checkout.building")} name="building" />
        <Input label={t("checkout.apartment")} name="apartment" />
        <Input label={t("checkout.floor")} name="floor" />
      </div>
      <Input label={t("checkout.landmark")} name="landmark" />

      {state?.error && <p className="text-sm text-clay">{state.error}</p>}
      <SubmitButton />
    </form>
  );
}
