"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { logoutAction } from "@/lib/actions/auth";

const NAV_ITEMS = [
  { href: "/admin", label: "نظرة عامة" },
  { href: "/admin/homepage", label: "الصفحة الرئيسية" },
  { href: "/admin/products", label: "المنتجات" },
  { href: "/admin/categories", label: "الفئات" },
  { href: "/admin/orders", label: "الطلبات" },
  { href: "/admin/customers", label: "العملاء" },
  { href: "/admin/inventory", label: "المخزون" },
  { href: "/admin/coupons", label: "الكوبونات" },
  { href: "/admin/shipping", label: "الشحن" },
  { href: "/admin/reviews", label: "التقييمات" },
  { href: "/admin/newsletter", label: "النشرة البريدية" },
];

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  return (
    <nav className="flex flex-col gap-1">
      {NAV_ITEMS.map((item) => {
        const active = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={`px-2 py-2 text-sm ${
              active ? "bg-bone/10 text-bone" : "text-bone/80 hover:bg-bone/10 hover:text-bone"
            }`}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

export function AdminShell({ children }: { children: ReactNode }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();

  // Close the mobile drawer automatically on navigation.
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  return (
    <div className="min-h-screen md:flex">
      {/* Mobile top bar */}
      <div className="flex items-center justify-between border-b border-stone-light bg-ink px-4 py-3 text-bone md:hidden">
        <button
          onClick={() => setMenuOpen(true)}
          aria-label="فتح القائمة"
          className="flex flex-col gap-1.5 p-1"
        >
          <span className="block h-px w-6 bg-bone" />
          <span className="block h-px w-6 bg-bone" />
          <span className="block h-px w-6 bg-bone" />
        </button>
        <p className="font-display text-base">لوحة التحكم</p>
        <div className="w-8" />
      </div>

      {/* Mobile drawer */}
      {menuOpen && (
        <div
          className="fixed inset-0 z-50 flex md:hidden"
          onClick={() => setMenuOpen(false)}
        >
          <div className="absolute inset-0 bg-ink/40" />
          <div
            className="relative flex h-full w-72 max-w-[80vw] flex-col bg-ink px-4 py-6 text-bone"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-8 flex items-center justify-between px-2">
              <p className="font-display text-lg">لوحة التحكم</p>
              <button
                onClick={() => setMenuOpen(false)}
                aria-label="إغلاق القائمة"
                className="text-2xl leading-none"
              >
                ×
              </button>
            </div>
            <NavLinks onNavigate={() => setMenuOpen(false)} />
            <form action={logoutAction} className="mt-8 px-2">
              <button className="text-xs text-bone/60 underline">
                تسجيل الخروج
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <aside className="hidden w-56 shrink-0 border-e border-stone-light bg-ink px-4 py-8 text-bone md:block">
        <p className="mb-8 px-2 font-display text-lg">لوحة التحكم</p>
        <NavLinks />
        <form action={logoutAction} className="mt-8 px-2">
          <button className="text-xs text-bone/60 underline">
            تسجيل الخروج
          </button>
        </form>
      </aside>

      <main className="flex-1 overflow-x-hidden bg-bone px-4 py-6 md:px-8 md:py-8">
        {children}
      </main>
    </div>
  );
}
