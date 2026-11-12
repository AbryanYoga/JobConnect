import { NextResponse, type NextRequest } from "next/server";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

/**
 * Handler rute keluar akun (logout) universal di sisi server.
 * Menangani permintaan POST dan GET secara konsisten untuk memastikan sesi
 * dibatalkan dan seluruh cookie autentikasi dimusnahkan dari peramban.
 */
async function handleLogout(request: NextRequest) {
  const cookieStore = await cookies();
  const supabase = await createClient();

  // 1. Batalkan sesi di server autentikasi Supabase
  try {
    await supabase.auth.signOut();
  } catch {
    // Abaikan jika token sesi sudah tidak valid atau kedaluwarsa
  }

  // 2. Kumpulkan seluruh cookie autentikasi yang tersimpan
  const allCookies = cookieStore.getAll();
  const cookiesToPurge: string[] = [];

  for (const cookie of allCookies) {
    const lowerName = cookie.name.toLowerCase();
    if (
      lowerName.startsWith("sb-") ||
      lowerName.includes("auth-token") ||
      lowerName.includes("supabase")
    ) {
      cookiesToPurge.push(cookie.name);
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

  // 3. Revalidasi seluruh pohon cache rute dan layout Next.js
  try {
    revalidatePath("/", "layout");
  } catch {
    // Abaikan di luar siklus render
  }

  // 4. Siapkan respon pengalihan ke halaman masuk
  const url = new URL("/login", request.url);
  const response = NextResponse.redirect(url, { status: 303 });

  // 5. Lampirkan header Set-Cookie kedaluwarsa langsung pada respon HTTP
  for (const name of cookiesToPurge) {
    response.cookies.set(name, "", {
      maxAge: 0,
      path: "/",
      sameSite: "lax",
      expires: new Date(0),
    });
  }

  return response;
}

export async function POST(request: NextRequest) {
  return handleLogout(request);
}

export async function GET(request: NextRequest) {
  return handleLogout(request);
}
