"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

async function getOrCreateWishlist(userId: string) {
  const supabase = createClient();
  const { data: existing } = await supabase
    .from("wishlists")
    .select("id")
    .eq("user_id", userId)
    .maybeSingle();

  if (existing) return existing.id as string;

  const { data: created, error } = await supabase
    .from("wishlists")
    .insert({ user_id: userId })
    .select("id")
    .single();

  if (error || !created) throw new Error("تعذر إنشاء قائمة المفضلة");
  return created.id as string;
}

export async function toggleWishlistAction(productId: string) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "login_required" as const };
  }

  const wishlistId = await getOrCreateWishlist(user.id);

  const { data: existingItem } = await supabase
    .from("wishlist_items")
    .select("id")
    .eq("wishlist_id", wishlistId)
    .eq("product_id", productId)
    .maybeSingle();

  if (existingItem) {
    await supabase.from("wishlist_items").delete().eq("id", existingItem.id);
    revalidatePath("/account/wishlist");
    return { inWishlist: false };
  }

  await supabase
    .from("wishlist_items")
    .insert({ wishlist_id: wishlistId, product_id: productId });
  revalidatePath("/account/wishlist");
  return { inWishlist: true };
}

export async function isInWishlist(productId: string) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return false;

  const { data } = await supabase
    .from("wishlist_items")
    .select("id, wishlists!inner(user_id)")
    .eq("product_id", productId)
    .eq("wishlists.user_id", user.id)
    .maybeSingle();

  return !!data;
}
