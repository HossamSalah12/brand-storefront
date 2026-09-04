import type { MetadataRoute } from "next";
import { createClient } from "@/lib/supabase/server";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = createClient();
  const base = "https://example.com"; // update once the real domain is set

  const [{ data: products }, { data: categories }] = await Promise.all([
    supabase.from("products").select("slug, updated_at").eq("status", "active"),
    supabase.from("categories").select("slug"),
  ]);

  const staticRoutes = [
    "",
    "/shop",
    "/pages/about",
    "/pages/contact",
    "/pages/size-guide",
    "/pages/shipping-policy",
    "/pages/return-policy",
    "/pages/privacy",
    "/pages/terms",
  ].map((path) => ({ url: `${base}${path}`, lastModified: new Date() }));

  const productRoutes = (products ?? []).map((p) => ({
    url: `${base}/product/${p.slug}`,
    lastModified: p.updated_at ? new Date(p.updated_at) : new Date(),
  }));

  const categoryRoutes = (categories ?? []).map((c) => ({
    url: `${base}/shop/${c.slug}`,
    lastModified: new Date(),
  }));

  return [...staticRoutes, ...productRoutes, ...categoryRoutes];
}
