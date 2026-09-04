"use client";

import { useFormState, useFormStatus } from "react-dom";
import { updateProfileAction } from "@/lib/actions/account";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useLocale } from "@/lib/i18n/LocaleContext";

function SubmitButton() {
  const { pending } = useFormStatus();
  const { t } = useLocale();
  return (
    <Button type="submit" size="md" disabled={pending}>
      {pending ? "..." : t("account.saveChanges")}
    </Button>
  );
}

export function ProfileForm({
  defaultFullName,
  defaultPhone,
}: {
  defaultFullName: string;
  defaultPhone: string;
}) {
  const [state, formAction] = useFormState(updateProfileAction, null);
  const { t } = useLocale();

  return (
    <form action={formAction} className="flex max-w-sm flex-col gap-4">
      <Input label={t("auth.fullName")} name="fullName" defaultValue={defaultFullName} required />
      <Input label={t("auth.phone")} name="phone" defaultValue={defaultPhone} />
      {state?.error && <p className="text-sm text-clay">{state.error}</p>}
      {state?.success && <p className="text-sm text-moss">{t("account.savedSuccessfully")}</p>}
      <SubmitButton />
    </form>
  );
}
