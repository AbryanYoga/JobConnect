"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  User,
  Building2,
  Mail,
  Lock,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { Input } from "@/components/ui/Input";
import { createClient } from "@/lib/supabase/client";
import { registerSchema, peranToRole, type Peran } from "@/lib/validation/auth";
import { fieldErrors } from "@/lib/validation/helpers";
import { useLanguage } from "@/lib/i18n";

export function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t, language } = useLanguage();
  const initialPeran: Peran =
    searchParams.get("peran") === "perusahaan" ? "perusahaan" : "pelamar";

  const [peran, setPeran] = useState<Peran>(initialPeran);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);

    const validationResult = registerSchema.safeParse({
      name,
      email,
      password,
      confirmPassword,
      peran,
    });

    if (!validationResult.success) {
      setErrors(fieldErrors(validationResult.error));
      return;
    }

    setErrors({});
    setIsSubmitting(true);

    try {
      const supabase = createClient();
      const { data, error } = await supabase.auth.signUp({
        email: validationResult.data.email,
        password: validationResult.data.password,
        options: {
          data: {
            name: validationResult.data.name,
            role: peranToRole(validationResult.data.peran),
          },
        },
      });

      if (error) {
        const lowerMsg = error.message.toLowerCase();
        if (
          lowerMsg.includes("already registered") ||
          lowerMsg.includes("user_already_exists")
        ) {
          setServerError(
            "Email ini sudah terdaftar. Silakan gunakan email lain atau masuk ke akun Anda."
          );
        } else {
          setServerError(
            error.message || "Pendaftaran gagal. Silakan coba beberapa saat lagi."
          );
        }
        setIsSubmitting(false);
        return;
      }

      // Jika sesi langsung terbentuk (tanpa verifikasi email)
      if (data.session) {
        router.refresh();
        if (peran === "perusahaan") {
          router.push("/mitra/profil-perusahaan?onboarding=true");
        } else {
          router.push("/profil");
        }
        return;
      }

      // Tampilkan notifikasi konfirmasi jika butuh verifikasi email
      setIsSuccess(true);
      setIsSubmitting(false);
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : "Terjadi gangguan koneksi saat mendaftar. Silakan coba lagi.";
      setServerError(message);
      setIsSubmitting(false);
    }
  };

  const isCompany = peran === "perusahaan";

  if (isSuccess) {
    return (
      <div className="w-full max-w-md mx-auto">
        <div className="bg-white rounded-[32px] sm:rounded-[40px] border border-black/[0.08] shadow-card p-8 sm:p-10 text-center">
          <div className="w-14 h-14 rounded-2xl bg-[#FFDD00] text-black mx-auto flex items-center justify-center mb-5 shadow-2xs">
            <CheckCircle2 className="w-7 h-7" aria-hidden="true" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-black tracking-tight">
            {t("Pendaftaran Berhasil!")}
          </h2>
          <p className="text-sm text-slate-600 mt-2.5 leading-relaxed font-medium">
            {language === "en" ? (
              <>
                Your account was successfully registered as{" "}
                <span className="font-bold text-black">
                  {isCompany ? "Partner Company" : "Job Seeker"}
                </span>
                . Please check the email inbox of{" "}
                <span className="font-bold text-black">{email}</span> to confirm
                your account before signing in.
              </>
            ) : (
              <>
                Akun Anda berhasil didaftarkan sebagai{" "}
                <span className="font-bold text-black">
                  {isCompany ? "Perusahaan Mitra" : "Pelamar Kerja"}
                </span>
                . Silakan periksa kotak masuk email{" "}
                <span className="font-bold text-black">{email}</span> untuk
                mengonfirmasi akun sebelum masuk.
              </>
            )}
          </p>
          <div className="mt-8">
            <Link
              href="/login"
              className="inline-flex items-center justify-center w-full px-6 py-3.5 rounded-full bg-[#FFDD00] hover:bg-[#F5D500] text-black font-black text-sm transition-all shadow-2xs"
            >
              {t("Menuju Halaman Masuk")}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Header Kartu Pendaftaran */}
      <div className="bg-white rounded-[32px] sm:rounded-[40px] border border-black/[0.08] shadow-card p-8 sm:p-10">
        <div className="mb-8 text-center space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#FFDD00] text-black text-xs font-bold border border-black/10 shadow-2xs">
            <ShieldCheck className="w-3.5 h-3.5 text-black" aria-hidden="true" />
            <span>{t("Pendaftaran Akun Terverifikasi")}</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-black tracking-tight pt-1">
            {t("Buat Akun Baru")}
          </h1>
          <p className="text-sm text-slate-600 leading-relaxed font-medium">
            {t("Pilih peran Anda dan mulai temukan lowongan atau pasang lowongan kerja.")}
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
          {/* Pemilihan Peran (Segmented Radio Cards Gaya BMC) */}
          <div className="space-y-2">
            <span className="block text-xs font-bold text-black uppercase tracking-wide">
              {t("Daftar Sebagai")}
            </span>
            <div
              className="grid grid-cols-2 gap-3"
              role="radiogroup"
              aria-label={t("Daftar Sebagai")}
            >
              <button
                type="button"
                role="radio"
                aria-checked={peran === "pelamar"}
                onClick={() => {
                  setPeran("pelamar");
                  if (errors.name) {
                    setErrors((prev) => ({ ...prev, name: "" }));
                  }
                }}
                className={`flex flex-col items-start p-3.5 rounded-2xl border text-left transition-all min-h-[5.5rem] cursor-pointer focus-visible:outline-2 focus-visible:outline-black ${
                  peran === "pelamar"
                    ? "border-black bg-black text-white shadow-2xs"
                    : "border-black/[0.08] bg-[#FAF8F0] text-slate-800 hover:bg-black/5"
                }`}
              >
                <div className="flex items-center gap-2 mb-1.5">
                  <div
                    className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 ${
                      peran === "pelamar"
                        ? "bg-[#FFDD00] text-black"
                        : "bg-white text-slate-700 border border-black/[0.08]"
                    }`}
                  >
                    <User className="w-4 h-4" aria-hidden="true" />
                  </div>
                  <span className="font-bold text-sm">{t("Pelamar")}</span>
                </div>
                <span
                  className={`text-[11px] leading-snug ${
                    peran === "pelamar" ? "text-slate-300" : "text-slate-500"
                  }`}
                >
                  {t("Cari dan lamar lowongan kerja")}
                </span>
              </button>

              <button
                type="button"
                role="radio"
                aria-checked={peran === "perusahaan"}
                onClick={() => {
                  setPeran("perusahaan");
                  if (errors.name) {
                    setErrors((prev) => ({ ...prev, name: "" }));
                  }
                }}
                className={`flex flex-col items-start p-3.5 rounded-2xl border text-left transition-all min-h-[5.5rem] cursor-pointer focus-visible:outline-2 focus-visible:outline-black ${
                  peran === "perusahaan"
                    ? "border-black bg-black text-white shadow-2xs"
                    : "border-black/[0.08] bg-[#FAF8F0] text-slate-800 hover:bg-black/5"
                }`}
              >
                <div className="flex items-center gap-2 mb-1.5">
                  <div
                    className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 ${
                      peran === "perusahaan"
                        ? "bg-[#FFDD00] text-black"
                        : "bg-white text-slate-700 border border-black/[0.08]"
                    }`}
                  >
                    <Building2 className="w-4 h-4" aria-hidden="true" />
                  </div>
                  <span className="font-bold text-sm">{t("Perusahaan")}</span>
                </div>
                <span
                  className={`text-[11px] leading-snug ${
                    peran === "perusahaan" ? "text-slate-300" : "text-slate-500"
                  }`}
                >
                  {t("Pasang lowongan dan rekrut tim")}
                </span>
              </button>
            </div>
          </div>

          {/* Input Nama Lengkap / Nama Perusahaan */}
          <Input
            id="register-name"
            label={isCompany ? t("Nama Perusahaan") : t("Nama Lengkap")}
            required
            type="text"
            autoComplete={isCompany ? "organization" : "name"}
            placeholder={
              isCompany
                ? (language === "en" ? "e.g. Acme Corporation" : "Contoh: PT Teknologi Bangsa")
                : (language === "en" ? "e.g. John Doe" : "Contoh: Budi Santoso")
            }
            leftIcon={
              isCompany ? (
                <Building2 className="w-4 h-4 text-slate-400" />
              ) : (
                <User className="w-4 h-4 text-slate-400" />
              )
            }
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (errors.name) setErrors((prev) => ({ ...prev, name: "" }));
            }}
            error={errors.name}
            className="rounded-2xl bg-[#FAF8F0] border-black/[0.08] focus:border-black focus:bg-white text-sm py-3 font-medium transition-all"
          />

          {/* Input Alamat Email */}
          <Input
            id="register-email"
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
            id="register-password"
            label={t("Kata Sandi")}
            required
            type="password"
            autoComplete="new-password"
            placeholder={t("Minimal 8 karakter")}
            helperText={t("Gunakan minimal 8 karakter gabungan huruf dan angka.")}
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

          {/* Input Konfirmasi Kata Sandi */}
          <Input
            id="register-confirm-password"
            label={t("Konfirmasi Kata Sandi")}
            required
            type="password"
            autoComplete="new-password"
            placeholder={t("Ulangi kata sandi")}
            leftIcon={<Lock className="w-4 h-4 text-slate-400" />}
            value={confirmPassword}
            onChange={(e) => {
              setConfirmPassword(e.target.value);
              if (errors.confirmPassword)
                setErrors((prev) => ({ ...prev, confirmPassword: "" }));
            }}
            error={errors.confirmPassword}
            className="rounded-2xl bg-[#FAF8F0] border-black/[0.08] focus:border-black focus:bg-white text-sm py-3 font-medium transition-all"
          />

          {/* Tombol Submit Pendaftaran (Gaya BMC Pill Kuning) */}
          <div className="pt-3">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 px-6 rounded-full bg-[#FFDD00] hover:bg-[#F5D500] active:scale-98 text-black font-black text-base transition-all shadow-2xs hover:shadow flex items-center justify-center gap-2 min-h-[48px] disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting ? (
                <span>{t("Memproses pendaftaran...")}</span>
              ) : (
                <>
                  <span>
                    {isCompany
                      ? t("Daftar sebagai Perusahaan")
                      : t("Daftar sebagai Pelamar")}
                  </span>
                  <ArrowRight className="w-4 h-4 stroke-[2.5]" aria-hidden="true" />
                </>
              )}
            </button>
          </div>
        </form>

        {/* Tautan Masuk */}
        <div className="mt-8 pt-6 border-t border-black/[0.06] text-center">
          <p className="text-sm text-slate-600 font-medium">
            {t("Sudah memiliki akun JobConnect?")}{" "}
            <Link
              href="/login"
              className="font-bold text-black hover:underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-black rounded-xs"
            >
              {t("Masuk di sini")}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
