"use client";

import { useFormState, useFormStatus } from "react-dom";
import Link from "next/link";
import { registerAction } from "@/lib/actions/auth";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useLocale } from "@/lib/i18n/LocaleContext";

function SubmitButton() {
  const { pending } = useFormStatus();
  const { t } = useLocale();
  return (
    <Button type="submit" size="lg" className="w-full" disabled={pending}>
      {pending ? t("auth.registering") : t("auth.registerButton")}
    </Button>
  );
}

export default function RegisterPage() {
  const [state, formAction] = useFormState(registerAction, null);
  const { t } = useLocale();

  return (
    <main className="mx-auto flex min-h-screen max-w-sm flex-col justify-center gap-8 px-6 py-24">
      <div className="text-center">
        <h1 className="font-display text-2xl">{t("auth.registerTitle")}</h1>
        <p className="mt-2 text-sm text-stone">{t("auth.registerSubtitle")}</p>
      </div>

      <form action={formAction} className="flex flex-col gap-5">
        <Input label={t("auth.fullName")} name="fullName" type="text" required />
        <Input
          label={t("auth.email")}
          name="email"
          type="email"
          autoComplete="email"
          required
        />
        <Input label={t("auth.phone")} name="phone" type="tel" required />
        <Input
          label={t("auth.password")}
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

      <p className="text-center text-sm text-stone">
        {t("auth.haveAccount")}{" "}
        <Link href="/account/login" className="text-ink underline">
          {t("auth.loginTitle")}
        </Link>
      </p>
    </main>
  );
}
