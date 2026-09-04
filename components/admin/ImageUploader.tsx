"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { extractProductImagePath } from "@/lib/utils/storage";

export type UploadedImage = { url: string; sortOrder: number };

export function ImageUploader({
  images,
  onChange,
}: {
  images: UploadedImage[];
  onChange: (images: UploadedImage[]) => void;
}) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFiles(files: FileList | null) {
    if (!files || !files.length) return;
    setUploading(true);
    setError(null);
    const supabase = createClient();

    try {
      const uploaded: UploadedImage[] = [];
      for (const file of Array.from(files)) {
        const ext = file.name.split(".").pop();
        const path = `${crypto.randomUUID()}.${ext}`;

        const { error: uploadError } = await supabase.storage
          .from("product-images")
          .upload(path, file, { cacheControl: "3600", upsert: false });

        if (uploadError) {
          throw uploadError;
        }

        const {
          data: { publicUrl },
        } = supabase.storage.from("product-images").getPublicUrl(path);

        uploaded.push({ url: publicUrl, sortOrder: images.length + uploaded.length });
      }
      onChange([...images, ...uploaded]);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "فشل رفع الصورة، حاول تاني",
      );
    } finally {
      setUploading(false);
    }
  }

  function removeImage(url: string) {
    onChange(images.filter((img) => img.url !== url));

    // Delete the underlying file right away — if the admin never saves
    // the form after this, the file shouldn't be left orphaned in
    // Storage forever. Fire-and-forget: the image is already gone from
    // the form either way, so a network hiccup here isn't user-blocking.
    //
    // Trade-off: if this image was already saved on the product (loaded
    // via `initial`) and the admin removes it here but then navigates
    // away WITHOUT saving the form, the product_images row still points
    // at this now-deleted file until they save again. Accepted as the
    // simpler option over tracking "newly uploaded this session" vs.
    // "already persisted" separately just to guard a rare abandon-mid-edit case.
    const path = extractProductImagePath(url);
    if (path) {
      const supabase = createClient();
      supabase.storage.from("product-images").remove([path]).catch(() => {
        // Non-critical — worst case a small orphaned file remains.
      });
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <label className="text-xs uppercase tracking-widest2 text-stone">
        صور المنتج
      </label>

      <div className="grid grid-cols-4 gap-3">
        {images.map((img) => (
          // eslint-disable-next-line @next/next/no-img-element
          <div key={img.url} className="group relative aspect-[3/4] bg-stone-light">
            <img
              src={img.url}
              alt=""
              className="h-full w-full object-cover"
            />
            <button
              type="button"
              onClick={() => removeImage(img.url)}
              className="absolute end-1 top-1 bg-ink px-2 py-1 text-xs text-bone opacity-0 transition-opacity group-hover:opacity-100"
            >
              حذف
            </button>
          </div>
        ))}

        <label className="flex aspect-[3/4] cursor-pointer flex-col items-center justify-center border border-dashed border-stone-light text-xs text-stone hover:border-ink">
          {uploading ? "جارٍ الرفع..." : "+ إضافة صور"}
          <input
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            disabled={uploading}
            onChange={(e) => handleFiles(e.target.files)}
          />
        </label>
      </div>

      {error && <p className="text-sm text-clay">{error}</p>}
    </div>
  );
}
