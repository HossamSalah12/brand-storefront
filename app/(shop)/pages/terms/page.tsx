import type { Metadata } from "next";
import { StaticPage } from "@/components/layout/StaticPage";
import { getLocale } from "@/lib/i18n/locale";

export const metadata: Metadata = { title: "Terms & Conditions" };

export default function TermsPage() {
  const locale = getLocale();

  if (locale === "en") {
    return (
      <StaticPage title="Terms & Conditions">
        <p>
          By using this website, you agree to the following: prices shown
          are final and include tax where applicable, and the only
          payment method currently available is Cash on Delivery.
        </p>
        <p>
          We reserve the right to change prices or product availability
          at any time without prior notice. Orders are subject to actual
          stock confirmation.
        </p>
        <p>
          <strong>Edit this text</strong> with your brand's full legal
          terms.
        </p>
      </StaticPage>
    );
  }

  return (
    <StaticPage title="الشروط والأحكام">
      <p>
        باستخدامك لهذا الموقع، فإنك توافق على الشروط التالية: الأسعار
        المعروضة نهائية وتشمل الضريبة إن وجدت، والدفع المتاح حاليًا هو
        الدفع عند الاستلام فقط.
      </p>
      <p>
        نحتفظ بالحق في تعديل الأسعار أو توفر المنتجات في أي وقت من غير
        إشعار مسبق. الطلبات تخضع لتأكيد التوفر الفعلي للمخزون.
      </p>
      <p>
        <strong>عدّل هذا النص</strong> بالشروط القانونية الكاملة الخاصة
        ببراندك.
      </p>
    </StaticPage>
  );
}
