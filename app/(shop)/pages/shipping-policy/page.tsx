import type { Metadata } from "next";
import { StaticPage } from "@/components/layout/StaticPage";
import { getLocale } from "@/lib/i18n/locale";

export const metadata: Metadata = { title: "Shipping Policy" };

export default function ShippingPolicyPage() {
  const locale = getLocale();

  if (locale === "en") {
    return (
      <StaticPage title="Shipping Policy">
        <p>
          Orders are prepared within 1-3 business days, then shipped based
          on your governorate. Expected delivery time is 2 to 5 business
          days depending on your location.
        </p>
        <p>
          Shipping cost is calculated automatically at checkout based on
          the selected governorate, and may be free for orders above a
          certain amount — this will be clearly shown before you confirm
          your order.
        </p>
        <p>
          <strong>Edit this text</strong> to reflect your actual delivery
          times and your shipping carrier's policy.
        </p>
      </StaticPage>
    );
  }

  return (
    <StaticPage title="سياسة الشحن">
      <p>
        بيتم تجهيز الطلبات خلال 1-3 أيام عمل، وبعد كده بيتم شحنها حسب
        المحافظة. مدة التوصيل المتوقعة من 2 إلى 5 أيام عمل حسب موقعك.
      </p>
      <p>
        سعر الشحن بيتحدد تلقائيًا في صفحة إتمام الشراء حسب المحافظة
        المختارة، وممكن يكون مجاني للطلبات اللي بتتعدى حد معين — هيظهر ليك
        بوضوح قبل تأكيد الطلب.
      </p>
      <p>
        <strong>عدّل هذا النص</strong> ليعكس مدد التوصيل الفعلية وسياسة
        شركة الشحن اللي هتتعامل معاها.
      </p>
    </StaticPage>
  );
}
