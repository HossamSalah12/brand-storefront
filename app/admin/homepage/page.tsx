import { getStoreSettings } from "@/lib/actions/settings";
import { HeroImageUploader } from "@/components/admin/HeroImageUploader";

export default async function AdminHomepagePage() {
  const { heroImageUrl } = await getStoreSettings();

  return (
    <div>
      <h1 className="mb-2 font-display text-2xl">الصفحة الرئيسية</h1>
      <p className="mb-6 text-sm text-stone">
        صورة خلفية اختيارية لقسم الـ Hero في أعلى الصفحة الرئيسية. لو مفيش
        صورة، هيفضل التصميم الحالي (خلفية بلون واحد) شغال عادي.
      </p>
      <HeroImageUploader initialUrl={heroImageUrl} />
    </div>
  );
}
