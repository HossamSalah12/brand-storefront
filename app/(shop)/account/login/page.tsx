"use client";

import { useFormState, useFormStatus } from "react-dom";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { loginAction } from "@/lib/actions/auth";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useLocale } from "@/lib/i18n/LocaleContext";

function SubmitButton() {
  const { pending } = useFormStatus();
  const { t } = useLocale();
  return (
    <Button type="submit" size="lg" className="w-full" disabled={pending}>
      {pending ? t("auth.loggingIn") : t("auth.loginButton")}
    </Button>
  );
}

export default function LoginPage() {
  const [state, formAction] = useFormState(loginAction, null);
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") ?? "";
  const { t } = useLocale();

  return (
    <main className="mx-auto flex min-h-screen max-w-sm flex-col justify-center gap-8 px-6 py-24">
      <div className="text-center">
        <h1 className="font-display text-2xl">{t("auth.loginTitle")}</h1>
        <p className="mt-2 text-sm text-stone">{t("auth.loginSubtitle")}</p>
      </div>

      <form action={formAction} className="flex flex-col gap-5">
        <input type="hidden" name="redirectTo" value={redirectTo} />
        <Input
          label={t("auth.email")}
          name="email"
          type="email"
          autoComplete="email"
          required
        />
        <Input
          label={t("auth.password")}
          name="password"
          type="password"
          autoComplete="current-password"
          required
        />
        <Link href="/account/forgot-password" className="self-start text-xs text-stone underline">
          {t("auth.forgotPassword")}
        </Link>

        {state?.error && (
          <p role="alert" className="text-sm text-clay">
            {state.error}
          </p>
        )}

        <SubmitButton />
      </form>

      <p className="text-center text-sm text-stone">
        {t("auth.newUser")}{" "}
        <Link href="/account/register" className="text-ink underline">
          {t("auth.createAccount")}
        </Link>
      </p>
    </main>
  );
}
