"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

export function ImageLightbox({
  images,
  initialIndex,
  productName,
  onClose,
}: {
  images: { url: string; sort_order: number }[];
  initialIndex: number;
  productName: string;
  onClose: () => void;
}) {
  const [index, setIndex] = useState(initialIndex);
  const [zoomed, setZoomed] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const id = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(id);
  }, []);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") setIndex((i) => (i + 1) % images.length);
      if (e.key === "ArrowLeft") setIndex((i) => (i - 1 + images.length) % images.length);
    }
    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [images.length, onClose]);

  let touchStartX = 0;
  function handleTouchStart(e: React.TouchEvent) {
    touchStartX = e.touches[0].clientX;
  }
  function handleTouchEnd(e: React.TouchEvent) {
    const delta = e.changedTouches[0].clientX - touchStartX;
    if (Math.abs(delta) > 50) {
      setIndex((i) => (delta < 0 ? (i + 1) % images.length : (i - 1 + images.length) % images.length));
      setZoomed(false);
    }
  }

  return (
    <div
      className={`fixed inset-0 z-[200] flex flex-col bg-ink transition-opacity duration-300 ease-editorial ${
        visible ? "opacity-100" : "opacity-0"
      }`}
    >
      <div className="flex items-center justify-between px-4 py-3 text-bone">
        <span className="text-xs uppercase tracking-widest2 text-bone/70">
          {index + 1} / {images.length}
        </span>
        <button onClick={onClose} aria-label="Close" className="text-2xl leading-none">
          ×
        </button>
      </div>

      <div
        className="relative flex flex-1 items-center justify-center overflow-hidden"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <button
          onClick={() => {
            setIndex((i) => (i - 1 + images.length) % images.length);
            setZoomed(false);
          }}
          aria-label="Previous"
          className="absolute start-2 z-10 hidden h-10 w-10 items-center justify-center text-2xl text-bone/70 hover:text-bone md:flex"
        >
          ‹
        </button>

        <div
          className={`relative h-full w-full cursor-zoom-in transition-transform duration-300 ease-editorial ${
            zoomed ? "scale-150 cursor-zoom-out" : "scale-100"
          }`}
          onClick={() => setZoomed((z) => !z)}
        >
          <Image
            src={images[index].url}
            alt={`${productName} — ${index + 1}`}
            fill
            sizes="100vw"
            className="object-contain"
            priority
          />
        </div>

        <button
          onClick={() => {
            setIndex((i) => (i + 1) % images.length);
            setZoomed(false);
          }}
          aria-label="Next"
          className="absolute end-2 z-10 hidden h-10 w-10 items-center justify-center text-2xl text-bone/70 hover:text-bone md:flex"
        >
          ›
        </button>
      </div>

      {images.length > 1 && (
        <div className="flex justify-center gap-2 pb-4">
          {images.map((img, i) => (
            <button
              key={img.url}
              onClick={() => {
                setIndex(i);
                setZoomed(false);
              }}
              aria-label={`Go to image ${i + 1}`}
              className={`h-1.5 w-1.5 rounded-full transition-colors ${
                i === index ? "bg-bone" : "bg-bone/30"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
