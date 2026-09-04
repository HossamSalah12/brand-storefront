"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type ActionState = { error?: string; success?: boolean } | null;

/**
 * Verified-purchase check: finds an order_item belonging to this user,
 * for this product, that doesn't already have a review attached. This
 * both proves purchase and prevents reviewing the same purchase twice.
 */
export async function findReviewableOrderItem(userId: string, productId: string) {
  const supabase = createClient();
  const { data } = await supabase
    .from("order_items")
    .select("id, orders!inner(user_id, status)")
    .eq("orders.user_id", userId)
    .eq("orders.status", "delivered")
    .in(
      "variant_id",
      (
        await supabase.from("product_variants").select("id").eq("product_id", productId)
      ).data?.map((v: { id: string }) => v.id) ?? [],
    );

  if (!data?.length) return null;

  const { data: existingReviews } = await supabase
    .from("reviews")
    .select("order_item_id")
    .eq("user_id", userId)
    .eq("product_id", productId);
  const reviewedIds = new Set((existingReviews ?? []).map((r) => r.order_item_id));

  return data.find((item) => !reviewedIds.has(item.id)) ?? null;
}

export async function createReviewAction(
  productId: string,
  orderItemId: string,
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "يجب تسجيل الدخول لإضافة تقييم" };

  const rating = Number(formData.get("rating"));
  const comment = String(formData.get("comment") ?? "").trim();

  if (!rating || rating < 1 || rating > 5) {
    return { error: "اختر تقييمًا من 1 إلى 5" };
  }

  const { error } = await supabase.from("reviews").insert({
    product_id: productId,
    user_id: user.id,
    order_item_id: orderItemId,
    rating,
    comment: comment || null,
    is_approved: false,
  });

  if (error) return { error: "تعذر إرسال التقييم" };

  revalidatePath(`/product`);
  return { success: true };
}
