import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/types/database";

/**
 * SERVER-ONLY. Never import this file from a Client Component or
 * anything bundled to the browser — it holds the service role key,
 * which bypasses Row Level Security entirely.
 *
 * Use it only for operations that legitimately need to cross RLS
 * boundaries under Claude's/your own server-side authorization
 * checks, e.g.:
 *  - decrementing variant stock when an order is placed
 *  - the one-time first-admin bootstrap script
 *  - admin dashboard reads that intentionally span all customers' data
 *
 * Every function that uses this client MUST do its own authorization
 * check first (e.g. verify the caller's session role is 'admin')
 * since the database will no longer stop it.
 */
export function createAdminClient() {
  if (typeof window !== "undefined") {
    throw new Error(
      "createAdminClient() must never be called in the browser.",
    );
  }

  return createSupabaseClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } },
  );
}
