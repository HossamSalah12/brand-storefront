"use client";

import Link from "next/link";
import { useState } from "react";
import { SearchOverlay } from "@/components/layout/SearchOverlay";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { useCart } from "@/lib/cart/CartContext";
import { useLocale } from "@/lib/i18n/LocaleContext";

export function Navbar({ freeShippingThreshold }: { freeShippingThreshold: number }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const { itemCount, openDrawer } = useCart();
  const { t, locale, switchLocale, isSwitching } = useLocale();

  const links = [
    { href: "/shop", label: t("nav.shop") },
    { href: "/shop", label: t("nav.collections") },
    { href: "/pages/about", label: t("nav.about") },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-stone-light bg-bone/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        {/* Mobile hamburger */}
        <button
          className="flex flex-col gap-1.5 md:hidden"
          aria-label="Menu"
          aria-expanded={mobileOpen}
          onClick={() => setMobileOpen((v) => !v)}
        >
          <span className="block h-px w-6 bg-ink transition-transform duration-300 ease-editorial" />
          <span className="block h-px w-6 bg-ink transition-opacity duration-300 ease-editorial" />
          <span className="block h-px w-6 bg-ink transition-transform duration-300 ease-editorial" />
        </button>

        {/* Desktop nav (start) */}
        <nav className="hidden gap-8 md:flex">
          {links.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="relative text-sm uppercase tracking-widest2 text-ink transition-colors duration-200 after:absolute after:inset-x-0 after:-bottom-1 after:h-px after:origin-right after:scale-x-0 after:bg-clay after:transition-transform after:duration-300 after:ease-editorial hover:text-clay hover:after:origin-left hover:after:scale-x-100"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Logo, visually dominant, centered */}
        <Link
          href="/"
          className="font-display text-xl uppercase tracking-widest2 md:absolute md:left-1/2 md:-translate-x-1/2"
        >
          Your Brand
        </Link>

        {/* Icons (end) */}
        <div className="flex items-center gap-5">
          <button
            onClick={() => switchLocale(locale === "ar" ? "en" : "ar")}
            disabled={isSwitching}
            aria-label="Switch language"
            className="text-xs uppercase tracking-widest2 text-stone transition-colors hover:text-ink disabled:opacity-40"
          >
            {t("langSwitch.label")}
          </button>
          <button
            aria-label={t("common.search")}
            onClick={() => setSearchOpen(true)}
            className="text-sm"
          >
            {t("common.search")}
          </button>
          <Link href="/account" aria-label={t("nav.account")} className="hidden text-sm md:inline">
            {t("nav.account")}
          </Link>
          <Link href="/account/wishlist" aria-label={t("nav.wishlist")} className="text-sm">
            {t("nav.wishlist")}
          </Link>
          <button onClick={openDrawer} aria-label={t("nav.cart")} className="relative text-sm">
            {t("nav.cart")}
            {itemCount > 0 && (
              <span className="absolute -end-3 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-ink text-[10px] text-bone">
                {itemCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <nav className="flex flex-col gap-1 border-t border-stone-light bg-bone px-6 py-4 md:hidden">
          {links.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="py-3 text-base uppercase tracking-widest2"
              onClick={() => setMobileOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/account"
            className="py-3 text-base uppercase tracking-widest2"
            onClick={() => setMobileOpen(false)}
          >
            {t("nav.account")}
          </Link>
        </nav>
      )}

      <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />
      <CartDrawer freeShippingThreshold={freeShippingThreshold} />
    </header>
  );
}
