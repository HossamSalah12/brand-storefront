"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // eslint-disable-next-line no-console
    console.error(error);
  }, [error]);

  return (
    <main className="flex min-h-[70vh] flex-col items-center justify-center gap-6 px-6 text-center">
      <h1 className="font-display text-2xl">حصل خطأ غير متوقع</h1>
      <p className="max-w-sm text-sm text-stone">
        حصلت مشكلة ونحن بنحاول نصلحها. جرّب تاني، أو ارجع للصفحة الرئيسية.
      </p>
      <div className="flex gap-3">
        <Button size="lg" onClick={reset}>
          حاول تاني
        </Button>
        <Link href="/">
          <Button variant="secondary" size="lg">
            الصفحة الرئيسية
          </Button>
        </Link>
      </div>
    </main>
  );
}
