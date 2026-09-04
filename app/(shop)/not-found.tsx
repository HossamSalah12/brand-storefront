import Link from "next/link";
import { Button } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <main className="flex min-h-[70vh] flex-col items-center justify-center gap-6 px-6 text-center">
      <p className="font-display text-6xl">404</p>
      <h1 className="font-display text-2xl">هذه الصفحة غير موجودة</h1>
      <p className="max-w-sm text-sm text-stone">
        الرابط اللي دخلت عليه مش موجود، أو اتشال. جرّب ترجع للمتجر.
      </p>
      <Link href="/">
        <Button size="lg">الصفحة الرئيسية</Button>
      </Link>
    </main>
  );
}
