"use client";

import { useFormState, useFormStatus } from "react-dom";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { requestPasswordResetAction } from "@/lib/actions/auth";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useLocale } from "@/lib/i18n/LocaleContext";

function SubmitButton() {
  const { pending } = useFormStatus();
  const { locale } = useLocale();
  return (
    <Button type="submit" size="lg" className="w-full" disabled={pending}>
      {pending
        ? locale === "en" ? "Sending..." : "جارٍ الإرسال..."
        : locale === "en" ? "Send reset link" : "إرسال رابط إعادة التعيين"}
    </Button>
  );
}

export default function ForgotPasswordPage() {
  const [state, formAction] = useFormState(requestPasswordResetAction, null);
  const searchParams = useSearchParams();
  const expired = searchParams.get("expired") === "1";
  const { locale } = useLocale();

  return (
    <main className="mx-auto flex min-h-screen max-w-sm flex-col justify-center gap-8 px-6 py-24">
      <div className="text-center">
        <h1 className="font-display text-2xl">
          {locale === "en" ? "Reset your password" : "استعادة كلمة المرور"}
        </h1>
        <p className="mt-2 text-sm text-stone">
          {locale === "en"
            ? "Enter your email and we'll send you a link to reset it."
            : "أدخل بريدك الإلكتروني وهنبعتلك رابط تقدر تعيد تعيين كلمة المرور بيه."}
        </p>
      </div>

      {expired && !state && (
        <p className="text-center text-sm text-clay">
          {locale === "en"
            ? "That reset link has expired. Request a new one below."
            : "رابط إعادة التعيين ده انتهت صلاحيته. اطلب رابط جديد تحت."}
        </p>
      )}

      {state?.success ? (
        <p className="text-center text-sm text-moss">
          {locale === "en"
            ? "If an account exists with that email, a reset link is on its way."
            : "لو فيه حساب مرتبط بالبريد ده، هيوصله رابط إعادة تعيين حالًا."}
        </p>
      ) : (
        <form action={formAction} className="flex flex-col gap-5">
          <Input
            label={locale === "en" ? "Email" : "البريد الإلكتروني"}
            name="email"
            type="email"
            autoComplete="email"
            required
          />
          {state?.error && (
            <p role="alert" className="text-sm text-clay">
              {state.error}
            </p>
          )}
          <SubmitButton />
        </form>
      )}

      <p className="text-center text-sm text-stone">
        <Link href="/account/login" className="text-ink underline">
          {locale === "en" ? "Back to login" : "الرجوع لتسجيل الدخول"}
        </Link>
      </p>
    </main>
  );
}
