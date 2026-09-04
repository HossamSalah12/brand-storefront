import { dictionaries } from "@/lib/i18n/dictionaries";
import type { Locale } from "@/lib/i18n/locale";

export function getDictionary(locale: Locale) {
  const dict = dictionaries[locale];

  function t(path: string, vars?: Record<string, string | number>) {
    const value = path.split(".").reduce((acc: any, key) => acc?.[key], dict);
    let result = typeof value === "string" ? value : path;
    if (vars) {
      result = result.replace(/\{(\w+)\}/g, (_: string, key: string) =>
        key in vars ? String(vars[key]) : `{${key}}`,
      );
    }
    return result;
  }

  return { dict, t };
}
