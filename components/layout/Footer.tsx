"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useFormState, useFormStatus } from "react-dom";
import { useLocale } from "@/lib/i18n/LocaleContext";
import { subscribeNewsletterAction } from "@/lib/actions/newsletter";
import { useToast } from "@/lib/toast/ToastContext";

function NewsletterSubmitButton() {
  const { pending } = useFormStatus();
  const { t } = useLocale();
  return (
    <button
      type="submit"
      disabled={pending}
      className="bg-ink px-3 py-2 text-xs uppercase tracking-widest2 text-bone disabled:opacity-50"
    >
      {pending ? "..." : t("footer.subscribe")}
    </button>
  );
}

function NewsletterForm() {
  const [state, formAction] = useFormState(subscribeNewsletterAction, null);
  const { t } = useLocale();
  const { showToast } = useToast();

  useEffect(() => {
    if (state?.success) showToast(t("footer.subscribed"), "success");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  if (state?.success) {
    return (
      <p className="mt-4 text-sm text-moss">
        {t("footer.subscribed")}
      </p>
    );
  }

  return (
    <form action={formAction} className="mt-4 flex flex-col gap-2">
      <input
        type="email"
        name="email"
        placeholder={t("footer.emailPlaceholder")}
        required
        className="border border-stone-light bg-transparent px-3 py-2 text-sm"
      />
      <NewsletterSubmitButton />
      {state?.error && <p className="text-xs text-clay">{state.error}</p>}
    </form>
  );
}

export function Footer() {
  const { t } = useLocale();

  const footerLinks = [
    {
      title: t("footer.shop"),
      links: [
        { href: "/shop", label: t("footer.allProducts") },
        { href: "/shop", label: t("footer.newArrivals") },
      ],
    },
    {
      title: t("footer.help"),
      links: [
        { href: "/pages/shipping-policy", label: t("footer.shippingPolicy") },
        { href: "/pages/return-policy", label: t("footer.returnPolicy") },
        { href: "/pages/size-guide", label: t("footer.sizeGuide") },
        { href: "/pages/contact", label: t("footer.contact") },
      ],
    },
    {
      title: t("footer.company"),
      links: [
        { href: "/pages/about", label: t("footer.aboutUs") },
        { href: "/pages/privacy", label: t("footer.privacy") },
        { href: "/pages/terms", label: t("footer.terms") },
      ],
    },
  ];

  return (
    <footer className="mt-24 border-t border-stone-light bg-bone">
      <div className="mx-auto max-w-7xl px-6 py-16">
        <div className="grid grid-cols-2 gap-10 md:grid-cols-5">
          <div className="col-span-2">
            <p className="font-display text-lg uppercase tracking-widest2">
              Your Brand
            </p>
            <p className="mt-3 max-w-xs text-sm text-stone">{t("footer.tagline")}</p>
            <div className="mt-6 flex gap-4 text-sm">
              <a href="#" aria-label="Instagram">
                Instagram
              </a>
              <a href="#" aria-label="TikTok">
                TikTok
              </a>
            </div>
          </div>

          {footerLinks.map((group) => (
            <div key={group.title}>
              <p className="text-xs uppercase tracking-widest2 text-stone">
                {group.title}
              </p>
              <ul className="mt-4 flex flex-col gap-3 text-sm">
                {group.links.map((link) => (
                  <li key={link.label}>
                    <Link href={link.href} className="hover:text-clay">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div>
            <p className="text-xs uppercase tracking-widest2 text-stone">
              {t("footer.newsletter")}
            </p>
            <NewsletterForm />
          </div>
        </div>

        <div className="mt-12 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 border-t border-stone-light pt-8 text-xs text-stone">
          <span className="flex items-center gap-2">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <rect x="2" y="6" width="20" height="12" rx="1.5" />
              <circle cx="12" cy="12" r="2.5" />
            </svg>
            {t("footer.codAvailable")}
          </span>
          <span className="flex items-center gap-2">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <rect x="4" y="10" width="16" height="10" rx="1.5" />
              <path d="M8 10V7a4 4 0 0 1 8 0v3" />
            </svg>
            {t("footer.secureCheckout")}
          </span>
          <span className="flex items-center gap-2">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M3 10h13a4 4 0 0 1 4 4v3" />
              <path d="M9 4 3 10l6 6" />
            </svg>
            {t("footer.easyReturns")}
          </span>
        </div>

        <p className="mt-8 text-center text-xs text-stone">
          © {new Date().getFullYear()} Your Brand. {t("footer.rights")}
        </p>
      </div>
    </footer>
  );
}
