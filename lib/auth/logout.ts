import { createClient } from "@/lib/supabase/client";

/**
 * Fungsi keluar akun (logout) universal di sisi peramban (client).
 * Berlaku mutlak untuk seluruh peran: Administrator, Mitra Perusahaan, dan Pencari Kerja.
 *
 * Alur eksekusi:
 * 1. Menghentikan sesi aktif di Supabase client browser.
 * 2. Membersihkan seluruh cookie autentikasi Supabase di dokumen peramban.
 * 3. Menghapus data sesi dan token di localStorage dan sessionStorage.
 * 4. Memanggil endpoint server /auth/logout untuk memusnahkan cookie sesi di cookieStore server.
 * 5. Menjalankan navigasi keras (hard reload ke /login) agar seluruh cache Next.js App Router
 *    dibersihkan dan komponen server (seperti Navbar) memuat ulang status tamu.
 */
export async function performClientLogout(targetUrl: string = "/login"): Promise<void> {
  // 1. Panggil signOut pada browser client Supabase
  try {
    const supabase = createClient();
    await supabase.auth.signOut({ scope: "local" });
  } catch {
    // Tetap lanjutkan pembersihan manual jika client signOut gagal
  }

  // 2. Bersihkan document.cookie untuk seluruh token dan sesi Supabase
  try {
    if (typeof document !== "undefined" && document.cookie) {
      const cookiesList = document.cookie.split(";");
      for (const item of cookiesList) {
        const eqPos = item.indexOf("=");
        const name = eqPos > -1 ? item.substring(0, eqPos).trim() : item.trim();
        if (
          name.startsWith("sb-") ||
          name.includes("auth-token") ||
          name.includes("supabase")
        ) {
          // Atur kedaluwarsa ke masa lalu di path root dan path saat ini
          document.cookie = `${name}=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT; Max-Age=0; SameSite=Lax;`;
          document.cookie = `${name}=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT; Max-Age=0;`;
        }
      }
    }
  } catch {
    // Abaikan jika peramban membatasi akses cookie via JavaScript
  }

  // 3. Bersihkan sisa token di localStorage dan sessionStorage
  try {
    if (typeof window !== "undefined") {
      const purgeStorage = (storage: Storage) => {
        const keysToRemove: string[] = [];
        for (let i = 0; i < storage.length; i++) {
          const key = storage.key(i);
          if (key && (key.startsWith("sb-") || key.includes("supabase") || key === "jobconnect_user_avatar")) {
            keysToRemove.push(key);
          }
        }
        keysToRemove.forEach((key) => {
          try {
            storage.removeItem(key);
          } catch {
            // Abaikan kegagalan individual
          }
        });
      };

      purgeStorage(window.localStorage);
      purgeStorage(window.sessionStorage);
    }
  } catch {
    // Abaikan pembatasan penyimpanan peramban
  }

  // 4. Panggil endpoint server /auth/logout untuk memusnahkan cookie HTTP-Only di server
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000);
    await fetch("/auth/logout", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store",
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
  } catch {
    // Jika fetch gagal atau timeout, navigasi langsung tetap akan mengakhiri sesi di peramban
  }

  // 5. Lakukan navigasi penuh (hard navigation) agar root layout dirender ulang dari server
  if (typeof window !== "undefined") {
    window.location.href = targetUrl;
  }
}
