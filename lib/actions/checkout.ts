"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Locale } from "@/lib/i18n/locale";
import { sendOrderConfirmationEmail } from "@/lib/email/sendOrderConfirmation";

export type CouponPreview =
  | { valid: true; discount: number; type: "percentage" | "fixed"; value: number }
  | { valid: false; message: string };

/**
 * Coupons aren't publicly readable (RLS restricts the table to admins) so
 * customers can't enumerate active codes by querying the table directly.
 * This action uses the admin client specifically to validate a single,
 * customer-supplied code — it's a preview only. The authoritative discount
 * is always recalculated again inside create_order() at submit time.
 */
export async function validateCouponAction(
  code: string,
  subtotal: number,
  locale: Locale = "ar",
): Promise<CouponPreview> {
  const msg = {
    empty: locale === "en" ? "Enter a discount code" : "أدخل كود الخصم",
    invalid: locale === "en" ? "Invalid code" : "الكود غير صحيح",
    expired: locale === "en" ? "This code has expired" : "انتهت صلاحية الكود",
    usedUp: locale === "en" ? "This code has been fully used" : "تم استخدام هذا الكود بالكامل",
    minNotMet: (amount: number) =>
      locale === "en"
        ? `Minimum order of ${amount} is required to use this code`
        : `الحد الأدنى للطلب ${amount} ج.م لاستخدام هذا الكود`,
  };

  if (!code.trim()) return { valid: false, message: msg.empty };

  const admin = createAdminClient();
  const { data: coupon } = await admin
    .from("coupons")
    .select("type, value, min_order_amount, usage_limit, times_used, is_active, expires_at")
    .eq("code", code.trim())
    .maybeSingle();

  if (!coupon || !coupon.is_active) {
    return { valid: false, message: msg.invalid };
  }
  if (coupon.expires_at && new Date(coupon.expires_at) < new Date()) {
    return { valid: false, message: msg.expired };
  }
  if (coupon.usage_limit != null && coupon.times_used >= coupon.usage_limit) {
    return { valid: false, message: msg.usedUp };
  }
  if (subtotal < coupon.min_order_amount) {
    return { valid: false, message: msg.minNotMet(coupon.min_order_amount) };
  }

  const discount =
    coupon.type === "percentage"
      ? Math.round((subtotal * coupon.value) / 100)
      : Math.min(coupon.value, subtotal);

  return { valid: true, discount, type: coupon.type, value: coupon.value };
}

export type PlaceOrderInput = {
  fullName: string;
  phone: string;
  email: string;
  governorate: string;
  city: string;
  fullAddress: string;
  building: string;
  apartment: string;
  floor: string;
  landmark: string;
  couponCode: string | null;
  items: { variantId: string; quantity: number }[];
  locale?: Locale;
};

export type PlaceOrderResult =
  | { success: true; orderId: string; orderNumber: string }
  | { success: false; error: string };

const ERROR_MESSAGES: Record<Locale, Record<string, string>> = {
  ar: {
    CART_EMPTY: "السلة فارغة",
    MISSING_CONTACT_INFO: "أكمل بيانات التواصل",
    MISSING_ADDRESS: "أكمل بيانات العنوان",
    VARIANT_NOT_FOUND: "أحد المنتجات لم يعد متوفرًا",
    INVALID_QUANTITY: "كمية غير صحيحة",
    INVALID_COUPON: "كود الخصم غير صحيح",
    COUPON_MIN_NOT_MET: "الطلب أقل من الحد الأدنى لاستخدام كود الخصم",
  },
  en: {
    CART_EMPTY: "Your cart is empty",
    MISSING_CONTACT_INFO: "Please complete your contact details",
    MISSING_ADDRESS: "Please complete your address",
    VARIANT_NOT_FOUND: "One of the products is no longer available",
    INVALID_QUANTITY: "Invalid quantity",
    INVALID_COUPON: "Invalid discount code",
    COUPON_MIN_NOT_MET: "Order total is below the minimum required for this discount code",
  },
};

export async function placeOrderAction(
  input: PlaceOrderInput,
): Promise<PlaceOrderResult> {
  const locale: Locale = input.locale === "en" ? "en" : "ar";

  if (!input.items.length) {
    return { success: false, error: ERROR_MESSAGES[locale].CART_EMPTY };
  }

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data, error } = await supabase.rpc("create_order", {
    p_guest_email: user ? null : input.email || null,
    p_full_name: input.fullName,
    p_phone: input.phone,
    p_email: input.email || null,
    p_governorate: input.governorate,
    p_city: input.city,
    p_full_address: input.fullAddress,
    p_building: input.building || null,
    p_apartment: input.apartment || null,
    p_floor: input.floor || null,
    p_landmark: input.landmark || null,
    p_coupon_code: input.couponCode || null,
    p_items: input.items.map((i) => ({ variant_id: i.variantId, quantity: i.quantity })),
  });

  if (error) {
    const code = error.message.split(":")[0];
    if (code.startsWith("INSUFFICIENT_STOCK")) {
      const sku = error.message.split(":")[1] ?? "";
      return {
        success: false,
        error:
          locale === "en"
            ? `This item is out of stock (${sku}). Please update your cart and try again.`
            : `الكمية غير متوفرة للمنتج (${sku}). حدّث السلة وحاول تاني.`,
      };
    }
    return {
      success: false,
      error: ERROR_MESSAGES[locale][code] ?? (locale === "en" ? "Couldn't place your order, please try again" : "تعذر إتمام الطلب، حاول تاني"),
    };
  }

  const orderId = data.order_id as string;
  const orderNumber = data.order_number as string;

  // Fire the confirmation email using the order as actually stored (not
  // the client's input) — authoritative prices/totals, and skips silently
  // if RESEND isn't configured or the customer has no email on file.
  const recipientEmail = input.email || user?.email || null;
  if (recipientEmail) {
    const { data: orderRow } = await supabase
      .from("orders")
      .select(
        "subtotal, discount_amount, shipping_amount, total, order_items(product_name, color_name, size_name, quantity, line_total)",
      )
      .eq("id", orderId)
      .single();

    if (orderRow) {
      await sendOrderConfirmationEmail({
        to: recipientEmail,
        orderNumber,
        fullName: input.fullName,
        items: (orderRow.order_items ?? []).map((i: any) => ({
          productName: i.product_name,
          colorName: i.color_name,
          sizeName: i.size_name,
          quantity: i.quantity,
          lineTotal: i.line_total,
        })),
        subtotal: orderRow.subtotal,
        discount: orderRow.discount_amount,
        shipping: orderRow.shipping_amount,
        total: orderRow.total,
        locale,
      });
    }
  }

  return { success: true, orderId, orderNumber };
}
