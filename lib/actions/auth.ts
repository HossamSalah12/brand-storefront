"use server";

import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { loginSchema, registerSchema } from "@/lib/validation/auth";
import { getLocale } from "@/lib/i18n/locale";

export type AuthActionState = {
  error?: string;
  success?: boolean;
} | null;

export async function registerAction(
  _prevState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const locale = getLocale();
  const parsed = registerSchema.safeParse({
    fullName: formData.get("fullName"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: locale === "en" ? "Please check your details and try again" : "بيانات غير صحيحة" };
  }

  const { fullName, email, phone, password } = parsed.data;
  const supabase = createClient();

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName, phone },
    },
  });

  if (error) {
    return { error: translateAuthError(error.message, locale) };
  }

  redirect("/account");
}

export async function loginAction(
  _prevState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const locale = getLocale();
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: locale === "en" ? "Please check your details and try again" : "بيانات غير صحيحة" };
  }

  const supabase = createClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);

  if (error) {
    return { error: translateAuthError(error.message, locale) };
  }

  const redirectTo = formData.get("redirectTo");
  redirect(typeof redirectTo === "string" && redirectTo ? redirectTo : "/account");
}

export async function requestPasswordResetAction(
  _prevState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const locale = getLocale();
  const email = String(formData.get("email") ?? "").trim();

  if (!email) {
    return { error: locale === "en" ? "Enter your email" : "أدخل بريدك الإلكتروني" };
  }

  const supabase = createClient();
  const origin = headers().get("origin") ?? "";

  // We never reveal whether the email exists in the system — same
  // success message either way — so this can't be used to enumerate
  // registered customer accounts.
  await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/auth/callback?next=/account/reset-password`,
  });

  return { success: true } as AuthActionState;
}

export async function updatePasswordAction(
  _prevState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const locale = getLocale();
  const password = String(formData.get("password") ?? "");

  if (password.length < 8) {
    return {
      error: locale === "en" ? "Password must be at least 8 characters" : "كلمة المرور لازم تكون 8 حروف على الأقل",
    };
  }

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      error:
        locale === "en"
          ? "This reset link has expired. Please request a new one."
          : "انتهت صلاحية رابط إعادة التعيين، اطلب رابط جديد.",
    };
  }

  const { error } = await supabase.auth.updateUser({ password });
  if (error) {
    return { error: locale === "en" ? "Couldn't update your password" : "تعذر تحديث كلمة المرور" };
  }

  redirect("/account");
}
export async function logoutAction() {
  const supabase = createClient();
  await supabase.auth.signOut();
  redirect("/account/login");
}

function translateAuthError(message: string, locale: "ar" | "en"): string {
  if (message.includes("Invalid login credentials")) {
    return locale === "en" ? "Incorrect email or password" : "البريد الإلكتروني أو كلمة المرور غير صحيحة";
  }
  if (message.includes("User already registered")) {
    return locale === "en" ? "This email is already registered" : "البريد الإلكتروني مستخدم بالفعل";
  }
  return locale === "en" ? "Something went wrong, please try again" : "حصل خطأ، حاول تاني";
}
