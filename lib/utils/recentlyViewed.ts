"use client";

const STORAGE_KEY = "brand-storefront:recently-viewed";
const MAX_ITEMS = 8;

export function trackRecentlyViewed(productId: string) {
  if (typeof window === "undefined") return;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const ids: string[] = raw ? JSON.parse(raw) : [];
    const next = [productId, ...ids.filter((id) => id !== productId)].slice(0, MAX_ITEMS);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // Storage unavailable — recently viewed just won't persist, not critical.
  }
}

export function getRecentlyViewedIds(excludeId?: string): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const ids: string[] = raw ? JSON.parse(raw) : [];
    return ids.filter((id) => id !== excludeId);
  } catch {
    return [];
  }
}
