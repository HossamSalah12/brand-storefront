"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type CartItem = {
  variantId: string;
  productSlug: string;
  productName: string;
  colorName: string | null;
  sizeName: string | null;
  sku: string;
  unitPrice: number;
  image: string | null;
  quantity: number;
  maxStock: number;
};

type CartContextValue = {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "quantity">, quantity: number) => void;
  removeItem: (variantId: string) => void;
  updateQuantity: (variantId: string, quantity: number) => void;
  clear: () => void;
  subtotal: number;
  itemCount: number;
  isDrawerOpen: boolean;
  openDrawer: () => void;
  closeDrawer: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);
const LOCAL_STORAGE_PREFIX = "brand-storefront:cart";

export function CartProvider({
  userId,
  children,
}: {
  userId: string | null;
  children: ReactNode;
}) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Cart is scoped per signed-in user (or "guest" when logged out), so
  // switching accounts on the same browser never shows someone else's
  // cart. ShopLayout re-renders this provider with the current userId
  // on every navigation, and a full page load happens on login/logout,
  // so this key is always accurate for who's currently browsing.
  const storageKey = `${LOCAL_STORAGE_PREFIX}:${userId ?? "guest"}`;

  // Load persisted cart once on mount (browser only).
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(storageKey);
      setItems(raw ? JSON.parse(raw) : []);
    } catch {
      // Corrupt/blocked storage — start with an empty cart rather than crash.
      setItems([]);
    }
    setHydrated(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storageKey]);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(storageKey, JSON.stringify(items));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items, hydrated, storageKey]);

  function addItem(item: Omit<CartItem, "quantity">, quantity: number) {
    setItems((prev) => {
      const existing = prev.find((i) => i.variantId === item.variantId);
      if (existing) {
        const nextQty = Math.min(existing.quantity + quantity, item.maxStock);
        return prev.map((i) =>
          i.variantId === item.variantId ? { ...i, quantity: nextQty } : i,
        );
      }
      return [...prev, { ...item, quantity: Math.min(quantity, item.maxStock) }];
    });
    setIsDrawerOpen(true);
  }

  function removeItem(variantId: string) {
    setItems((prev) => prev.filter((i) => i.variantId !== variantId));
  }

  function updateQuantity(variantId: string, quantity: number) {
    setItems((prev) =>
      prev.map((i) =>
        i.variantId === variantId
          ? { ...i, quantity: Math.max(1, Math.min(quantity, i.maxStock)) }
          : i,
      ),
    );
  }

  function clear() {
    setItems([]);
  }

  const subtotal = useMemo(
    () => items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0),
    [items],
  );
  const itemCount = useMemo(
    () => items.reduce((sum, i) => sum + i.quantity, 0),
    [items],
  );

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clear,
        subtotal,
        itemCount,
        isDrawerOpen,
        openDrawer: () => setIsDrawerOpen(true),
        closeDrawer: () => setIsDrawerOpen(false),
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
