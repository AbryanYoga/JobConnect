"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Mail, Lock, ArrowRight, LogIn, AlertCircle } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { createClient } from "@/lib/supabase/client";
import { loginSchema } from "@/lib/validation/auth";
import { fieldErrors } from "@/lib/validation/helpers";
import { useLanguage } from "@/lib/i18n";

export function LoginForm() {
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirectTo");
  const authError = searchParams.get("error");
  const { t } = useLanguage();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState<string | null>(
    authError === "oauth_failed"
      ? "Gagal masuk menggunakan akun Google. Silakan coba kembali."
      : null
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleSubmitting, setIsGoogleSubmitting] = useState(false);

  const handleGoogleLogin = async () => {
    setServerError(null);
    setIsGoogleSubmitting(true);
    try {
      const supabase = createClient();
      const callbackUrl = `${window.location.origin}/auth/callback?flow=login${
        redirectTo ? `&next=${encodeURIComponent(redirectTo)}` : ""
      }`;

      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: callbackUrl,
        },
      });

      if (error) {
        setServerError(error.message || "Gagal menghubungkan ke akun Google.");
        setIsGoogleSubmitting(false);
      }
    } catch {
      setServerError("Terjadi kendala saat menghubungi layanan Google.");
      setIsGoogleSubmitting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);

    const validationResult = loginSchema.safeParse({
      email,
      password,
    });

    if (!validationResult.success) {
      setErrors(fieldErrors(validationResult.error));
      return;
    }

    setErrors({});
    setIsSubmitting(true);

    try {
      const supabase = createClient();
      const { data, error } = await supabase.auth.signInWithPassword({
        email: validationResult.data.email,
        password: validationResult.data.password,
      });

      if (error) {
        const lowerMsg = error.message.toLowerCase();
        if (
          lowerMsg.includes("invalid login credentials") ||
          lowerMsg.includes("invalid_grant") ||
          lowerMsg.includes("wrong password")
        ) {
          setServerError(
            "Email atau kata sandi yang Anda masukkan salah. Jika akun ini sebelumnya login dengan Google, silakan gunakan tombol Masuk dengan Google di bawah."
          );
        } else if (lowerMsg.includes("email not confirmed")) {
          setServerError(
            "Email Anda belum dikonfirmasi. Silakan periksa kotak masuk email Anda."
          );
        } else {
          setServerError(
            error.message || "Gagal masuk ke akun. Silakan coba beberapa saat lagi."
          );
        }
        setIsSubmitting(false);
        return;
      }

      // Ambil data profil untuk menentukan pengalihan berdasarkan peran
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", data.user.id)
        .single();

      // Tentukan tujuan pengalihan berdasarkan parameter redirectTo atau peran akun
      let targetDestination = "/profil";
      if (redirectTo && redirectTo.startsWith("/") && !redirectTo.startsWith("//")) {
        targetDestination = redirectTo;
      } else if (profile?.role === "admin") {
        targetDestination = "/admin";
      } else if (profile?.role === "company") {
        targetDestination = "/mitra";
      }

      // Gunakan navigasi penuh (hard reload) agar root layout dan Navbar
      // membaca sesi baru pengguna secara langsung dari server
      // eslint-disable-next-line @next/next/no-location-assign-relative-destination
      window.location.href = targetDestination;
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : "Terjadi gangguan koneksi saat masuk. Silakan coba lagi.";
      setServerError(message);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-white rounded-[32px] sm:rounded-[40px] border border-black/[0.08] shadow-card p-8 sm:p-10">
        {/* Header Kartu Masuk */}
        <div className="mb-8 text-center space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#FFDD00] text-black text-xs font-bold border border-black/10 shadow-2xs">
            <LogIn className="w-3.5 h-3.5 text-black" aria-hidden="true" />
            <span>{t("Portal Masuk Akun")}</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-black tracking-tight pt-1">
            {t("Selamat Datang Kembali")}
          </h1>
          <p className="text-sm text-slate-600 leading-relaxed font-medium">
            {t("Masuk untuk melanjutkan lamaran atau mengelola lowongan kerja Anda.")}
          </p>
        </div>

        {serverError && (
          <div
            role="alert"
            className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-start gap-2.5 mb-5 font-medium"
          >
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-600" aria-hidden="true" />
            <span className="leading-snug">{serverError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          {/* Input Alamat Email */}
          <Input
            id="login-email"
            label={t("Alamat Email")}
            required
            type="email"
            autoComplete="email"
            placeholder="nama@email.com"
            leftIcon={<Mail className="w-4 h-4 text-slate-400" />}
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (errors.email) setErrors((prev) => ({ ...prev, email: "" }));
            }}
            error={errors.email}
            className="rounded-2xl bg-[#FAF8F0] border-black/[0.08] focus:border-black focus:bg-white text-sm py-3 font-medium transition-all"
          />

          {/* Input Kata Sandi */}
          <Input
            id="login-password"
            label={t("Kata Sandi")}
            required
            type="password"
            autoComplete="current-password"
            placeholder={t("Masukkan kata sandi akun Anda")}
            leftIcon={<Lock className="w-4 h-4 text-slate-400" />}
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (errors.password)
                setErrors((prev) => ({ ...prev, password: "" }));
            }}
            error={errors.password}
            className="rounded-2xl bg-[#FAF8F0] border-black/[0.08] focus:border-black focus:bg-white text-sm py-3 font-medium transition-all"
          />

          {/* Tombol Submit Masuk (Gaya BMC Pill Kuning) */}
          <div className="pt-3">
            <button
              type="submit"
              disabled={isSubmitting || isGoogleSubmitting}
              className="w-full py-3.5 px-6 rounded-full bg-[#FFDD00] hover:bg-[#F5D500] active:scale-98 text-black font-black text-base transition-all shadow-2xs hover:shadow flex items-center justify-center gap-2 min-h-[48px] disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting ? (
                <span>{t("Memproses masuk...")}</span>
              ) : (
                <>
                  <span>{t("Masuk ke Akun")}</span>
                  <ArrowRight className="w-4 h-4 stroke-[2.5]" aria-hidden="true" />
                </>
              )}
            </button>
          </div>
        </form>

        {/* Pemisah Log Masuk Pihak Ketiga */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-black/[0.08]" />
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="bg-white px-3 text-slate-500 font-medium">
              {t("atau", "or")}
            </span>
          </div>
        </div>

        {/* Tombol Masuk dengan Google */}
        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={isSubmitting || isGoogleSubmitting}
          className="w-full py-3 px-6 rounded-full bg-white hover:bg-slate-50 active:scale-98 border border-black/[0.12] text-black font-bold text-sm transition-all shadow-2xs hover:shadow flex items-center justify-center gap-3 min-h-[48px] disabled:opacity-50 cursor-pointer"
        >
          <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          <span>
            {isGoogleSubmitting
              ? t("Menghubungkan ke Google...", "Connecting to Google...")
              : t("Masuk dengan Google", "Sign In with Google")}
          </span>
        </button>

        {/* Tautan ke Pendaftaran */}
        <div className="mt-8 pt-6 border-t border-black/[0.06] text-center space-y-2.5">
          <p className="text-sm text-slate-600 font-medium">
            {t("Belum memiliki akun JobConnect?", "Don't have a JobConnect account?")}{" "}
            <Link
              href="/register"
              className="font-bold text-black hover:underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-black rounded-xs"
            >
              {t("Daftar sekarang", "Register now")}
            </Link>
          </p>

          <div className="pt-1">
            <Link
              href="/perusahaan"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-black hover:underline py-1"
            >
              <span>{t("Ingin pasang lowongan? Buka Portal Perusahaan →", "Looking to post jobs? Open Employer Portal →")}</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
