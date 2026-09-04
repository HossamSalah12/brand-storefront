"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

async function requireAdmin() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("غير مصرح");
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  if (profile?.role !== "admin") throw new Error("غير مصرح");
}

export async function createShippingZoneAction(governorate: string, price: number) {
  await requireAdmin();
  const admin = createAdminClient();

  const { data: zone, error } = await admin
    .from("shipping_zones")
    .insert({ governorate })
    .select("id")
    .single();
  if (error || !zone) throw new Error("تعذر إضافة المحافظة (ربما مضافة بالفعل)");

  await admin.from("shipping_rates").insert({ zone_id: zone.id, price });
  revalidatePath("/admin/shipping");
}

export async function deleteShippingZoneAction(zoneId: string) {
  await requireAdmin();
  const admin = createAdminClient();
  await admin.from("shipping_zones").delete().eq("id", zoneId);
  revalidatePath("/admin/shipping");
}

export async function updateShippingRateAction(zoneId: string, price: number) {
  await requireAdmin();
  const admin = createAdminClient();
  await admin.from("shipping_rates").update({ price }).eq("zone_id", zoneId);
  revalidatePath("/admin/shipping");
}

export async function updateSettingAction(key: string, amount: number) {
  await requireAdmin();
  const admin = createAdminClient();
  await admin.from("settings").upsert({ key, value: { amount } }, { onConflict: "key" });
  revalidatePath("/admin/shipping");
}
