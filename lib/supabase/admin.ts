import "server-only";

// Klien Supabase service role khusus operasi administratif server terisolasi.
import { createClient } from "@supabase/supabase-js";
import type { Database } from "./types";

export function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl) {
    throw new Error(
      "Variabel lingkungan NEXT_PUBLIC_SUPABASE_URL belum diatur. Silakan isi di berkas .env.local."
    );
  }

  if (!serviceRoleKey) {
    throw new Error(
      "Variabel lingkungan SUPABASE_SERVICE_ROLE_KEY belum diatur. Silakan isi di berkas .env.local."
    );
  }

  return createClient<Database>(supabaseUrl, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}
