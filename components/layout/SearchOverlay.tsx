"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useLocale } from "@/lib/i18n/LocaleContext";

export function SearchOverlay({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [query, setQuery] = useState("");
  const [visible, setVisible] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const { t } = useLocale();

  useEffect(() => {
    if (open) {
      const id = requestAnimationFrame(() => setVisible(true));
      inputRef.current?.focus();
      return () => cancelAnimationFrame(id);
    }
    setVisible(false);
  }, [open]);

  if (!open) return null;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;
    router.push(`/search?q=${encodeURIComponent(query.trim())}`);
    onClose();
  }

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col bg-bone transition-opacity duration-300 ease-editorial ${
        visible ? "opacity-100" : "opacity-0"
      }`}
    >
      <div className="flex items-center justify-between px-6 py-4">
        <span className="text-sm uppercase tracking-widest2 text-stone">
          {t("common.search")}
        </span>
        <button
          onClick={onClose}
          aria-label={t("common.close")}
          className="text-2xl leading-none transition-transform duration-200 ease-editorial hover:rotate-90"
        >
          ×
        </button>
      </div>
      <form
        onSubmit={handleSubmit}
        className={`flex flex-1 items-start justify-center px-6 pt-16 transition-all duration-300 ease-editorial ${
          visible ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"
        }`}
      >
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t("nav.searchPlaceholder")}
          className="w-full max-w-xl border-b border-ink bg-transparent pb-3 text-center font-display text-2xl outline-none placeholder:text-stone"
        />
      </form>
    </div>
  );
}
