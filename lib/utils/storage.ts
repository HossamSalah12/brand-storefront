const PRODUCT_IMAGES_MARKER = "/product-images/";

/**
 * Turns a public Supabase Storage URL back into the object path needed
 * for storage.remove(). Returns null for anything that doesn't look like
 * one of our own product-images URLs (defensive — never try to delete
 * something we don't recognize).
 */
export function extractProductImagePath(url: string): string | null {
  const idx = url.indexOf(PRODUCT_IMAGES_MARKER);
  if (idx === -1) return null;
  const path = url.slice(idx + PRODUCT_IMAGES_MARKER.length).split("?")[0];
  return path || null;
}
