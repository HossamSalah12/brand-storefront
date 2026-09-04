"use client";

import { useState } from "react";
import Image from "next/image";
import { clsx } from "clsx";
import { ImageLightbox } from "@/components/product/ImageLightbox";

export function ProductGallery({
  images,
  productName,
}: {
  images: { url: string; sort_order: number }[];
  productName: string;
}) {
  const sorted = [...images].sort((a, b) => a.sort_order - b.sort_order);
  const [active, setActive] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  if (!sorted.length) {
    return <div className="aspect-[3/4] bg-stone-light" />;
  }

  return (
    <div className="flex flex-col gap-3 md:flex-row-reverse">
      {/* Main image */}
      <div className="flex-1 overflow-x-auto md:overflow-visible">
        <div className="flex snap-x snap-mandatory md:hidden">
          {sorted.map((img, i) => (
            <button
              key={img.url}
              onClick={() => {
                setLightboxIndex(i);
                setLightboxOpen(true);
              }}
              className="relative aspect-[3/4] w-full shrink-0 snap-center"
              aria-label={`${productName} — expand image ${i + 1}`}
            >
              <Image
                src={img.url}
                alt={`${productName} — صورة ${i + 1}`}
                fill
                sizes="100vw"
                className="object-cover"
                priority={i === 0}
              />
            </button>
          ))}
        </div>
        {/* Desktop: show active image large */}
        <button
          onClick={() => {
            setLightboxIndex(active);
            setLightboxOpen(true);
          }}
          className="relative hidden aspect-[3/4] w-full cursor-zoom-in md:block"
          aria-label={`${productName} — expand image`}
        >
          <Image
            src={sorted[active].url}
            alt={`${productName} — صورة ${active + 1}`}
            fill
            sizes="50vw"
            className="object-cover"
            priority
          />
        </button>
      </div>

      {/* Thumbnails (desktop only) */}
      {sorted.length > 1 && (
        <div className="hidden w-20 flex-col gap-3 md:flex">
          {sorted.map((img, i) => (
            <button
              key={img.url}
              onClick={() => setActive(i)}
              className={clsx(
                "relative aspect-[3/4] overflow-hidden border",
                active === i ? "border-ink" : "border-transparent",
              )}
            >
              <Image src={img.url} alt="" fill sizes="80px" className="object-cover" />
            </button>
          ))}
        </div>
      )}

      {lightboxOpen && (
        <ImageLightbox
          images={sorted}
          initialIndex={lightboxIndex}
          productName={productName}
          onClose={() => setLightboxOpen(false)}
        />
      )}
    </div>
  );
}
