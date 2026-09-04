import { getProducts, getAllColors, getAllSizes, getUserWishlistedProductIds } from "@/lib/actions/catalog";
import { ProductGrid } from "@/components/product/ProductGrid";
import { FilterBar } from "@/components/product/FilterBar";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { getLocale } from "@/lib/i18n/locale";
import { getDictionary } from "@/lib/i18n/getDictionary";

export const metadata = { title: "Shop" };

export default async function ShopPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | undefined };
}) {
  const locale = getLocale();
  const { t } = getDictionary(locale);
  const [colors, sizes, wishlistedIds] = await Promise.all([
    getAllColors(locale),
    getAllSizes(locale),
    getUserWishlistedProductIds(),
  ]);

  const products = await getProducts(
    {
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
          { label: t("nav.shop") },
        ]}
      />
      <div className="mb-8 flex items-end justify-between">
        <h1 className="font-display text-2xl">{t("nav.shop")}</h1>
        <span className="text-xs text-stone">
          {products.length} {locale === "en" ? "products" : "منتج"}
        </span>
      </div>
      <FilterBar colors={colors} sizes={sizes} />
      <ProductGrid products={products} wishlistedIds={wishlistedIds} />
    </main>
  );
}
