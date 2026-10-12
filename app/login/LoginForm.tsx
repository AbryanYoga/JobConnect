"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Mail, Lock, ArrowRight, LogIn, AlertCircle } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { createClient } from "@/lib/supabase/client";
import { loginSchema } from "@/lib/validation/auth";
import { fieldErrors } from "@/lib/validation/helpers";
import { useLanguage } from "@/lib/i18n";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirectTo");
  const { t } = useLanguage();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
          setServerError("Email atau kata sandi yang Anda masukkan salah.");
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

      router.refresh();

      // Pengalihan berdasarkan parameter redirectTo atau peran akun
      if (redirectTo && redirectTo.startsWith("/") && !redirectTo.startsWith("//")) {
        router.push(redirectTo);
      } else if (profile?.role === "admin") {
        router.push("/admin");
      } else if (profile?.role === "company") {
        router.push("/mitra");
      } else {
        router.push("/profil");
      }
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
              disabled={isSubmitting}
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

        {/* Tautan ke Pendaftaran */}
        <div className="mt-8 pt-6 border-t border-black/[0.06] text-center">
          <p className="text-sm text-slate-600 font-medium">
            {t("Belum memiliki akun JobConnect?")}{" "}
            <Link
              href="/register"
              className="font-bold text-black hover:underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-black rounded-xs"
            >
              {t("Daftar sekarang")}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
