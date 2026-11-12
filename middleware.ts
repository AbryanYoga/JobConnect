import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import type { Database } from "@/lib/supabase/types";

/**
 * Middleware Supabase untuk menyegarkan sesi autentikasi dan memvalidasi
 * hak akses peran (Role-Based Access Control) secara mutlak antara
 * Pencari Kerja (pelamar), Mitra Perusahaan, dan Administrator.
 */
export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return supabaseResponse;
  }

  const supabase = createServerClient<Database>(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Memanggil getUser() menyegarkan token sesi jika kedaluwarsa
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;

  // Helper untuk membuat redirect response yang mempertahankan cookie sesi Supabase
  const createRedirect = (url: URL | string) => {
    const redirectResponse = NextResponse.redirect(
      typeof url === "string" ? new URL(url, request.url) : url
    );
    supabaseResponse.cookies.getAll().forEach((cookie) => {
      redirectResponse.cookies.set(cookie.name, cookie.value, cookie);
    });
    return redirectResponse;
  };

  // Ambil peran profil pengguna jika sedang dalam sesi aktif
  let profileRole: string | null = null;
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();
    profileRole = profile?.role || "user";
  }

  // ========================================================
  // 1. PROTEKSI MUTLAK RUTE MITRA PERUSAHAAN
  // ========================================================
  // A. Dashboard privat mitra (/mitra dan seluruh sub-rutenya)
  if (pathname.startsWith("/mitra")) {
    if (!user) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirectTo", pathname);
      return createRedirect(loginUrl);
    }

    if (profileRole !== "company") {
      const forbiddenUrl = new URL("/403", request.url);
      forbiddenUrl.searchParams.set("reason", "pelamar_cannot_access_mitra");
      return createRedirect(forbiddenUrl);
    }
  }

  // B. Formulir pendaftaran perusahaan (/perusahaan/register)
  if (
    pathname === "/perusahaan/register" ||
    pathname.startsWith("/perusahaan/register/")
  ) {
    if (user) {
      if (profileRole === "company") {
        // Akun perusahaan sudah terdaftar, langsung arahkan ke dashboard mitra
        return createRedirect("/mitra");
      }
      if (profileRole === "user") {
        // Akun pencari kerja mutlak dilarang mendaftar perusahaan saat sesi pelamar aktif
        const forbiddenUrl = new URL("/403", request.url);
        forbiddenUrl.searchParams.set("reason", "pelamar_cannot_access_mitra");
        return createRedirect(forbiddenUrl);
      }
      if (profileRole === "admin") {
        return createRedirect("/admin");
      }
    }
  }

  // ========================================================
  // 2. PROTEKSI MUTLAK RUTE ADMINISTRATOR (/admin)
  // ========================================================
  if (pathname.startsWith("/admin")) {
    if (!user) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirectTo", pathname);
      return createRedirect(loginUrl);
    }

    if (profileRole !== "admin") {
      return createRedirect(new URL("/403", request.url));
    }
  }

  // ========================================================
  // 3. PROTEKSI MUTLAK RUTE PENCARI KERJA (PELAMAR)
  // ========================================================
  // A. Riwayat lamaran dan lowongan tersimpan (/lamaran-saya & /tersimpan)
  if (
    pathname.startsWith("/lamaran-saya") ||
    pathname.startsWith("/tersimpan")
  ) {
    if (!user) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirectTo", pathname);
      return createRedirect(loginUrl);
    }

    if (profileRole === "company") {
      // Akun perusahaan mutlak dilarang mengakses riwayat lamaran pencari kerja
      return createRedirect("/mitra");
    }

    if (profileRole === "admin") {
      return createRedirect("/admin");
    }
  }

  // B. Formulir profil pelamar (/profil)
  if (pathname.startsWith("/profil")) {
    if (!user) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirectTo", pathname);
      return createRedirect(loginUrl);
    }

    if (profileRole === "company") {
      // Akun perusahaan diarahkan ke kelola profil perusahaannya
      return createRedirect("/mitra/profil-perusahaan");
    }

    if (profileRole === "admin") {
      return createRedirect("/admin");
    }
  }

  // C. Halaman notifikasi (/notifikasi)
  if (pathname.startsWith("/notifikasi")) {
    if (!user) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirectTo", pathname);
      return createRedirect(loginUrl);
    }
  }

  // ========================================================
  // 4. PENGALIHAN CERDAS HALAMAN REGISTRASI UMUM (/register)
  // ========================================================
  if (pathname === "/register") {
    if (user) {
      if (profileRole === "company") {
        return createRedirect("/mitra");
      }
      if (profileRole === "admin") {
        return createRedirect("/admin");
      }
      return createRedirect("/profil");
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    /*
     * Terapkan middleware ke seluruh rute aplikasi kecuali:
     * - _next/static (file statis)
     * - _next/image (optimasi gambar)
     * - favicon.ico, icon.svg
     * - file berekstensi statis: svg, png, jpg, jpeg, gif, webp, pdf
     */
    "/((?!_next/static|_next/image|favicon.ico|icon.svg|.*\\.(?:svg|png|jpg|jpeg|gif|webp|pdf)$).*)",
  ],
};
