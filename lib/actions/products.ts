"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { productFormSchema, type ProductFormInput } from "@/lib/validation/product";
import { extractProductImagePath } from "@/lib/utils/storage";

/**
 * Every mutating function here re-checks that the caller is an admin,
 * even though the route is already gated by middleware + layout.
 * lib/supabase/admin.ts bypasses RLS, so this function-level check is
 * the only thing standing between "logged in" and "can write products".
 */
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

  return user;
}

export type ProductActionState = { error?: string; success?: boolean } | null;

/**
 * Creates or updates a product plus its variants/inventory/measurements/images
 * as one logical unit. Receives a JSON payload (built client-side by
 * ProductForm) because the shape — a variable-length matrix of
 * color x size combinations — doesn't map cleanly onto plain FormData.
 */
export async function saveProductAction(
  productId: string | null,
  payload: ProductFormInput,
): Promise<ProductActionState> {
  await requireAdmin();

  const parsed = productFormSchema.safeParse(payload);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "بيانات غير صحيحة" };
  }
  const { basic, variants, measurements, images } = parsed.data;

  const admin = createAdminClient();

  // Duplicate SKU check across the whole catalog (unique constraint would
  // also catch this, but we want a friendly Arabic error instead of a
  // raw Postgres constraint error).
  const skus = variants.map((v) => v.sku);
  const { data: existingSkus } = await admin
    .from("product_variants")
    .select("sku, product_id")
    .in("sku", skus);
  const conflict = existingSkus?.find(
    (row: { sku: string; product_id: string }) =>
      row.product_id !== productId,
  );
  if (conflict) {
    return { error: `الـ SKU "${conflict.sku}" مستخدم في منتج تاني بالفعل` };
  }

  let id = productId;
  let oldImageRows: { url: string }[] | null = null;

  if (id) {
    const { error } = await admin
      .from("products")
      .update({
        category_id: basic.categoryId ?? null,
        name: basic.name,
        name_en: basic.nameEn || null,
        slug: basic.slug,
        description: basic.description ?? null,
        description_en: basic.descriptionEn || null,
        material: basic.material ?? null,
        material_en: basic.materialEn || null,
        care_instructions: basic.careInstructions ?? null,
        care_instructions_en: basic.careInstructionsEn || null,
        base_price: basic.basePrice,
        compare_at_price: basic.compareAtPrice ?? null,
        status: basic.status,
        is_featured: !!basic.isFeatured,
        is_new_arrival: !!basic.isNewArrival,
        is_best_seller: !!basic.isBestSeller,
      })
      .eq("id", id);
    if (error) return { error: "فشل تحديث المنتج: " + error.message };

    // Simplest safe strategy for a small catalog: replace child rows.
    // Capture the old image URLs first so we can clean up their actual
    // Storage files after we know which ones survived the edit — deleting
    // the DB row alone would leave the file sitting in the bucket forever.
    const { data: oldImageRowsResult } = await admin
      .from("product_images")
      .select("url")
      .eq("product_id", id);
    oldImageRows = oldImageRowsResult;

    await admin.from("product_images").delete().eq("product_id", id);
    await admin.from("product_measurements").delete().eq("product_id", id);
    // Remove variants no longer present; keep existing ones (matched by SKU)
    // so their inventory/order history stays linked.
    const { data: currentVariants } = await admin
      .from("product_variants")
      .select("id, sku")
      .eq("product_id", id);
    const keepSkus = new Set(variants.map((v) => v.sku));
    const toDelete = (currentVariants ?? []).filter(
      (v: { id: string; sku: string }) => !keepSkus.has(v.sku),
    );
    if (toDelete.length) {
      await admin
        .from("product_variants")
        .delete()
        .in("id", toDelete.map((v: { id: string }) => v.id));
    }
  } else {
    const { data: inserted, error } = await admin
      .from("products")
      .insert({
        category_id: basic.categoryId ?? null,
        name: basic.name,
        name_en: basic.nameEn || null,
        slug: basic.slug,
        description: basic.description ?? null,
        description_en: basic.descriptionEn || null,
        material: basic.material ?? null,
        material_en: basic.materialEn || null,
        care_instructions: basic.careInstructions ?? null,
        care_instructions_en: basic.careInstructionsEn || null,
        base_price: basic.basePrice,
        compare_at_price: basic.compareAtPrice ?? null,
        status: basic.status,
        is_featured: !!basic.isFeatured,
        is_new_arrival: !!basic.isNewArrival,
        is_best_seller: !!basic.isBestSeller,
      })
      .select("id")
      .single();
    if (error || !inserted) {
      return { error: "فشل إنشاء المنتج: " + (error?.message ?? "") };
    }
    id = inserted.id;
  }

  // Images
  if (images.length) {
    const { error } = await admin.from("product_images").insert(
      images.map((img) => ({
        product_id: id,
        url: img.url,
        sort_order: img.sortOrder,
      })),
    );
    if (error) return { error: "فشل حفظ الصور: " + error.message };
  }

  // Clean up Storage files for images that were removed during this edit.
  // Only runs for updates (oldImageRows stays null on create, where there's
  // nothing to clean up). We only delete a file once we're sure the new
  // image list no longer references its URL, so a file still in use is
  // never touched.
  if (oldImageRows) {
    const newUrls = new Set(images.map((img) => img.url));
    const removedPaths = oldImageRows
      .filter((row) => !newUrls.has(row.url))
      .map((row) => extractProductImagePath(row.url))
      .filter((path): path is string => !!path);

    if (removedPaths.length) {
      await admin.storage.from("product-images").remove(removedPaths);
    }
  }

  // Measurements
  if (measurements.length) {
    const { error } = await admin.from("product_measurements").insert(
      measurements.map((m) => ({
        product_id: id,
        size_id: m.sizeId,
        chest_cm: m.chestCm ?? null,
        shoulder_cm: m.shoulderCm ?? null,
        length_cm: m.lengthCm ?? null,
        sleeve_cm: m.sleeveCm ?? null,
      })),
    );
    if (error) return { error: "فشل حفظ المقاسات: " + error.message };
  }

  // Variants + inventory (upsert by SKU so existing stock rows survive edits)
  for (const v of variants) {
    const { data: existing } = await admin
      .from("product_variants")
      .select("id")
      .eq("sku", v.sku)
      .maybeSingle();

    let variantId = existing?.id as string | undefined;

    if (variantId) {
      await admin
        .from("product_variants")
        .update({
          color_id: v.colorId,
          size_id: v.sizeId,
          price_override: v.priceOverride ?? null,
          image_url: v.imageUrl ?? null,
        })
        .eq("id", variantId);
    } else {
      const { data: newVariant, error } = await admin
        .from("product_variants")
        .insert({
          product_id: id,
          color_id: v.colorId,
          size_id: v.sizeId,
          sku: v.sku,
          price_override: v.priceOverride ?? null,
          image_url: v.imageUrl ?? null,
        })
        .select("id")
        .single();
      if (error || !newVariant) {
        return { error: "فشل حفظ المتغيرات: " + (error?.message ?? "") };
      }
      variantId = newVariant.id;
    }

    await admin
      .from("variant_inventory")
      .upsert(
        { variant_id: variantId, quantity: v.quantity },
        { onConflict: "variant_id" },
      );
  }

  revalidatePath("/admin/products");
  revalidatePath("/admin/inventory");
  redirect("/admin/products");
}

export async function archiveProductAction(productId: string) {
  await requireAdmin();
  const admin = createAdminClient();
  await admin
    .from("products")
    .update({ status: "archived" })
    .eq("id", productId);
  revalidatePath("/admin/products");
}

export async function publishProductAction(productId: string) {
  await requireAdmin();
  const admin = createAdminClient();
  const { error } = await admin
    .from("products")
    .update({ status: "active" })
    .eq("id", productId);
  if (error) throw new Error("تعذر نشر المنتج");
  revalidatePath("/admin/products");
  revalidatePath("/shop");
}

export async function deleteProductAction(productId: string) {
  await requireAdmin();
  const admin = createAdminClient();

  const { data: imageRows } = await admin
    .from("product_images")
    .select("url")
    .eq("product_id", productId);

  // Blocked by FK (order_items.variant_id -> restrict) if the product was
  // ever ordered — archiving is the safe default; this is for drafts only.
  const { error } = await admin.from("products").delete().eq("id", productId);
  if (error) throw new Error("تعذر حذف المنتج (ربما مرتبط بطلبات سابقة). استخدم الأرشفة بدلاً من ذلك.");

  const paths = (imageRows ?? [])
    .map((row) => extractProductImagePath(row.url))
    .filter((path): path is string => !!path);
  if (paths.length) {
    await admin.storage.from("product-images").remove(paths);
  }

  revalidatePath("/admin/products");
}

export async function updateVariantStockAction(
  variantId: string,
  quantity: number,
) {
  await requireAdmin();
  if (quantity < 0) throw new Error("الكمية لا يمكن أن تكون سالبة");
  const admin = createAdminClient();
  await admin
    .from("variant_inventory")
    .update({ quantity })
    .eq("variant_id", variantId);
  revalidatePath("/admin/inventory");
}

export async function approveReviewAction(reviewId: string) {
  await requireAdmin();
  const admin = createAdminClient();
  await admin.from("reviews").update({ is_approved: true }).eq("id", reviewId);
  revalidatePath("/admin/reviews");
}

export async function deleteReviewAction(reviewId: string) {
  await requireAdmin();
  const admin = createAdminClient();
  await admin.from("reviews").delete().eq("id", reviewId);
  revalidatePath("/admin/reviews");
}

// --- Lookup CRUD: categories / colors / sizes ------------------------

export async function createCategoryAction(
  _prevState: ProductActionState,
  formData: FormData,
): Promise<ProductActionState> {
  await requireAdmin();
  const name = String(formData.get("name") ?? "").trim();
  const nameEn = String(formData.get("nameEn") ?? "").trim();
  const slug = String(formData.get("slug") ?? "").trim();
  const imageUrl = String(formData.get("imageUrl") ?? "").trim();
  if (!name || !slug) return { error: "الاسم والرابط مطلوبان" };

  const admin = createAdminClient();
  const { error } = await admin
    .from("categories")
    .insert({ name, name_en: nameEn || null, slug, image_url: imageUrl || null });
  if (error) return { error: "فشل الإضافة: " + error.message };

  revalidatePath("/admin/categories");
  return { success: true };
}

export async function deleteCategoryAction(id: string) {
  await requireAdmin();
  const admin = createAdminClient();
  await admin.from("categories").delete().eq("id", id);
  revalidatePath("/admin/categories");
}

export async function createColorAction(name: string, hex: string, nameEn?: string) {
  await requireAdmin();
  const admin = createAdminClient();
  const { error } = await admin
    .from("colors")
    .insert({ name, hex_value: hex || null, name_en: nameEn || null });
  if (error) throw new Error(error.message);
  revalidatePath("/admin/products/new");
}

export async function createSizeAction(name: string, sortOrder: number, nameEn?: string) {
  await requireAdmin();
  const admin = createAdminClient();
  const { error } = await admin
    .from("sizes")
    .insert({ name, sort_order: sortOrder, name_en: nameEn || null });
  if (error) throw new Error(error.message);
  revalidatePath("/admin/products/new");
}
