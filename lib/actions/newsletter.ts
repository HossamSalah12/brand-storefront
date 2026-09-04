"use server";

import { createClient } from "@/lib/supabase/server";
import { getLocale } from "@/lib/i18n/locale";

export type NewsletterState = { error?: string; success?: boolean } | null;

export async function subscribeNewsletterAction(
  _prevState: NewsletterState,
  formData: FormData,
): Promise<NewsletterState> {
  const locale = getLocale();
  const email = String(formData.get("email") ?? "").trim();

  if (!email || !email.includes("@")) {
    return { error: locale === "en" ? "Enter a valid email" : "أدخل بريد إلكتروني صحيح" };
  }

  const supabase = createClient();
  const { error } = await supabase.from("newsletter_subscribers").insert({ email });

  // A duplicate email is not really an error from the visitor's
  // perspective — they're already subscribed — so treat it as success.
  if (error && error.code !== "23505") {
    return { error: locale === "en" ? "Couldn't subscribe, try again" : "تعذر الاشتراك، حاول تاني" };
  }

  return { success: true };
}
