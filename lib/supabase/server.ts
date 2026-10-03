/**
 * Catatan keamanan:
 * Di kode server, selalu gunakan supabase.auth.getUser() untuk memeriksa pengguna,
 * jangan gunakan getSession(), karena getSession() tidak memverifikasi token ke server Supabase.
 */

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "./types";

export async function createClient() {
  const cookieStore = await cookies();

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

  return createServerClient<Database>(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // Diabaikan karena Server Component tidak dapat menulis cookie.
          // Penyegaran sesi dilakukan di middleware atau proxy (Fase 7).
        }
      },
    },
  });
}
