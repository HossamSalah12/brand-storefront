import type { Metadata } from "next";
import { StaticPage } from "@/components/layout/StaticPage";
import { getLocale } from "@/lib/i18n/locale";

export const metadata: Metadata = { title: "Contact" };

export default function ContactPage() {
  const locale = getLocale();
  const isEn = locale === "en";

  return (
    <StaticPage title={isEn ? "Contact Us" : "تواصل معنا"}>
      <p>
        {isEn
          ? "We'd love to hear from you for any question about orders, products, or sizing."
          : "يسعدنا تواصلك معنا لأي استفسار عن الطلبات أو المنتجات أو المقاسات."}
      </p>
      <div className="flex flex-col gap-2 pt-2">
        <a href="mailto:support@example.com" className="text-ink underline">
          support@example.com
        </a>
        <a href="tel:+201000000000" className="text-ink underline" dir="ltr">
          +20 100 000 0000
        </a>
        <a
          href="https://wa.me/201000000000"
          target="_blank"
          rel="noopener noreferrer"
          className="text-ink underline"
        >
          {isEn ? "WhatsApp" : "واتساب"}
        </a>
      </div>
      <p className="pt-4 text-xs">
        <strong>{isEn ? "Edit these details" : "عدّل هذه الأرقام والروابط"}</strong>{" "}
        {isEn
          ? "with your brand's real contact information in app/(shop)/pages/contact/page.tsx."
          : "ببيانات التواصل الحقيقية لبراندك في app/(shop)/pages/contact/page.tsx."}
      </p>
    </StaticPage>
  );
}
