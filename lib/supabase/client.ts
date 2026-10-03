import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "./types";

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!supabaseUrl) {
    throw new Error(
      "Variabel lingkungan NEXT_PUBLIC_SUPABASE_URL belum diatur. Silakan isi di berkas .env.local."
    );
  }

  if (!supabaseAnonKey) {
    throw new Error(
      "Variabel lingkungan NEXT_PUBLIC_SUPABASE_ANON_KEY belum diatur. Silakan isi di berkas .env.local."
    );
  }

  return createBrowserClient<Database>(supabaseUrl, supabaseAnonKey);
}
