import type { Metadata } from "next";
import { StaticPage } from "@/components/layout/StaticPage";
import { getLocale } from "@/lib/i18n/locale";

export const metadata: Metadata = { title: "About" };

export default function AboutPage() {
  const locale = getLocale();

  if (locale === "en") {
    return (
      <StaticPage title="About Us">
        <p>
          We started Your Brand with a simple idea: essentials worth
          trusting, away from fast fashion's fleeting pace. Every piece we
          make is designed and crafted with care, from material selection
          down to the smallest stitching detail.
        </p>
        <p>
          Our goal is to give you a simple, comfortable wardrobe you can
          rely on for years, not just a season.
        </p>
        <p>
          <strong>Edit this text</strong> to reflect your brand's real
          story, vision, and values.
        </p>
      </StaticPage>
    );
  }

  return (
    <StaticPage title="من نحن">
      <p>
        بدأنا Your Brand بفكرة بسيطة: ملابس أساسية بجودة تستحق الثقة، بعيدًا
        عن سرعة الموضة العابرة. كل قطعة عندنا بتتصمم وتتصنع بعناية، من
        اختيار الخامة لحد التفاصيل الصغيرة في التفصيل والخياطة.
      </p>
      <p>
        هدفنا إننا نقدملك خزانة ملابس بسيطة، مريحة، وتقدر تعتمد عليها لسنين
        مش لموسم واحد بس.
      </p>
      <p>
        <strong>عدّل هذا النص</strong> ليعكس قصة براندك الحقيقية، رؤيتك،
        وقيمك.
      </p>
    </StaticPage>
  );
}
