import type { Metadata } from "next";
import { StaticPage } from "@/components/layout/StaticPage";
import { getLocale } from "@/lib/i18n/locale";

export const metadata: Metadata = { title: "Privacy Policy" };

export default function PrivacyPage() {
  const locale = getLocale();

  if (locale === "en") {
    return (
      <StaticPage title="Privacy Policy">
        <p>
          We collect your data (name, phone number, email, and address)
          solely to fulfill and deliver your orders, and we don't share it
          with any third party other than the shipping carrier delivering
          your order.
        </p>
        <p>
          Your data is stored securely, and your account is protected by a
          password and strict database-level access rules.
        </p>
        <p>You can request deletion of your data at any time by contacting us.</p>
        <p>
          <strong>Edit this text</strong> to match your brand's actual
          privacy policy and any local legal requirements.
        </p>
      </StaticPage>
    );
  }

  return (
    <StaticPage title="سياسة الخصوصية">
      <p>
        بنجمع بياناتك (الاسم، رقم الهاتف، البريد الإلكتروني، والعنوان) فقط
        لغرض تنفيذ وتوصيل طلباتك، ومش بنشاركها مع أي طرف تالت غير شركة
        الشحن اللي بتوصل طلبك.
      </p>
      <p>
        بياناتك محفوظة بشكل آمن، وبيانات حسابك محمية بكلمة مرور وبقواعد
        صلاحيات صارمة على مستوى قاعدة البيانات.
      </p>
      <p>
        تقدر تطلب حذف بياناتك في أي وقت عن طريق التواصل معنا.
      </p>
      <p>
        <strong>عدّل هذا النص</strong> ليتوافق مع سياسة الخصوصية الفعلية
        لبراندك وأي متطلبات قانونية محلية تخصك.
      </p>
    </StaticPage>
  );
}
