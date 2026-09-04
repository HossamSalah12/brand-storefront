"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getLocale } from "@/lib/i18n/locale";

async function requireUser() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Login required");
  return { supabase, user };
}

export type ActionState = { error?: string; success?: boolean } | null;

export async function cancelOwnOrderAction(orderId: string) {
  const { supabase, user } = await requireUser();

  const { data: order } = await supabase
    .from("orders")
    .select("id, status")
    .eq("id", orderId)
    .eq("user_id", user.id)
    .single();

  if (!order) throw new Error("Order not found");
  if (order.status !== "pending") {
    throw new Error("لا يمكن إلغاء هذا الطلب بعد أن بدأ تجهيزه، تواصل معنا مباشرة.");
  }

  // Restock: this mirrors the admin cancellation logic, using the
  // service-role client since restoring inventory needs to write to
  // variant_inventory, which customers can't update directly via RLS.
  const admin = createAdminClient();
  const { data: items } = await admin
    .from("order_items")
    .select("variant_id, quantity")
    .eq("order_id", orderId);

  for (const item of items ?? []) {
    const { data: inv } = await admin
      .from("variant_inventory")
      .select("quantity")
      .eq("variant_id", item.variant_id)
      .single();
    await admin
      .from("variant_inventory")
      .update({ quantity: (inv?.quantity ?? 0) + item.quantity })
      .eq("variant_id", item.variant_id);
  }

  await admin.from("orders").update({ status: "cancelled" }).eq("id", orderId);

  revalidatePath("/account/orders");
  revalidatePath(`/account/orders/${orderId}`);
}

export async function updateProfileAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const { supabase, user } = await requireUser();
  const locale = getLocale();

  const fullName = String(formData.get("fullName") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();

  if (!fullName) return { error: locale === "en" ? "Name is required" : "الاسم مطلوب" };

  const { error } = await supabase
    .from("profiles")
    .update({ full_name: fullName, phone })
    .eq("id", user.id);

  if (error) return { error: locale === "en" ? "Couldn't save your details" : "تعذر حفظ البيانات" };

  revalidatePath("/account");
  return { success: true };
}

export async function addAddressAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const { supabase, user } = await requireUser();
  const locale = getLocale();

  const fullName = String(formData.get("fullName") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const governorate = String(formData.get("governorate") ?? "").trim();
  const city = String(formData.get("city") ?? "").trim();
  const fullAddress = String(formData.get("fullAddress") ?? "").trim();
  const building = String(formData.get("building") ?? "").trim();
  const apartment = String(formData.get("apartment") ?? "").trim();
  const floor = String(formData.get("floor") ?? "").trim();
  const landmark = String(formData.get("landmark") ?? "").trim();

  if (!fullName || !phone || !governorate || !city || !fullAddress) {
    return { error: locale === "en" ? "Please fill in all required fields" : "أكمل الحقول المطلوبة" };
  }

  const { count } = await supabase
    .from("addresses")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id);
  const isFirstAddress = !count;

  const { error } = await supabase.from("addresses").insert({
    user_id: user.id,
    full_name: fullName,
    phone,
    governorate,
    city,
    full_address: fullAddress,
    building: building || null,
    apartment: apartment || null,
    floor: floor || null,
    landmark: landmark || null,
    is_default: isFirstAddress,
  });

  if (error) return { error: locale === "en" ? "Couldn't add the address" : "تعذر إضافة العنوان" };

  revalidatePath("/account/addresses");
  return { success: true };
}

export async function updateAddressAction(
  addressId: string,
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const { supabase, user } = await requireUser();
  const locale = getLocale();

  const fullName = String(formData.get("fullName") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const governorate = String(formData.get("governorate") ?? "").trim();
  const city = String(formData.get("city") ?? "").trim();
  const fullAddress = String(formData.get("fullAddress") ?? "").trim();
  const building = String(formData.get("building") ?? "").trim();
  const apartment = String(formData.get("apartment") ?? "").trim();
  const floor = String(formData.get("floor") ?? "").trim();
  const landmark = String(formData.get("landmark") ?? "").trim();

  if (!fullName || !phone || !governorate || !city || !fullAddress) {
    return { error: locale === "en" ? "Please fill in all required fields" : "أكمل الحقول المطلوبة" };
  }

  const { error } = await supabase
    .from("addresses")
    .update({
      full_name: fullName,
      phone,
      governorate,
      city,
      full_address: fullAddress,
      building: building || null,
      apartment: apartment || null,
      floor: floor || null,
      landmark: landmark || null,
    })
    .eq("id", addressId)
    .eq("user_id", user.id);

  if (error) return { error: locale === "en" ? "Couldn't save the address" : "تعذر حفظ العنوان" };

  revalidatePath("/account/addresses");
  return { success: true };
}

export async function deleteAddressAction(addressId: string) {
  const { supabase, user } = await requireUser();
  await supabase.from("addresses").delete().eq("id", addressId).eq("user_id", user.id);
  revalidatePath("/account/addresses");
}

export async function setDefaultAddressAction(addressId: string) {
  const { supabase, user } = await requireUser();
  await supabase.from("addresses").update({ is_default: false }).eq("user_id", user.id);
  await supabase
    .from("addresses")
    .update({ is_default: true })
    .eq("id", addressId)
    .eq("user_id", user.id);
  revalidatePath("/account/addresses");
}
