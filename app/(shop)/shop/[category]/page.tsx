import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { getProducts, getAllColors, getAllSizes, getUserWishlistedProductIds } from "@/lib/actions/catalog";
import { ProductGrid } from "@/components/product/ProductGrid";
import { FilterBar } from "@/components/product/FilterBar";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { getLocale } from "@/lib/i18n/locale";

export async function generateMetadata({
  params,
}: {
  params: { category: string };
}): Promise<Metadata> {
  const supabase = createClient();
  const locale = getLocale();
  const { data: category } = await supabase
    .from("categories")
    .select("name, name_en")
    .eq("slug", params.category)
    .single();
  const name = locale === "en" && category?.name_en?.trim() ? category.name_en : category?.name;
  return { title: name ?? "Category" };
}

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: { category: string };
  searchParams: { [key: string]: string | undefined };
}) {
  const locale = getLocale();
  const supabase = createClient();
  const { data: category } = await supabase
    .from("categories")
    .select("id, name, name_en, slug")
    .eq("slug", params.category)
    .single();

  if (!category) notFound();

  const displayName = locale === "en" && category.name_en?.trim() ? category.name_en : category.name;

  const [colors, sizes, wishlistedIds] = await Promise.all([
    getAllColors(locale),
    getAllSizes(locale),
    getUserWishlistedProductIds(),
  ]);

  const products = await getProducts(
    {
      categorySlug: params.category,
      minPrice: searchParams.min ? Number(searchParams.min) : undefined,
      maxPrice: searchParams.max ? Number(searchParams.max) : undefined,
      colorIds: searchParams.colors?.split(",").filter(Boolean),
      sizeIds: searchParams.sizes?.split(",").filter(Boolean),
      sort: (searchParams.sort as any) ?? "newest",
    },
    locale,
  );

  return (
    <main className="mx-auto max-w-7xl px-6 py-12">
      <Breadcrumbs
        items={[
          { label: locale === "en" ? "Home" : "الرئيسية", href: "/" },
          { label: locale === "en" ? "Shop" : "المتجر", href: "/shop" },
          { label: displayName },
        ]}
      />
      <div className="mb-8 flex items-end justify-between">
        <h1 className="font-display text-2xl">{displayName}</h1>
        <span className="text-xs text-stone">
          {products.length} {locale === "en" ? "products" : "منتج"}
        </span>
      </div>
      <FilterBar colors={colors} sizes={sizes} />
      <ProductGrid products={products} wishlistedIds={wishlistedIds} />
    </main>
  );
}
