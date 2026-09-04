"use client";

import { useFormState, useFormStatus } from "react-dom";
import { subscribeNewsletterAction } from "@/lib/actions/newsletter";
import { useToast } from "@/lib/toast/ToastContext";
import { useLocale } from "@/lib/i18n/LocaleContext";
import { useEffect } from "react";

function SubmitButton() {
  const { pending } = useFormStatus();
  const { t } = useLocale();
  return (
    <button
      type="submit"
      disabled={pending}
      className="border border-ink bg-ink px-6 py-3 text-xs uppercase tracking-widest2 text-bone transition-colors hover:bg-clay hover:border-clay disabled:opacity-50"
    >
      {pending ? "..." : t("footer.subscribe")}
    </button>
  );
}

export function VipNewsletterSection() {
  const [state, formAction] = useFormState(subscribeNewsletterAction, null);
  const { t, locale } = useLocale();
  const { showToast } = useToast();

  useEffect(() => {
    if (state?.success) showToast(t("footer.subscribed"), "success");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  return (
    <section className="border-y border-stone-light bg-stone-light/40 px-6 py-[var(--space-block)] text-center">
      <p className="text-xs uppercase tracking-widest2 text-clay">
        {locale === "en" ? "Join the List" : "انضم لقائمتنا"}
      </p>
      <h2 className="mx-auto mt-3 max-w-lg font-display text-2xl">
        {locale === "en"
          ? "Be first to know about new arrivals and private offers"
          : "كن أول من يعرف عن المنتجات الجديدة والعروض الخاصة"}
      </h2>

      {state?.success ? (
        <p className="mt-6 text-sm text-moss">{t("footer.subscribed")}</p>
      ) : (
        <form
          action={formAction}
          className="mx-auto mt-6 flex max-w-md flex-col gap-3 sm:flex-row"
        >
          <input
            type="email"
            name="email"
            required
            placeholder={t("footer.emailPlaceholder")}
            className="flex-1 border border-stone-light bg-bone px-4 py-3 text-sm"
          />
          <SubmitButton />
        </form>
      )}
      {state?.error && <p className="mt-3 text-xs text-clay">{state.error}</p>}
    </section>
  );
}
