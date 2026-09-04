"use client";

import { createContext, useContext, useTransition, type ReactNode } from "react";
import { dictionaries } from "@/lib/i18n/dictionaries";
import { setLocaleAction } from "@/lib/i18n/actions";
import type { Locale } from "@/lib/i18n/locale";

type Dictionary = (typeof dictionaries)["ar"];

type LocaleContextValue = {
  locale: Locale;
  isRtl: boolean;
  dict: Dictionary;
  t: (path: string, vars?: Record<string, string | number>) => string;
  switchLocale: (locale: Locale) => void;
  isSwitching: boolean;
};

const LocaleContext = createContext<LocaleContextValue | null>(null);

function resolvePath(obj: any, path: string): string {
  const value = path.split(".").reduce((acc, key) => acc?.[key], obj);
  return typeof value === "string" ? value : path;
}

function interpolate(template: string, vars?: Record<string, string | number>) {
  if (!vars) return template;
  return template.replace(/\{(\w+)\}/g, (_, key) =>
    key in vars ? String(vars[key]) : `{${key}}`,
  );
}

export function LocaleProvider({
  locale,
  children,
}: {
  locale: Locale;
  children: ReactNode;
}) {
  const [isSwitching, startTransition] = useTransition();
  const dict = dictionaries[locale];

  function t(path: string, vars?: Record<string, string | number>) {
    return interpolate(resolvePath(dict, path), vars);
  }

  function switchLocale(next: Locale) {
    startTransition(async () => {
      await setLocaleAction(next);
      window.location.reload();
    });
  }

  return (
    <LocaleContext.Provider
      value={{ locale, isRtl: locale === "ar", dict, t, switchLocale, isSwitching }}
    >
      {children}
    </LocaleContext.Provider>
  );
}

export function useLocale() {
  const ctx = useContext(LocaleContext);
  if (!ctx) throw new Error("useLocale must be used within LocaleProvider");
  return ctx;
}
