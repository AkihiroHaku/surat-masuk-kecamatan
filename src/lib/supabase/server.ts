import "server-only";
import { createClient } from "@supabase/supabase-js";
import { env, hasSupabase } from "@/lib/env";

export function getSupabaseServerClient() {
  if (!hasSupabase || !env.supabaseServiceRoleKey) {
    return null;
  }

  return createClient(env.supabaseUrl, env.supabaseServiceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}
