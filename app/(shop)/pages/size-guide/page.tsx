import type { Metadata } from "next";
import { StaticPage } from "@/components/layout/StaticPage";
import { getLocale } from "@/lib/i18n/locale";

export const metadata: Metadata = { title: "Size Guide" };

export default function SizeGuidePage() {
  const locale = getLocale();

  if (locale === "en") {
    return (
      <StaticPage title="Size Guide">
        <p>
          Every product has its own measurement table shown on its product
          page, since fit varies from piece to piece. These guidelines
          will help you take accurate measurements before you buy.
        </p>
        <div className="flex flex-col gap-3 pt-2">
          <p><strong>Chest:</strong> wrap the tape around the fullest part of your chest.</p>
          <p><strong>Shoulder width:</strong> from one shoulder edge to the other, across the back.</p>
          <p><strong>Length:</strong> from the top of the shoulder to your desired length.</p>
          <p><strong>Sleeve length:</strong> from the shoulder to the wrist.</p>
        </div>
        <p className="pt-4">
          Not sure of your size? Use the "Find My Size" feature on any
          product page — it'll suggest the right size based on your
          measurements and the product's own measurements.
        </p>
      </StaticPage>
    );
  }

  return (
    <StaticPage title="دليل المقاسات">
      <p>
        كل منتج عندنا له جدول مقاسات خاص به يظهر في صفحة المنتج نفسها، لأن
        القصّة بتختلف من قطعة لأخرى. الإرشادات دي عشان تساعدك تاخد قياساتك
        بشكل صحيح قبل ما تشتري.
      </p>
      <div className="flex flex-col gap-3 pt-2">
        <p><strong>محيط الصدر:</strong> لف الشريط حول أوسع جزء في صدرك.</p>
        <p><strong>عرض الكتف:</strong> من نهاية كتف لنهاية التاني من الخلف.</p>
        <p><strong>الطول:</strong> من أعلى الكتف لحد الطول المطلوب.</p>
        <p><strong>طول الكم:</strong> من الكتف لحد المعصم.</p>
      </div>
      <p className="pt-4">
        لو مش متأكد من مقاسك، استخدم خاصية "اعرف مقاسك" الموجودة في صفحة كل
        منتج — هتقترح لك المقاس المناسب بناءً على قياساتك وقياسات المنتج نفسه.
      </p>
    </StaticPage>
  );
}
