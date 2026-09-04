"use client";

import { useEffect } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { updateAddressAction } from "@/lib/actions/account";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useLocale } from "@/lib/i18n/LocaleContext";

type Address = {
  id: string;
  full_name: string;
  phone: string;
  governorate: string;
  city: string;
  full_address: string;
  building: string | null;
  apartment: string | null;
  floor: string | null;
  landmark: string | null;
};

function SubmitButton() {
  const { pending } = useFormStatus();
  const { t } = useLocale();
  return (
    <Button type="submit" size="sm" disabled={pending}>
      {pending ? "..." : t("common.save")}
    </Button>
  );
}

export function EditAddressForm({
  address,
  onDone,
}: {
  address: Address;
  onDone: () => void;
}) {
  const action = updateAddressAction.bind(null, address.id);
  const [state, formAction] = useFormState(action, null);
  const { t } = useLocale();

  useEffect(() => {
    if (state?.success) onDone();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  return (
    <form action={formAction} className="mt-3 flex flex-col gap-3 border-t border-stone-light pt-3">
      <div className="grid grid-cols-2 gap-3">
        <Input label={t("checkout.fullName")} name="fullName" defaultValue={address.full_name} required />
        <Input label={t("checkout.phone")} name="phone" type="tel" defaultValue={address.phone} required />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Input label={t("checkout.governorate")} name="governorate" defaultValue={address.governorate} required />
        <Input label={t("checkout.city")} name="city" defaultValue={address.city} required />
      </div>
      <Input label={t("checkout.fullAddress")} name="fullAddress" defaultValue={address.full_address} required />
      <div className="grid grid-cols-3 gap-3">
        <Input label={t("checkout.building")} name="building" defaultValue={address.building ?? ""} />
        <Input label={t("checkout.apartment")} name="apartment" defaultValue={address.apartment ?? ""} />
        <Input label={t("checkout.floor")} name="floor" defaultValue={address.floor ?? ""} />
      </div>
      <Input label={t("checkout.landmark")} name="landmark" defaultValue={address.landmark ?? ""} />

      {state?.error && <p className="text-sm text-clay">{state.error}</p>}

      <div className="flex gap-3">
        <SubmitButton />
        <button type="button" onClick={onDone} className="text-sm text-stone underline">
          {t("common.cancel")}
        </button>
      </div>
    </form>
  );
}
