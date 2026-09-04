"use client";

import { useState, useTransition } from "react";
import { createClient } from "@/lib/supabase/client";
import { updateHeroImageAction } from "@/lib/actions/homepage";
import { Button } from "@/components/ui/Button";

export function HeroImageUploader({ initialUrl }: { initialUrl: string | null }) {
  const [url, setUrl] = useState(initialUrl);
  const [uploading, setUploading] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  async function handleUpload(file: File) {
    setUploading(true);
    setError(null);
    try {
      const supabase = createClient();
      const ext = file.name.split(".").pop();
      const path = `hero/${crypto.randomUUID()}.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from("product-images")
        .upload(path, file, { cacheControl: "3600", upsert: false });
      if (uploadError) throw uploadError;
      const {
        data: { publicUrl },
      } = supabase.storage.from("product-images").getPublicUrl(path);
      setUrl(publicUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : "فشل رفع الصورة");
    } finally {
      setUploading(false);
    }
  }

  function handleSave() {
    startTransition(async () => {
      await updateHeroImageAction(url);
    });
  }

  function handleClear() {
    setUrl(null);
    startTransition(async () => {
      await updateHeroImageAction(null);
    });
  }

  return (
    <div className="flex flex-col gap-4">
      {url ? (
        <div className="relative aspect-[16/9] max-w-xl overflow-hidden bg-stone-light">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={url} alt="" className="h-full w-full object-cover" />
        </div>
      ) : (
        <div className="flex aspect-[16/9] max-w-xl items-center justify-center border border-dashed border-stone-light text-sm text-stone">
          لا توجد صورة — التصميم الحالي (خلفية بلون واحد) هيفضل شغال
        </div>
      )}

      <div className="flex items-center gap-3">
        <label className="cursor-pointer border border-stone-light px-4 py-2 text-xs uppercase tracking-widest2">
          {uploading ? "جارٍ الرفع..." : "رفع صورة"}
          <input
            type="file"
            accept="image/*"
            className="hidden"
            disabled={uploading}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleUpload(file);
            }}
          />
        </label>
        <Button size="sm" onClick={handleSave} disabled={isPending || uploading}>
          {isPending ? "جارٍ الحفظ..." : "حفظ"}
        </Button>
        {url && (
          <button onClick={handleClear} className="text-xs text-clay underline">
            إزالة الصورة
          </button>
        )}
      </div>
      {error && <p className="text-sm text-clay">{error}</p>}
    </div>
  );
}
