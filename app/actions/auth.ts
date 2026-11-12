"use server";

import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

/**
 * Server Action untuk keluar dari sesi akun pengguna secara mutlak.
 * Berlaku menyeluruh untuk peran Administrator, Mitra Perusahaan, dan Pencari Kerja.
 */
export async function logoutAction() {
  const cookieStore = await cookies();
  const supabase = await createClient();

  try {
    await supabase.auth.signOut();
  } catch {
    // Abaikan kegagalan jaringan jika token sudah tidak valid
  }

  const allCookies = cookieStore.getAll();
  for (const cookie of allCookies) {
    const lowerName = cookie.name.toLowerCase();
    if (
      lowerName.startsWith("sb-") ||
      lowerName.includes("auth-token") ||
      lowerName.includes("supabase")
    ) {
      try {
        cookieStore.delete(cookie.name);
      } catch {
        // Fallback jika delete gagal
      }
      try {
        cookieStore.set(cookie.name, "", {
          maxAge: 0,
          path: "/",
          sameSite: "lax",
          expires: new Date(0),
        });
      } catch {
        // Fallback jika set gagal
      }
    }
  }

  try {
    revalidatePath("/", "layout");
  } catch {
    // Abaikan jika dipanggil di luar konteks revalidasi
  }

  redirect("/login");
}
