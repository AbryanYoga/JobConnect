import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next");
  const flow = searchParams.get("flow") || "login";
  const peranParam = searchParams.get("peran") || searchParams.get("role");
  const isCompanyRegister = peranParam === "perusahaan" || peranParam === "company";

  if (code) {
    const supabase = await createClient();
    const { data: exchangeData, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && exchangeData?.user) {
      const user = exchangeData.user;

      // ========================================================
      // OPSI A: STRICT CHECK PADA LOGIN
      // Jika pengguna menekan tombol "Masuk dengan Google" (flow === "login"),
      // namun akunnya baru saja terbuat (artinya belum pernah mendaftar sebelumnya):
      // ========================================================
      const isRegistered = Boolean(user.user_metadata?.is_registered);
      const isRegistrationBlocked = Boolean(user.user_metadata?.registration_required);

      // Akun dianggap baru dibuat saat ini jika selisih waktu kurang dari 30 detik
      const createdAtMs = new Date(user.created_at).getTime();
      const isBrandNewAccount = Date.now() - createdAtMs < 30000;

      if (flow === "login") {
        if ((isBrandNewAccount && !isRegistered) || isRegistrationBlocked) {
          // Tandai akun bahwa registrasi wajib diselesaikan sebelum bisa login
          await supabase.auth.updateUser({
            data: { registration_required: true, is_registered: false },
          });

          // Batalkan sesi saat ini
          await supabase.auth.signOut();

          // Alihkan ke formulir registrasi dengan indikator not_registered
          return NextResponse.redirect(`${origin}/register?error=not_registered`);
        }
      } else if (flow === "register") {
        // Jika alur berasal dari halaman registrasi resmi, tandai akun sebagai terdaftar
        await supabase.auth.updateUser({
          data: {
            is_registered: true,
            registration_required: false,
            ...(isCompanyRegister ? { role: "company" } : {}),
          },
        });

        // Jika mendaftar sebagai perusahaan, perbarui role profil via RPC
        if (isCompanyRegister) {
          try {
            await supabase.rpc("register_as_company");
          } catch {
            // Abaikan jika RPC belum dieksekusi di Supabase
          }
        }
      }

      // Ambil data profil pengguna untuk menentukan dashboard yang tepat dan memvalidasi peran
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      const userRole = profile?.role || "user";

      // Jika alur pendaftaran perusahaan namun peran di database belum menjadi 'company'
      // (misal akun Google sudah terlanjur terdaftar sebagai pelamar atau fungsi RPC belum terpasang):
      if (isCompanyRegister && userRole !== "company") {
        return NextResponse.redirect(
          `${origin}/perusahaan/register?error=google_role_conflict`
        );
      }

      // Jika ada parameter pengalihan khusus yang sah sesuai peran pengguna
      if (next && next.startsWith("/") && !next.startsWith("//")) {
        // Cegah pengguna selain mitra diarahkan ke rute /mitra yang akan memicu 403
        if (next.startsWith("/mitra") && userRole !== "company") {
          return NextResponse.redirect(`${origin}/profil`);
        }
        return NextResponse.redirect(`${origin}${next}`);
      }

      if (userRole === "admin") {
        return NextResponse.redirect(`${origin}/admin`);
      } else if (userRole === "company") {
        return NextResponse.redirect(`${origin}/mitra/profil-perusahaan?onboarding=true`);
      } else {
        return NextResponse.redirect(`${origin}/profil`);
      }
    }
  }

  // Jika gagal otentikasi OAuth, arahkan kembali ke login dengan kode error
  return NextResponse.redirect(`${origin}/login?error=oauth_failed`);
}
