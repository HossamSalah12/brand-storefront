"use client";

import { useFormState, useFormStatus } from "react-dom";
import { updatePasswordAction } from "@/lib/actions/auth";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useLocale } from "@/lib/i18n/LocaleContext";

function SubmitButton() {
  const { pending } = useFormStatus();
  const { locale } = useLocale();
  return (
    <Button type="submit" size="lg" className="w-full" disabled={pending}>
      {pending
        ? locale === "en" ? "Saving..." : "جارٍ الحفظ..."
        : locale === "en" ? "Set new password" : "حفظ كلمة المرور الجديدة"}
    </Button>
  );
}

export default function ResetPasswordPage() {
  const [state, formAction] = useFormState(updatePasswordAction, null);
  const { locale } = useLocale();

  return (
    <main className="mx-auto flex min-h-screen max-w-sm flex-col justify-center gap-8 px-6 py-24">
      <div className="text-center">
        <h1 className="font-display text-2xl">
          {locale === "en" ? "Set a new password" : "اختر كلمة مرور جديدة"}
        </h1>
      </div>

      <form action={formAction} className="flex flex-col gap-5">
        <Input
          label={locale === "en" ? "New password" : "كلمة المرور الجديدة"}
          name="password"
          type="password"
          autoComplete="new-password"
          minLength={8}
          required
        />
        {state?.error && (
          <p role="alert" className="text-sm text-clay">
            {state.error}
          </p>
        )}
        <SubmitButton />
      </form>
    </main>
  );
}
