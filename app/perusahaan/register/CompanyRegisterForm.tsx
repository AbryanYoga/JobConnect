"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Building2,
  Mail,
  Lock,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  User,
  LogOut,
  Loader2,
} from "lucide-react";
import { Input } from "@/components/ui/Input";
import { createClient } from "@/lib/supabase/client";
import {
  companyRegisterSchema,
  peranToRole,
} from "@/lib/validation/auth";
import { fieldErrors } from "@/lib/validation/helpers";
import { hasProfanity } from "@/lib/validation/profanity";
import { useLanguage } from "@/lib/i18n";
import { switchToCompanyAction } from "@/app/actions/mitra";
import { Phone } from "lucide-react";

export function CompanyRegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const authError = searchParams.get("error");
  const { t, language } = useLanguage();

  const [picName, setPicName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState<string | null>(() => {
    if (!authError) return null;
    return authError === "access_denied"
      ? "Akses pendaftaran dibatalkan."
      : decodeURIComponent(authError);
  });
  const [isSuccess, setIsSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSwitching, setIsSwitching] = useState(false);

  // Status deteksi sesi aktif
  const [currentUser, setCurrentUser] = useState<{
    id: string;
    email?: string;
    name?: string;
    role?: string;
  } | null>(null);
  const [isLoadingSession, setIsLoadingSession] = useState(true);

  useEffect(() => {
    async function checkCurrentSession() {
      try {
        const supabase = createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (user) {
          const { data: profile } = await supabase
            .from("profiles")
            .select("name, role")
            .eq("id", user.id)
            .maybeSingle();

          if (profile?.role === "company") {
            router.push("/mitra");
            return;
          }

          if (profile?.role === "user") {
            setCurrentUser({
              id: user.id,
              email: user.email,
              name: profile.name || user.user_metadata?.full_name || "Pelamar",
              role: profile.role,
            });
          }
        }
      } catch {
        // Lewati jika pemeriksaan sesi gagal sementara
      } finally {
        setIsLoadingSession(false);
      }
    }

    checkCurrentSession();
  }, [router]);

  const handleSwitchToCompany = async () => {
    setServerError(null);
    setIsSwitching(true);
    try {
      const res = await switchToCompanyAction();
      if (!res.success) {
        setServerError(
          res.error ||
            t(
              "Gagal mengalihkan akun ke mitra perusahaan. Silakan jalankan script SQL register_as_company di Supabase.",
              "Failed to convert account to employer partner. Please ensure the register_as_company SQL function is enabled in Supabase."
            )
        );
        setIsSwitching(false);
        return;
      }

      router.refresh();
      router.push("/mitra/profil-perusahaan?onboarding=true");
    } catch {
      setServerError(
        t(
          "Terjadi kendala saat mengalihkan akun. Silakan coba kembali.",
          "An error occurred while converting your account. Please try again."
        )
      );
      setIsSwitching(false);
    }
  };

  const handleLogoutAndRegister = async () => {
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
      setCurrentUser(null);
      router.refresh();
    } catch {
      router.push("/auth/logout");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);

    const validationResult = companyRegisterSchema.safeParse({
      picName,
      companyName,
      email,
      phone,
      password,
      confirmPassword,
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
            name: validationResult.data.picName,
            company_name: validationResult.data.companyName,
            phone: validationResult.data.phone,
            role: peranToRole("perusahaan"),
            is_registered: true,
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
            "Email ini sudah terdaftar. Silakan gunakan email kantor lain atau masuk ke portal mitra."
          );
        } else {
          setServerError(
            error.message || "Pendaftaran mitra gagal. Silakan coba beberapa saat lagi."
          );
        }
        setIsSubmitting(false);
        return;
      }

      // Jika sesi langsung terbentuk
      if (data.session) {
        router.refresh();
        router.push("/mitra/profil-perusahaan?onboarding=true");
        return;
      }

      setIsSuccess(true);
      setIsSubmitting(false);
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : "Terjadi gangguan koneksi saat mendaftarkan perusahaan. Silakan coba lagi.";
      setServerError(message);
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="w-full max-w-md mx-auto">
        <div className="bg-white rounded-[32px] sm:rounded-[40px] border border-black/[0.08] shadow-card p-8 sm:p-10 text-center">
          <div className="w-14 h-14 rounded-2xl bg-[#FFDD00] text-black mx-auto flex items-center justify-center mb-5 shadow-2xs">
            <CheckCircle2 className="w-7 h-7" aria-hidden="true" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-black tracking-tight">
            {t("Pendaftaran Mitra Berhasil!")}
          </h2>
          <p className="text-sm text-slate-600 mt-2.5 leading-relaxed font-medium">
            {language === "en" ? (
              <>
                Your company account was registered for{" "}
                <span className="font-bold text-black">{companyName}</span>.
                Please check the inbox of{" "}
                <span className="font-bold text-black">{email}</span> to confirm
                your company account before signing in.
              </>
            ) : (
              <>
                Akun perusahaan berhasil didaftarkan untuk{" "}
                <span className="font-bold text-black">{companyName}</span>.
                Silakan periksa kotak masuk email resmi{" "}
                <span className="font-bold text-black">{email}</span> untuk
                mengonfirmasi akun mitra Anda.
              </>
            )}
          </p>
          <div className="mt-8">
            <Link
              href="/login?peran=perusahaan"
              className="inline-flex items-center justify-center w-full px-6 py-3.5 rounded-full bg-[#FFDD00] hover:bg-[#F5D500] text-black font-black text-sm transition-all shadow-2xs min-h-[44px]"
            >
              {t("Menuju Portal Masuk Mitra")}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Jika terdeteksi pengguna sedang masuk dengan akun pencari kerja
  if (!isLoadingSession && currentUser && currentUser.role === "user") {
    return (
      <div className="w-full max-w-md mx-auto">
        <div className="bg-white rounded-[32px] sm:rounded-[40px] border border-black/[0.08] shadow-card p-8 sm:p-10 text-center">
          <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-900 mx-auto flex items-center justify-center mb-5 shadow-2xs border border-amber-200">
            <Building2 className="w-7 h-7" aria-hidden="true" />
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-semibold mb-3">
            <span>{t("Akun Aktif Terdeteksi", "Active Account Detected")}</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black text-navy-950 tracking-tight">
            {t("Daftarkan Akun sebagai Mitra", "Register Account as Partner")}
          </h2>

          <div className="mt-4 p-4 rounded-2xl bg-slate-50 border border-slate-200/80 text-left space-y-1">
            <p className="text-xs text-slate-500 font-medium">
              {t("Akun Anda saat ini:", "Your current account:")}
            </p>
            <p className="text-sm font-bold text-navy-950 truncate">
              {currentUser.name}
            </p>
            <p className="text-xs text-slate-600 truncate">
              {currentUser.email}
            </p>
            <div className="pt-1.5">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-800 text-[11px] font-semibold border border-blue-200">
                {t("Status: Akun Pencari Kerja", "Status: Job Seeker Account")}
              </span>
            </div>
          </div>

          <p className="text-sm text-slate-600 mt-4 leading-relaxed font-normal">
            {t(
              "Akun Google ini sedang tercatat sebagai Pencari Kerja. Untuk memasang lowongan kerja, Anda dapat mengalihkan akun ini langsung menjadi Mitra Perusahaan, atau keluar untuk mendaftar akun kantor baru.",
              "This Google account is currently registered as a Job Seeker. To publish jobs, you can convert this account directly to an Employer Partner, or sign out to register with another work email."
            )}
          </p>

          {serverError && (
            <div
              role="alert"
              className="mt-4 p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs sm:text-sm text-left flex items-start gap-2.5 font-medium"
            >
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-600" aria-hidden="true" />
              <span className="leading-snug">{serverError}</span>
            </div>
          )}

          <div className="mt-6 space-y-3">
            <button
              type="button"
              onClick={handleSwitchToCompany}
              disabled={isSwitching}
              className="w-full py-3.5 px-6 rounded-full bg-[#FFDD00] hover:bg-[#F5D500] text-black font-black text-sm transition-all shadow-2xs min-h-[48px] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isSwitching ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-black" aria-hidden="true" />
                  <span>{t("Memproses Alih Peran...", "Converting Role...")}</span>
                </>
              ) : (
                <>
                  <Building2 className="w-4 h-4 text-black" aria-hidden="true" />
                  <span>
                    {t(
                      "Jadikan Akun Ini sebagai Mitra Perusahaan",
                      "Convert This Account to Employer Partner"
                    )}
                  </span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleLogoutAndRegister}
              className="w-full py-3.5 px-6 rounded-full bg-white hover:bg-slate-50 border border-black/[0.12] text-slate-800 font-bold text-sm transition-all shadow-2xs min-h-[48px] flex items-center justify-center gap-2 cursor-pointer"
            >
              <LogOut className="w-4 h-4 text-slate-600" aria-hidden="true" />
              <span>
                {t(
                  "Keluar & Buat Akun dengan Email Lain",
                  "Sign Out & Register with Other Email"
                )}
              </span>
            </button>

            <div className="pt-2">
              <Link
                href="/"
                className="text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
              >
                {t("Kembali ke Beranda", "Back to Home")}
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-xl mx-auto">
      <div className="bg-white rounded-[32px] sm:rounded-[40px] border border-black/[0.08] shadow-card p-6 sm:p-10">
        {/* Header Form Perusahaan */}
        <div className="mb-6 text-center space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-black text-[#FFDD00] text-xs font-bold shadow-2xs">
            <Building2 className="w-3.5 h-3.5 text-[#FFDD00]" aria-hidden="true" />
            <span>{t("Portal Perusahaan Mitra", "Employer Portal")}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-black tracking-tight pt-1">
            {t("Daftarkan Akun Perusahaan", "Register Company Account")}
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal max-w-md mx-auto">
            {t(
              "Publikasikan lowongan kerja resmi dan temukan talenta terverifikasi langsung tanpa calo atau perantara.",
              "Publish official verified jobs and hire top talent directly with zero intermediaries."
            )}
          </p>
        </div>

        {/* Indikator Alur 3 Langkah Sesuai Standar Loker.id */}
        <div className="mb-6 p-3.5 rounded-2xl bg-[#FAF8F0] border border-black/[0.06] flex items-center justify-between gap-2 text-[11px] font-bold text-slate-600">
          <div className="flex items-center gap-1.5 text-black">
            <span className="w-5 h-5 rounded-full bg-[#FFDD00] text-black flex items-center justify-center text-[10px] font-black shrink-0">
              1
            </span>
            <span>{t("Daftar Akun", "Create Account")}</span>
          </div>
          <span className="text-slate-300">→</span>
          <div className="flex items-center gap-1.5 text-slate-500">
            <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center text-[10px] font-bold shrink-0">
              2
            </span>
            <span>{t("Lengkapi Profil", "Complete Profile")}</span>
          </div>
          <span className="text-slate-300">→</span>
          <div className="flex items-center gap-1.5 text-slate-500">
            <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center text-[10px] font-bold shrink-0">
              3
            </span>
            <span>{t("Pasang Loker", "Post Job")}</span>
          </div>
        </div>

        {serverError && (
          <div
            role="alert"
            className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs sm:text-sm flex items-start gap-2.5 mb-5 font-medium"
          >
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-600" aria-hidden="true" />
            <span className="leading-snug">{serverError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Input Nama PIC / HRD */}
            <Input
              id="company-pic-name"
              label={t("Nama Penanggung Jawab / HRD", "HR / Contact Person Name")}
              required
              type="text"
              autoComplete="name"
              placeholder={
                language === "en" ? "e.g. John Doe (HR Manager)" : "Contoh: Budi Santoso"
              }
              leftIcon={<User className="w-4 h-4 text-slate-400" />}
              value={picName}
              onChange={(e) => {
                const val = e.target.value;
                setPicName(val);
                if (hasProfanity(val)) {
                  setErrors((prev) => ({
                    ...prev,
                    picName: t(
                      "Nama mengandung kata yang tidak pantas. Harap gunakan nama asli yang sopan.",
                      "Name contains inappropriate words."
                    ),
                  }));
                } else if (errors.picName) {
                  setErrors((prev) => ({ ...prev, picName: "" }));
                }
              }}
              error={errors.picName}
              className="rounded-2xl bg-[#FAF8F0] border-black/[0.08] focus:border-black focus:bg-white text-sm py-2.5 font-medium transition-all"
            />

            {/* Input Nama Resmi Perusahaan */}
            <Input
              id="company-name"
              label={t("Nama Resmi Perusahaan / PT", "Official Company Name")}
              required
              type="text"
              autoComplete="organization"
              placeholder={
                language === "en" ? "e.g. PT Acme Indonesia" : "Contoh: PT Teknologi Bangsa"
              }
              leftIcon={<Building2 className="w-4 h-4 text-slate-400" />}
              value={companyName}
              onChange={(e) => {
                const val = e.target.value;
                setCompanyName(val);
                if (hasProfanity(val)) {
                  setErrors((prev) => ({
                    ...prev,
                    companyName: t(
                      "Nama mengandung kata yang tidak pantas. Harap gunakan nama resmi perusahaan yang sopan.",
                      "Company name contains inappropriate words."
                    ),
                  }));
                } else if (errors.companyName) {
                  setErrors((prev) => ({ ...prev, companyName: "" }));
                }
              }}
              error={errors.companyName}
              className="rounded-2xl bg-[#FAF8F0] border-black/[0.08] focus:border-black focus:bg-white text-sm py-2.5 font-medium transition-all"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Input Alamat Email Kantor */}
            <Input
              id="company-email"
              label={t("Alamat Email Kantor / HRD", "Work / HR Email Address")}
              required
              type="email"
              autoComplete="email"
              placeholder={
                language === "en" ? "e.g. hr@company.com" : "Contoh: hrd@perusahaan.co.id"
              }
              leftIcon={<Mail className="w-4 h-4 text-slate-400" />}
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (errors.email) setErrors((prev) => ({ ...prev, email: "" }));
              }}
              error={errors.email}
              className="rounded-2xl bg-[#FAF8F0] border-black/[0.08] focus:border-black focus:bg-white text-sm py-2.5 font-medium transition-all"
            />

            {/* Input Nomor Telepon / WhatsApp HR */}
            <Input
              id="company-phone"
              label={t("Nomor Telepon / WhatsApp HR", "HR Phone / WhatsApp Number")}
              required
              type="tel"
              autoComplete="tel"
              placeholder={
                language === "en" ? "e.g. 081234567890" : "Contoh: 081234567890"
              }
              leftIcon={<Phone className="w-4 h-4 text-slate-400" />}
              value={phone}
              onChange={(e) => {
                setPhone(e.target.value);
                if (errors.phone) setErrors((prev) => ({ ...prev, phone: "" }));
              }}
              error={errors.phone}
              className="rounded-2xl bg-[#FAF8F0] border-black/[0.08] focus:border-black focus:bg-white text-sm py-2.5 font-medium transition-all"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Input Kata Sandi */}
            <Input
              id="company-password"
              label={t("Kata Sandi", "Password")}
              required
              type="password"
              autoComplete="new-password"
              placeholder="••••••••"
              helperText={t("Minimal 8 karakter", "Minimum 8 characters")}
              leftIcon={<Lock className="w-4 h-4 text-slate-400" />}
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (errors.password)
                  setErrors((prev) => ({ ...prev, password: "" }));
              }}
              error={errors.password}
              className="rounded-2xl bg-[#FAF8F0] border-black/[0.08] focus:border-black focus:bg-white text-sm py-2.5 font-medium transition-all"
            />

            {/* Input Konfirmasi Kata Sandi */}
            <Input
              id="company-confirm-password"
              label={t("Konfirmasi Kata Sandi", "Confirm Password")}
              required
              type="password"
              autoComplete="new-password"
              placeholder="••••••••"
              helperText={t("Ulangi kata sandi", "Repeat password")}
              leftIcon={<Lock className="w-4 h-4 text-slate-400" />}
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                if (errors.confirmPassword)
                  setErrors((prev) => ({ ...prev, confirmPassword: "" }));
              }}
              error={errors.confirmPassword}
              className="rounded-2xl bg-[#FAF8F0] border-black/[0.08] focus:border-black focus:bg-white text-sm py-2.5 font-medium transition-all"
            />
          </div>

          {/* Kotak Info Verifikasi Resmi */}
          <div className="p-3.5 rounded-2xl bg-[#FAF8F0] border border-black/[0.06] flex items-start gap-2.5 text-xs text-slate-600 leading-relaxed font-normal">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" aria-hidden="true" />
            <span>
              {t(
                "Setelah akun dibuat, Anda akan langsung diarahkan untuk melengkapi logo resmi, domisili kantor, industri, dan website sebelum memasang lowongan.",
                "After registration, you will be redirected to complete your official logo, office domicile, industry, and website before posting jobs."
              )}
            </span>
          </div>

          {/* Tombol Submit Pendaftaran Perusahaan */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full inline-flex items-center justify-center gap-2 py-3.5 px-6 rounded-full bg-black hover:bg-slate-900 active:scale-98 text-white font-black text-sm transition-all shadow-2xs hover:shadow disabled:opacity-50 min-h-[48px] cursor-pointer"
            >
              <span>
                {isSubmitting
                  ? t("Mendaftarkan Akun Perusahaan...", "Registering Company...")
                  : t("Daftar Akun Perusahaan & Lengkapi Profil", "Register Company & Complete Profile")}
              </span>
              <ArrowRight className="w-4 h-4 stroke-[2.5] text-[#FFDD00]" aria-hidden="true" />
            </button>
          </div>
        </form>

        {/* Tautan Alternatif */}
        <div className="mt-8 pt-6 border-t border-black/[0.06] space-y-3 text-center">
          <p className="text-xs sm:text-sm text-slate-600 font-medium">
            {t("Sudah memiliki akun mitra?", "Already have an employer account?")}{" "}
            <Link
              href="/login?peran=perusahaan"
              className="font-bold text-black hover:underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-black rounded-xs"
            >
              {t("Masuk ke Portal Mitra", "Sign in to Employer Portal")}
            </Link>
          </p>

          <div className="pt-2">
            <Link
              href="/register"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-black hover:underline py-1"
            >
              <User className="w-3.5 h-3.5 text-slate-500" aria-hidden="true" />
              <span>{t("Bukan perusahaan? Daftar sebagai Pencari Kerja →", "Not a company? Register as Job Seeker →")}</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

