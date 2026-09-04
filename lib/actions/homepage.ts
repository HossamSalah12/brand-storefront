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

export async function updateHeroImageAction(url: string | null) {
  await requireAdmin();
  const admin = createAdminClient();
  await admin
    .from("settings")
    .upsert({ key: "hero_image", value: { url } }, { onConflict: "key" });
  revalidatePath("/");
  revalidatePath("/admin/homepage");
}
