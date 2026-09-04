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

export type ActionState = { error?: string; success?: boolean } | null;

export async function createCouponAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAdmin();

  const code = String(formData.get("code") ?? "").trim().toUpperCase();
  const type = String(formData.get("type") ?? "percentage") as "percentage" | "fixed";
  const value = Number(formData.get("value"));
  const minOrderAmount = Number(formData.get("minOrderAmount") ?? 0);
  const usageLimitRaw = formData.get("usageLimit");
  const usageLimit = usageLimitRaw ? Number(usageLimitRaw) : null;
  const expiresAtRaw = formData.get("expiresAt");
  const expiresAt = expiresAtRaw ? String(expiresAtRaw) : null;

  if (!code || !value || value <= 0) {
    return { error: "أدخل كود وقيمة خصم صحيحة" };
  }

  const admin = createAdminClient();
  const { error } = await admin.from("coupons").insert({
    code,
    type,
    value,
    min_order_amount: minOrderAmount || 0,
    usage_limit: usageLimit,
    expires_at: expiresAt,
    is_active: true,
  });

  if (error) {
    return { error: error.code === "23505" ? "هذا الكود مستخدم بالفعل" : "تعذر إنشاء الكوبون" };
  }

  revalidatePath("/admin/coupons");
  return { success: true };
}

export async function toggleCouponAction(couponId: string, isActive: boolean) {
  await requireAdmin();
  const admin = createAdminClient();
  await admin.from("coupons").update({ is_active: isActive }).eq("id", couponId);
  revalidatePath("/admin/coupons");
}

export async function deleteCouponAction(couponId: string) {
  await requireAdmin();
  const admin = createAdminClient();
  await admin.from("coupons").delete().eq("id", couponId);
  revalidatePath("/admin/coupons");
}
