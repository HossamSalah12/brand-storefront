import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { AnnouncementBar } from "@/components/layout/AnnouncementBar";
import { CartProvider } from "@/lib/cart/CartContext";
import { ToastProvider } from "@/lib/toast/ToastContext";
import { getStoreSettings } from "@/lib/actions/settings";
import { createClient } from "@/lib/supabase/server";

export default async function ShopLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { freeShippingThreshold } = await getStoreSettings();
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <ToastProvider>
      <CartProvider userId={user?.id ?? null}>
        <AnnouncementBar freeShippingThreshold={freeShippingThreshold} />
        <Navbar freeShippingThreshold={freeShippingThreshold} />
        {children}
        <Footer />
      </CartProvider>
    </ToastProvider>
  );
}
