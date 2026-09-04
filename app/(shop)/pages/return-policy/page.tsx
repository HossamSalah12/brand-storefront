import type { Metadata } from "next";
import { StaticPage } from "@/components/layout/StaticPage";
import { getLocale } from "@/lib/i18n/locale";

export const metadata: Metadata = { title: "Returns & Exchanges" };

export default function ReturnPolicyPage() {
  const locale = getLocale();

  if (locale === "en") {
    return (
      <StaticPage title="Returns & Exchanges">
        <p>
          You can request an exchange or return for any product within 14
          days of receiving it, provided the item is in its original
          condition, with tags, and unused.
        </p>
        <p>
          To request an exchange or return, contact us through the
          "Contact Us" page with your order number, and we'll guide you
          through the rest of the steps.
        </p>
        <p>
          <strong>Edit this text</strong> with your actual return window,
          conditions, and any return shipping costs.
        </p>
      </StaticPage>
    );
  }

  return (
    <StaticPage title="الاستبدال والاسترجاع">
      <p>
        تقدر تطلب استبدال أو استرجاع أي منتج خلال 14 يوم من تاريخ الاستلام،
        بشرط إن المنتج يكون في حالته الأصلية، بالتيكيت وغير مستخدم.
      </p>
      <p>
        للاستبدال أو الاسترجاع، تواصل معنا عن طريق صفحة "تواصل معنا" برقم
        الطلب، وهنساعدك في باقي الخطوات.
      </p>
      <p>
        <strong>عدّل هذا النص</strong> بمدة الاسترجاع الفعلية وشروطها
        وتكلفة الشحن الخاصة بالاسترجاع إن وجدت.
      </p>
    </StaticPage>
  );
}
