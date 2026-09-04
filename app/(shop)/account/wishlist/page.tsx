import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ProductGrid } from "@/components/product/ProductGrid";
import { getLocale } from "@/lib/i18n/locale";
import { getDictionary } from "@/lib/i18n/getDictionary";

export default async function WishlistPage() {
  const locale = getLocale();
  const { t } = getDictionary(locale);

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/account/login?redirect=/account/wishlist");

  const { data: wishlist } = await supabase
    .from("wishlists")
    .select(
      `
      wishlist_items(
        products(
          id, name, name_en, slug, base_price, compare_at_price,
          product_images(url, sort_order),
          product_variants(color_id, colors(name, name_en, hex_value), size_id, variant_inventory(quantity))
        )
      )
    `,
    )
    .eq("user_id", user.id)
    .maybeSingle();

  let products = ((wishlist?.wishlist_items ?? []) as any[])
    .map((item) => item.products)
    .filter(Boolean);

  if (locale === "en") {
    products = products.map((p: any) => ({
      ...p,
      name: p.name_en?.trim() ? p.name_en : p.name,
      product_variants: (p.product_variants ?? []).map((v: any) => ({
        ...v,
        colors: v.colors
          ? { ...v.colors, name: v.colors.name_en?.trim() ? v.colors.name_en : v.colors.name }
          : v.colors,
      })),
    }));
  }

  return (
    <main className="mx-auto max-w-7xl px-6 py-12">
      <h1 className="mb-8 font-display text-2xl">{t("wishlist.title")}</h1>
      <ProductGrid products={products} />
    </main>
  );
}
