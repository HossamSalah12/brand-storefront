"use client";

import { useState, type ReactNode } from "react";

export function AccordionItem({
  title,
  icon,
  defaultOpen = false,
  children,
}: {
  title: string;
  icon?: ReactNode;
  defaultOpen?: boolean;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="border-t border-stone-light">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full items-center justify-between py-4 text-start"
      >
        <span className="flex items-center gap-2 text-sm uppercase tracking-widest2 text-ink">
          {icon}
          {title}
        </span>
        <span
          className={`text-lg leading-none text-stone transition-transform duration-300 ease-editorial ${
            open ? "rotate-45" : ""
          }`}
        >
          +
        </span>
      </button>
      <div
        className="grid overflow-hidden transition-all duration-300 ease-editorial"
        style={{ gridTemplateRows: open ? "1fr" : "0fr" }}
      >
        <div className="min-h-0 overflow-hidden">
          <div className="pb-4 text-sm text-stone">{children}</div>
        </div>
      </div>
    </div>
  );
}
