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

const RESTOCKING_STATUSES = new Set(["cancelled", "returned"]);

export async function updateOrderStatusAction(orderId: string, status: string) {
  await requireAdmin();
  const admin = createAdminClient();

  const { data: order } = await admin
    .from("orders")
    .select("status")
    .eq("id", orderId)
    .single();

  // Restock only on the transition INTO cancelled/returned, and only once —
  // otherwise repeatedly saving "cancelled" would keep adding stock back.
  const enteringRestockState =
    RESTOCKING_STATUSES.has(status) && order?.status !== status && !RESTOCKING_STATUSES.has(order?.status ?? "");

  if (enteringRestockState) {
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
  }

  await admin.from("orders").update({ status }).eq("id", orderId);
  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${orderId}`);
  revalidatePath("/admin/inventory");
}

export async function updateOrderTrackingAction(
  orderId: string,
  tracking: { carrier: string; number: string; url: string },
) {
  await requireAdmin();
  const admin = createAdminClient();
  await admin
    .from("orders")
    .update({
      tracking_carrier: tracking.carrier || null,
      tracking_number: tracking.number || null,
      tracking_url: tracking.url || null,
    })
    .eq("id", orderId);
  revalidatePath(`/admin/orders/${orderId}`);
  revalidatePath("/account/orders");
}
export async function updatePaymentStatusAction(orderId: string, paymentStatus: string) {
  await requireAdmin();
  const admin = createAdminClient();
  await admin.from("orders").update({ payment_status: paymentStatus }).eq("id", orderId);
  await admin.from("payments").update({ status: paymentStatus }).eq("order_id", orderId);
  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${orderId}`);
}
