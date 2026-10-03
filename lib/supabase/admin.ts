import "server-only";

/**
 * Catatan keamanan:
 * Klien ini menggunakan SUPABASE_SERVICE_ROLE_KEY dengan hak akses penuh yang melewati RLS.
 * Berkas ini HANYA boleh diimpor dari lib/ai/ untuk:
 * 1. Menyimpan hasil analisis AI (application_ai_reviews).
 * 2. Mengunduh berkas CV pelamar yang dianalisis secara privat.
 * Dilarang mengimpor atau menggunakan berkas ini di komponen klien atau rute umum.
 */

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
