import type { Metadata } from "next";
import { getProducts, getUserWishlistedProductIds } from "@/lib/actions/catalog";
import { ProductGrid } from "@/components/product/ProductGrid";
import { getLocale } from "@/lib/i18n/locale";
import { getDictionary } from "@/lib/i18n/getDictionary";

export async function generateMetadata({
  searchParams,
}: {
  searchParams: { q?: string };
}): Promise<Metadata> {
  return { title: searchParams.q ? `"${searchParams.q}"` : "Search" };
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: { q?: string };
}) {
  const locale = getLocale();
  const { t } = getDictionary(locale);
  const query = searchParams.q?.trim() ?? "";
  const [products, wishlistedIds] = await Promise.all([
    query ? getProducts({ search: query }, locale) : Promise.resolve([]),
    getUserWishlistedProductIds(),
  ]);

  return (
    <main className="mx-auto max-w-7xl px-6 py-12">
      <h1 className="mb-8 font-display text-2xl">
        {query
          ? (locale === "en" ? `Results for "${query}"` : `نتائج البحث عن "${query}"`)
          : t("common.search")}
      </h1>
      {query ? (
        <ProductGrid products={products} wishlistedIds={wishlistedIds} />
      ) : (
        <p className="text-stone">
          {locale === "en" ? "Type something to search for a product." : "اكتب كلمة للبحث عن منتج."}
        </p>
      )}
    </main>
  );
}
