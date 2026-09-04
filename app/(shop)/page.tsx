import Link from "next/link";
import Image from "next/image";
import {
  getFeaturedProducts,
  getNewArrivals,
  getBestSellers,
  getCategories,
  getUserWishlistedProductIds,
} from "@/lib/actions/catalog";
import { ProductGrid } from "@/components/product/ProductGrid";
import { RecentlyViewed } from "@/components/product/RecentlyViewed";
import { VipNewsletterSection } from "@/components/layout/VipNewsletterSection";
import { Button } from "@/components/ui/Button";
import { ScrollReveal } from "@/components/layout/ScrollReveal";
import { getLocale } from "@/lib/i18n/locale";
import { getDictionary } from "@/lib/i18n/getDictionary";
import { getStoreSettings } from "@/lib/actions/settings";

// Cache this page for 60s in production (ISR) — repeat visits don't hit
// the database on every navigation. Doesn't apply in `next dev`, which
// always recompiles; test with `npm run build && npm run start` to feel
// the real difference.
export const revalidate = 60;

export default async function HomePage() {
  const locale = getLocale();
  const { t } = getDictionary(locale);

  const [featured, newArrivals, bestSellers, categories, wishlistedIds, { heroImageUrl }] =
    await Promise.all([
      getFeaturedProducts(locale),
      getNewArrivals(locale),
      getBestSellers(locale),
      getCategories(locale),
      getUserWishlistedProductIds(),
      getStoreSettings(),
    ]);

  return (
    <main>
      {/* Hero — the signature moment: large display type, staggered
          fade-up entrance, and a small hand-drawn-style flourish.
          An optional admin-uploaded photo can replace the flat
          background for a more editorial feel; falls back gracefully
          when none is set. */}
      <section className="relative flex min-h-[88vh] flex-col items-center justify-center gap-7 overflow-hidden bg-stone-light px-6 text-center">
        {heroImageUrl && (
          <>
            <Image
              src={heroImageUrl}
              alt=""
              fill
              priority
              sizes="100vw"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-ink/45" />
          </>
        )}
        <p
          className={`animate-fade-up relative text-xs uppercase tracking-widest2 [animation-delay:0ms] ${
            heroImageUrl ? "text-bone/90" : "text-stone"
          }`}
        >
          {t("home.eyebrow")}
        </p>
        <h1
          className={`animate-fade-up relative max-w-3xl text-[length:var(--text-display-xl)] leading-[1.15] [animation-delay:120ms] ${
            heroImageUrl ? "text-bone" : "text-ink"
          }`}
        >
          {t("home.heroTitle")}
        </h1>

        <svg
          className={`animate-fade-up relative h-6 w-32 [animation-delay:260ms] ${
            heroImageUrl ? "text-bone" : "text-ink"
          }`}
          viewBox="0 0 128 24"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M2 12c20-10 40 10 60 0s40-10 64 0"
            stroke="currentColor"
            strokeWidth="1"
            strokeLinecap="round"
          />
          <circle cx="64" cy="12" r="2.5" fill="currentColor" />
        </svg>

        <p
          className={`animate-fade-up relative max-w-md text-sm [animation-delay:340ms] ${
            heroImageUrl ? "text-bone/85" : "text-stone"
          }`}
        >
          {t("home.heroSubtitle")}
        </p>
        <div className="animate-fade-up relative [animation-delay:440ms]">
          <Link href="/shop">
            <Button size="lg" variant={heroImageUrl ? "secondary" : "primary"} className={heroImageUrl ? "border-bone text-bone hover:bg-bone hover:text-ink" : ""}>
              {t("common.shopNow")}
            </Button>
          </Link>
        </div>
      </section>

      {/* Featured */}
      {featured.length > 0 && (
        <ScrollReveal>
          <section className="mx-auto max-w-7xl px-6 py-[var(--space-section)]">
            <div className="mb-10 flex items-end justify-between">
              <h2 className="font-display text-2xl">{t("home.featured")}</h2>
              <Link href="/shop" className="text-sm underline">
                {t("common.viewAll")}
              </Link>
            </div>
            <ProductGrid products={featured} wishlistedIds={wishlistedIds} />
          </section>
        </ScrollReveal>
      )}

      {/* Category discovery */}
      {categories.length > 0 && (
        <ScrollReveal>
          <section className="mx-auto max-w-7xl px-6 py-[var(--space-block)]">
            <h2 className="mb-10 font-display text-2xl">{t("home.shopByCategory")}</h2>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              {categories.map((c) => (
                <Link
                  key={c.id}
                  href={`/shop/${c.slug}`}
                  className="group relative aspect-[3/4] overflow-hidden bg-stone-light"
                >
                  {c.image_url && (
                    <Image
                      src={c.image_url}
                      alt={c.name}
                      fill
                      sizes="(max-width: 768px) 50vw, 25vw"
                      className="object-cover transition-transform duration-500 ease-editorial group-hover:scale-105"
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-ink/70 via-ink/0 to-ink/0" />
                  <div className="absolute inset-x-0 bottom-0 flex flex-col gap-1 p-4 text-bone transition-transform duration-300 ease-editorial group-hover:-translate-y-1">
                    <span className="font-display text-lg">{c.name}</span>
                    <span className="text-xs uppercase tracking-widest2 text-clay underline underline-offset-4">
                      {t("common.shopNow")}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        </ScrollReveal>
      )}

      {/* New arrivals */}
      {newArrivals.length > 0 && (
        <ScrollReveal>
          <section className="mx-auto max-w-7xl px-6 py-[var(--space-block)]">
            <div className="mb-10 flex items-end justify-between">
              <h2 className="font-display text-2xl">{t("home.newArrivals")}</h2>
              <Link href="/shop" className="text-sm underline">
                {t("common.viewAll")}
              </Link>
            </div>
            <ProductGrid products={newArrivals} wishlistedIds={wishlistedIds} />
          </section>
        </ScrollReveal>
      )}

      {/* Editorial section — asymmetric layout, navy background for
          contrast against the rest of the ivory page, giving the
          homepage visual rhythm rather than one flat tone throughout. */}
      <ScrollReveal>
        <section className="bg-navy px-6 py-[var(--space-section)] text-bone">
          <div className="mx-auto grid max-w-7xl gap-10 md:grid-cols-12 md:items-center">
            <div className="md:col-span-7">
              <p className="mb-4 text-xs uppercase tracking-widest2 text-clay">
                {locale === "en" ? "The Atelier" : "الورشة"}
              </p>
              <h2 className="font-display text-3xl leading-tight md:text-4xl">
                {t("home.ourStory")}
              </h2>
            </div>
            <div className="flex flex-col gap-6 md:col-span-5">
              <p className="text-sm text-bone/80">{t("home.storyText")}</p>
              <Link href="/pages/about">
                <Button
                  variant="secondary"
                  size="lg"
                  className="border-bone text-bone hover:bg-bone hover:text-ink"
                >
                  {locale === "en" ? "Explore the Collection" : "اكتشف الكولكشن"}
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </ScrollReveal>

      {/* Best sellers */}
      {bestSellers.length > 0 && (
        <ScrollReveal>
          <section className="mx-auto max-w-7xl px-6 py-[var(--space-block)]">
            <div className="mb-10 flex items-end justify-between">
              <h2 className="font-display text-2xl">{t("home.bestSellers")}</h2>
              <Link href="/shop" className="text-sm underline">
                {t("common.viewAll")}
              </Link>
            </div>
            <ProductGrid products={bestSellers} wishlistedIds={wishlistedIds} />
          </section>
        </ScrollReveal>
      )}

      <VipNewsletterSection />
      <RecentlyViewed />
    </main>
  );
}
