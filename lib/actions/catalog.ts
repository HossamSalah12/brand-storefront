import { createClient } from "@/lib/supabase/server";
import type { Locale } from "@/lib/i18n/locale";

export type ProductListItem = {
  id: string;
  name: string;
  slug: string;
  base_price: number;
  compare_at_price: number | null;
  product_images: { url: string; sort_order: number }[];
  product_variants: {
    id: string;
    sku: string;
    color_id: string;
    size_id: string;
    price_override: number | null;
    image_url: string | null;
    colors: { name: string; hex_value: string | null } | null;
    sizes: { name: string; sort_order: number } | null;
    variant_inventory: { quantity: number } | { quantity: number }[] | null;
  }[];
};

export type ProductFilters = {
  categorySlug?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  colorIds?: string[];
  sizeIds?: string[];
  sort?: "newest" | "price_asc" | "price_desc" | "best_selling";
};

const LIST_SELECT = `
  id, name, name_en, slug, base_price, compare_at_price, created_at, is_best_seller,
  product_images(url, sort_order),
  product_variants(id, sku, color_id, colors(name, name_en, hex_value), size_id, sizes(name, name_en, sort_order), price_override, image_url, variant_inventory(quantity))
`;

/**
 * Overwrites Arabic fields with their English counterpart when present
 * and the active locale is 'en' — falls back to Arabic otherwise, so a
 * product with no translation yet still displays correctly. Applied
 * once here rather than in every component that reads product data.
 */
function localizeProduct(row: any, locale: Locale) {
  if (locale === "en") {
    row = {
      ...row,
      name: row.name_en?.trim() ? row.name_en : row.name,
    };
    if (row.product_variants) {
      row.product_variants = row.product_variants.map((v: any) => ({
        ...v,
        colors: v.colors
          ? { ...v.colors, name: v.colors.name_en?.trim() ? v.colors.name_en : v.colors.name }
          : v.colors,
        sizes: v.sizes
          ? { ...v.sizes, name: v.sizes.name_en?.trim() ? v.sizes.name_en : v.sizes.name }
          : v.sizes,
      }));
    }
  }
  return row as ProductListItem;
}

function localizeCategory(row: any, locale: Locale) {
  if (locale === "en" && row.name_en?.trim()) {
    return { ...row, name: row.name_en };
  }
  return row;
}

function localizeLookup(row: any, locale: Locale) {
  if (locale === "en" && row.name_en?.trim()) {
    return { ...row, name: row.name_en };
  }
  return row;
}

/**
 * Shared product-listing query used by /shop, /shop/[category], and /search.
 * Only ever reads status = 'active' products — draft/archived never reach
 * the public storefront regardless of what filters are applied.
 */
export async function getProducts(filters: ProductFilters = {}, locale: Locale = "ar") {
  const supabase = createClient();
  let query = supabase.from("products").select(LIST_SELECT).eq("status", "active");

  if (filters.search) {
    const q = filters.search;
    query = query.or(
      `name.ilike.%${q}%,name_en.ilike.%${q}%,description.ilike.%${q}%,description_en.ilike.%${q}%,material.ilike.%${q}%,material_en.ilike.%${q}%`,
    );
  }
  if (filters.minPrice != null) {
    query = query.gte("base_price", filters.minPrice);
  }
  if (filters.maxPrice != null) {
    query = query.lte("base_price", filters.maxPrice);
  }
  if (filters.categorySlug) {
    const { data: category } = await supabase
      .from("categories")
      .select("id")
      .eq("slug", filters.categorySlug)
      .single();
    if (category) query = query.eq("category_id", category.id);
    else return [];
  }

  switch (filters.sort) {
    case "price_asc":
      query = query.order("base_price", { ascending: true });
      break;
    case "price_desc":
      query = query.order("base_price", { ascending: false });
      break;
    case "best_selling":
      query = query.order("is_best_seller", { ascending: false });
      break;
    default:
      query = query.order("created_at", { ascending: false });
  }

  const { data, error } = await query;
  if (error || !data) return [];

  let products = data.map((row) => localizeProduct(row, locale));

  // Color/size filters applied in-memory since they touch a nested table —
  // simplest correct approach for a small catalog.
  if (filters.colorIds?.length) {
    products = products.filter((p) =>
      p.product_variants.some((v) => filters.colorIds!.includes(v.color_id)),
    );
  }
  if (filters.sizeIds?.length) {
    products = products.filter((p) =>
      p.product_variants.some((v: any) => filters.sizeIds!.includes(v.size_id)),
    );
  }

  return products;
}

export async function getFeaturedProducts(locale: Locale = "ar") {
  const supabase = createClient();
  const { data } = await supabase
    .from("products")
    .select(LIST_SELECT)
    .eq("status", "active")
    .eq("is_featured", true)
    .limit(8);
  return (data ?? []).map((row) => localizeProduct(row, locale));
}

export async function getNewArrivals(locale: Locale = "ar") {
  const supabase = createClient();
  const { data } = await supabase
    .from("products")
    .select(LIST_SELECT)
    .eq("status", "active")
    .eq("is_new_arrival", true)
    .order("created_at", { ascending: false })
    .limit(8);
  return (data ?? []).map((row) => localizeProduct(row, locale));
}

export async function getBestSellers(locale: Locale = "ar") {
  const supabase = createClient();
  const { data } = await supabase
    .from("products")
    .select(LIST_SELECT)
    .eq("status", "active")
    .eq("is_best_seller", true)
    .limit(8);
  return (data ?? []).map((row) => localizeProduct(row, locale));
}

export async function getCategories(locale: Locale = "ar") {
  const supabase = createClient();
  const { data } = await supabase
    .from("categories")
    .select("id, name, name_en, slug, image_url")
    .order("sort_order");
  return (data ?? []).map((row) => localizeCategory(row, locale));
}

export async function getAllColors(locale: Locale = "ar") {
  const supabase = createClient();
  const { data } = await supabase
    .from("colors")
    .select("id, name, name_en, hex_value")
    .order("name");
  return (data ?? []).map((row) => localizeLookup(row, locale));
}

export async function getAllSizes(locale: Locale = "ar") {
  const supabase = createClient();
  const { data } = await supabase
    .from("sizes")
    .select("id, name, name_en")
    .order("sort_order");
  return (data ?? []).map((row) => localizeLookup(row, locale));
}

export async function getProductBySlug(slug: string, locale: Locale = "ar") {
  const supabase = createClient();
  const { data: product } = await supabase
    .from("products")
    .select(
      `
      id, name, name_en, slug, description, description_en, material, material_en,
      care_instructions, care_instructions_en, base_price, compare_at_price,
      category_id,
      product_images(url, sort_order),
      product_measurements(size_id, chest_cm, shoulder_cm, length_cm, sleeve_cm, sizes(name, name_en, sort_order)),
      product_variants(id, color_id, size_id, sku, price_override, image_url,
        colors(name, name_en, hex_value), sizes(name, name_en, sort_order),
        variant_inventory(quantity))
    `,
    )
    .eq("slug", slug)
    .eq("status", "active")
    .single();

  if (!product) return null;
  if (locale !== "en") return product;

  // Full localization for the product detail page: name, description,
  // material, care instructions, every variant's color/size name, and
  // every measurement row's size name.
  const p: any = { ...product };
  if (p.name_en?.trim()) p.name = p.name_en;
  if (p.description_en?.trim()) p.description = p.description_en;
  if (p.material_en?.trim()) p.material = p.material_en;
  if (p.care_instructions_en?.trim()) p.care_instructions = p.care_instructions_en;

  p.product_variants = (p.product_variants ?? []).map((v: any) => ({
    ...v,
    colors: v.colors
      ? { ...v.colors, name: v.colors.name_en?.trim() ? v.colors.name_en : v.colors.name }
      : v.colors,
    sizes: v.sizes
      ? { ...v.sizes, name: v.sizes.name_en?.trim() ? v.sizes.name_en : v.sizes.name }
      : v.sizes,
  }));

  p.product_measurements = (p.product_measurements ?? []).map((m: any) => ({
    ...m,
    sizes: m.sizes
      ? { ...m.sizes, name: m.sizes.name_en?.trim() ? m.sizes.name_en : m.sizes.name }
      : m.sizes,
  }));

  return p;
}

export async function getProductsByIds(ids: string[], locale: Locale = "ar") {
  if (!ids.length) return [];
  const supabase = createClient();
  const { data } = await supabase
    .from("products")
    .select(LIST_SELECT)
    .eq("status", "active")
    .in("id", ids);

  const products = (data ?? []).map((row) => localizeProduct(row, locale));
  // Preserve the order ids were passed in (most-recently-viewed first).
  const order = new Map(ids.map((id, i) => [id, i]));
  return products.sort((a, b) => (order.get(a.id) ?? 0) - (order.get(b.id) ?? 0));
}

export async function getUserWishlistedProductIds(): Promise<Set<string>> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return new Set();

  const { data } = await supabase
    .from("wishlists")
    .select("wishlist_items(product_id)")
    .eq("user_id", user.id)
    .maybeSingle();

  const ids = ((data?.wishlist_items ?? []) as { product_id: string }[]).map(
    (i) => i.product_id,
  );
  return new Set(ids);
}
export async function getApprovedReviews(productId: string) {
  const supabase = createClient();
  const { data } = await supabase
    .from("reviews")
    .select("id, rating, comment, created_at, profiles(full_name)")
    .eq("product_id", productId)
    .eq("is_approved", true)
    .order("created_at", { ascending: false });
  return data ?? [];
}

export async function getRelatedProducts(
  categoryId: string | null,
  excludeId: string,
  locale: Locale = "ar",
) {
  if (!categoryId) return [];
  const supabase = createClient();
  const { data } = await supabase
    .from("products")
    .select(LIST_SELECT)
    .eq("status", "active")
    .eq("category_id", categoryId)
    .neq("id", excludeId)
    .limit(4);
  return (data ?? []).map((row) => localizeProduct(row, locale));
}
