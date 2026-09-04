import type { Locale } from "@/lib/i18n/locale";

type OrderEmailItem = {
  productName: string;
  colorName: string | null;
  sizeName: string | null;
  quantity: number;
  lineTotal: number;
};

type SendOrderConfirmationInput = {
  to: string;
  orderNumber: string;
  fullName: string;
  items: OrderEmailItem[];
  subtotal: number;
  discount: number;
  shipping: number;
  total: number;
  locale: Locale;
};

function formatMoney(value: number, locale: Locale) {
  const amount = value.toLocaleString("en-US");
  return locale === "en" ? `${amount} EGP` : `${amount} ج.م`;
}

function buildHtml(input: SendOrderConfirmationInput) {
  const isEn = input.locale === "en";
  const rows = input.items
    .map(
      (item) => `
      <tr>
        <td style="padding:8px 0;">${item.productName}${
          item.colorName || item.sizeName
            ? ` (${[item.colorName, item.sizeName].filter(Boolean).join(" / ")})`
            : ""
        } × ${item.quantity}</td>
        <td style="padding:8px 0;text-align:${isEn ? "right" : "left"};">${formatMoney(item.lineTotal, input.locale)}</td>
      </tr>`,
    )
    .join("");

  return `
    <div dir="${isEn ? "ltr" : "rtl"}" style="font-family:sans-serif;max-width:480px;margin:0 auto;color:#141311;">
      <p style="font-size:12px;letter-spacing:0.1em;text-transform:uppercase;color:#8a5a44;">
        ${isEn ? "Order received" : "تم استلام طلبك"}
      </p>
      <h1 style="font-size:20px;">${isEn ? `Thank you, ${input.fullName}` : `شكرًا لك، ${input.fullName}`}</h1>
      <p style="color:#a8a296;">${isEn ? "Order number" : "رقم الطلب"}: ${input.orderNumber}</p>
      <table style="width:100%;border-collapse:collapse;margin-top:16px;border-top:1px solid #dedacf;border-bottom:1px solid #dedacf;">
        ${rows}
      </table>
      <table style="width:100%;margin-top:12px;font-size:14px;">
        <tr><td>${isEn ? "Subtotal" : "الإجمالي الفرعي"}</td><td style="text-align:${isEn ? "right" : "left"};">${formatMoney(input.subtotal, input.locale)}</td></tr>
        ${input.discount > 0 ? `<tr><td>${isEn ? "Discount" : "الخصم"}</td><td style="text-align:${isEn ? "right" : "left"};">-${formatMoney(input.discount, input.locale)}</td></tr>` : ""}
        <tr><td>${isEn ? "Shipping" : "الشحن"}</td><td style="text-align:${isEn ? "right" : "left"};">${input.shipping === 0 ? (isEn ? "Free" : "مجاني") : formatMoney(input.shipping, input.locale)}</td></tr>
        <tr style="font-weight:bold;"><td style="padding-top:8px;">${isEn ? "Total" : "الإجمالي"}</td><td style="padding-top:8px;text-align:${isEn ? "right" : "left"};">${formatMoney(input.total, input.locale)}</td></tr>
      </table>
      <p style="margin-top:24px;color:#a8a296;font-size:12px;">
        ${isEn ? "Payment method: Cash on Delivery" : "طريقة الدفع: الدفع عند الاستلام"}
      </p>
    </div>
  `;
}

/**
 * Sends the order confirmation email via Resend's REST API directly
 * (no SDK dependency — just fetch, so nothing new to install). Silently
 * does nothing if RESEND_API_KEY / RESEND_FROM_EMAIL aren't configured,
 * and never throws — a failed or skipped email must never break
 * checkout, since the order itself already succeeded by the time this
 * runs.
 */
export async function sendOrderConfirmationEmail(input: SendOrderConfirmationInput) {
  const apiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.RESEND_FROM_EMAIL;

  if (!apiKey || !fromEmail || !input.to) return;

  try {
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: fromEmail,
        to: input.to,
        subject:
          input.locale === "en"
            ? `Order confirmed — ${input.orderNumber}`
            : `تم تأكيد طلبك — ${input.orderNumber}`,
        html: buildHtml(input),
      }),
    });
  } catch {
    // Best-effort only — the order already succeeded regardless of
    // whether the confirmation email goes out.
  }
}
