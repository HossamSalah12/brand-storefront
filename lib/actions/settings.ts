import { createClient } from "@/lib/supabase/server";

export async function getStoreSettings() {
  const supabase = createClient();
  const { data } = await supabase
    .from("settings")
    .select("key, value")
    .in("key", ["free_shipping_threshold", "default_shipping_price", "hero_image"]);

  const map = Object.fromEntries((data ?? []).map((row) => [row.key, row.value]));

  return {
    freeShippingThreshold: Number(map.free_shipping_threshold?.amount ?? 0),
    defaultShippingPrice: Number(map.default_shipping_price?.amount ?? 0),
    heroImageUrl: (map.hero_image?.url as string | undefined) ?? null,
  };
}

export async function getShippingZones() {
  const supabase = createClient();
  const { data } = await supabase
    .from("shipping_zones")
    .select("id, governorate, shipping_rates(price, is_active)")
    .order("governorate");

  return (data ?? []).map((zone: any) => {
    const activeRate = (zone.shipping_rates ?? []).find((r: any) => r.is_active);
    return {
      id: zone.id,
      governorate: zone.governorate,
      price: activeRate?.price ?? null,
    };
  });
}
