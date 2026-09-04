import { notFound } from "next/navigation";
import type { Metadata } from "next";
import {
  getProductBySlug,
  getApprovedReviews,
  getRelatedProducts,
  getUserWishlistedProductIds,
} from "@/lib/actions/catalog";
import { createClient } from "@/lib/supabase/server";
import { findReviewableOrderItem } from "@/lib/actions/reviews";
import { isInWishlist } from "@/lib/actions/wishlist";
import { ProductGallery } from "@/components/product/ProductGallery";
import { ProductActions } from "@/components/product/ProductActions";
import { SizeGuide } from "@/components/product/SizeGuide";
import { FindMySize } from "@/components/product/FindMySize";
import { ReviewForm } from "@/components/product/ReviewForm";
import { RecentlyViewed } from "@/components/product/RecentlyViewed";
import { TrackProductView } from "@/components/product/TrackProductView";
import { ProductGrid } from "@/components/product/ProductGrid";
import { AccordionItem } from "@/components/product/AccordionItem";
import { DeliveryInfo } from "@/components/product/DeliveryInfo";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { formatPrice } from "@/lib/utils/currency";
import { getLocale } from "@/lib/i18n/locale";
import { getDictionary } from "@/lib/i18n/getDictionary";

export const revalidate = 30;

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const locale = getLocale();
  const product = await getProductBySlug(params.slug, locale);
  if (!product) return {};
  return {
    title: product.name,
    description: product.description ?? undefined,
    openGraph: {
      title: product.name,
      description: product.description ?? undefined,
      images: product.product_images?.[0]?.url ? [product.product_images[0].url] : [],
    },
  };
}

export default async function ProductPage({
  params,
}: {
  params: { slug: string };
}) {
  const locale = getLocale();
  const { t } = getDictionary(locale);
  const product = await getProductBySlug(params.slug, locale);
  if (!product) notFound();

  const [reviews, related, wishlistedIds] = await Promise.all([
    getApprovedReviews(product.id),
    getRelatedProducts(product.category_id, product.id, locale),
    getUserWishlistedProductIds(),
  ]);

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const reviewableItem = user
    ? await findReviewableOrderItem(user.id, product.id)
    : null;
  const inWishlist = await isInWishlist(product.id);

  const isOnSale =
    product.compare_at_price != null && product.compare_at_price > product.base_price;

  const avgRating =
    reviews.length > 0
      ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
      : null;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description ?? undefined,
    image: product.product_images?.map((i: any) => i.url) ?? [],
    offers: {
      "@type": "Offer",
      price: product.base_price,
      priceCurrency: "EGP",
      availability: "https://schema.org/InStock",
    },
    ...(avgRating && {
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: avgRating,
        reviewCount: reviews.length,
      },
    }),
  };

  return (
    <main className="mx-auto max-w-7xl px-6 py-12 pb-28 md:pb-12">
      <Breadcrumbs
        items={[
          { label: locale === "en" ? "Home" : "الرئيسية", href: "/" },
          { label: locale === "en" ? "Shop" : "المتجر", href: "/shop" },
          { label: product.name },
        ]}
      />
      {/* eslint-disable-next-line react/no-danger */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="grid gap-10 md:grid-cols-2">
        <ProductGallery images={product.product_images ?? []} productName={product.name} />

        <div className="flex flex-col gap-6 md:sticky md:top-24 md:self-start">
          <div>
            <h1 className="font-display text-3xl">{product.name}</h1>
            <div className="mt-2 flex items-center gap-3 text-lg">
              <span className={isOnSale ? "text-clay" : "text-ink"}>
                {formatPrice(product.base_price, locale)}
              </span>
              {isOnSale && (
                <span className="text-stone line-through">
                  {formatPrice(product.compare_at_price!, locale)}
                </span>
              )}
            </div>
            {avgRating && (
              <p className="mt-1 text-sm text-stone">
                {avgRating} ★ ({reviews.length} {locale === "en" ? "reviews" : "تقييم"})
              </p>
            )}
          </div>

          {product.description && (
            <p className="text-sm text-stone">{product.description}</p>
          )}

          <ProductActions
            productId={product.id}
            productSlug={product.slug}
            productName={product.name}
            image={product.product_images?.[0]?.url ?? null}
            basePrice={product.base_price}
            variants={(product.product_variants ?? []) as any}
            initialInWishlist={inWishlist}
          />

          <DeliveryInfo locale={locale} />

          <div className="flex gap-6 border-t border-stone-light pt-4">
            <SizeGuide measurements={(product.product_measurements ?? []) as any} />
            <FindMySize measurements={(product.product_measurements ?? []) as any} />
          </div>

          <div>
            {(product.material || product.care_instructions) && (
              <AccordionItem title={t("product.materialCare")}>
                <div className="flex flex-col gap-2">
                  {product.material && (
                    <p>
                      {t("product.material")}: {product.material}
                    </p>
                  )}
                  {product.care_instructions && <p>{product.care_instructions}</p>}
                </div>
              </AccordionItem>
            )}
            <AccordionItem
              title={locale === "en" ? "Shipping & Returns" : "الشحن والاسترجاع"}
            >
              <p>
                {locale === "en"
                  ? "Shipping cost is calculated at checkout based on your governorate. Free shipping applies above a set order amount."
                  : "سعر الشحن بيتحدد في صفحة الدفع حسب المحافظة، والشحن مجاني للطلبات اللي بتتعدى حد معين."}
              </p>
              <p className="mt-2">
                {locale === "en"
                  ? "Returns accepted within 14 days in original, unused condition."
                  : "الاسترجاع متاح خلال 14 يوم في حالة المنتج الأصلية وغير المستخدم."}
              </p>
            </AccordionItem>
          </div>
        </div>
      </div>

      {(reviews.length > 0 || reviewableItem) && (
        <section className="mt-20 max-w-2xl">
          <h2 className="mb-6 font-display text-xl">{t("product.reviews")}</h2>

          {reviewableItem && (
            <div className="mb-8">
              <ReviewForm productId={product.id} orderItemId={reviewableItem.id} />
            </div>
          )}

          <div className="flex flex-col gap-6">
            {reviews.map((r: any) => (
              <div key={r.id} className="border-b border-stone-light/50 pb-6">
                <p className="text-sm">{"★".repeat(r.rating)}{"☆".repeat(5 - r.rating)}</p>
                {r.comment && <p className="mt-2 text-sm text-stone">{r.comment}</p>}
                <p className="mt-2 text-xs text-stone">
                  {r.profiles?.full_name ?? (locale === "en" ? "Customer" : "عميل")}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {related.length > 0 && (
        <section className="mt-20">
          <h2 className="mb-8 font-display text-xl">{t("product.relatedProducts")}</h2>
          <ProductGrid products={related} wishlistedIds={wishlistedIds} />
        </section>
      )}

      <RecentlyViewed excludeId={product.id} />
      <TrackProductView productId={product.id} />
    </main>
  );
}
