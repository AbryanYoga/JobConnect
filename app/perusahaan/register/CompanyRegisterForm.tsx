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
import { registerSchema, peranToRole } from "@/lib/validation/auth";
import { fieldErrors } from "@/lib/validation/helpers";
import { hasProfanity } from "@/lib/validation/profanity";
import { useLanguage } from "@/lib/i18n";
import { switchToCompanyAction } from "@/app/actions/mitra";

export function CompanyRegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const authError = searchParams.get("error");
  const { t, language } = useLanguage();

  const [companyName, setCompanyName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleSubmitting, setIsGoogleSubmitting] = useState(false);
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

  const handleGoogleRegister = async () => {
    setServerError(null);
    setIsGoogleSubmitting(true);
    try {
      const supabase = createClient();
      const callbackUrl = `${window.location.origin}/auth/callback?flow=register&peran=perusahaan&next=${encodeURIComponent(
        "/mitra/profil-perusahaan?onboarding=true"
      )}`;

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

    const validationResult = registerSchema.safeParse({
      name: companyName,
      email,
      password,
      confirmPassword,
      peran: "perusahaan",
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
    <div className="w-full max-w-md mx-auto">
      <div className="bg-white rounded-[32px] sm:rounded-[40px] border border-black/[0.08] shadow-card p-8 sm:p-10">
        {/* Header Form Perusahaan */}
        <div className="mb-6 text-center space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-black text-[#FFDD00] text-xs font-bold shadow-2xs">
            <Building2 className="w-3.5 h-3.5 text-[#FFDD00]" aria-hidden="true" />
            <span>{t("Portal Perusahaan Mitra", "Employer Portal")}</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-black tracking-tight pt-1">
            {t("Daftarkan Perusahaan")}
          </h1>
          <p className="text-sm text-slate-600 leading-relaxed font-normal">
            {t(
              "Publikasikan lowongan kerja resmi dan rekrut talenta terverifikasi tanpa calo.",
              "Publish verified job listings and recruit top talent without third-party brokers."
            )}
          </p>
        </div>

        {/* Peringatan jika otentikasi Google memerlukan pendaftaran resmi */}
        {authError === "google_role_conflict" && (
          <div
            role="alert"
            className="p-4 rounded-2xl bg-amber-50 border border-amber-300 text-amber-950 flex items-start gap-3 text-xs sm:text-sm font-medium mb-5"
          >
            <AlertCircle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" aria-hidden="true" />
            <div className="space-y-1">
              <p className="font-bold text-amber-950">
                {t("Pendaftaran Memerlukan Formulir Resmi Perusahaan", "Official Company Form Required")}
              </p>
              <p className="text-amber-900 leading-relaxed text-xs sm:text-sm">
                {t(
                  "Akun Google ini terdaftar sebagai Pencari Kerja atau sistem memerlukan verifikasi identitas instansi. Silakan gunakan formulir pendaftaran Nama Perusahaan, Email Kantor, dan Kata Sandi di bawah untuk langsung mengaktifkan akun Mitra Anda.",
                  "This Google account is registered as a Job Seeker or verification is required. Please use the Company Name, Work Email, and Password form below to activate your Employer account."
                )}
              </p>
            </div>
          </div>
        )}

        {authError === "oauth_failed" && (
          <div
            role="alert"
            className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-start gap-2.5 mb-5 font-medium"
          >
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-600" aria-hidden="true" />
            <span className="leading-snug">
              {t("Gagal menghubungkan ke akun Google. Silakan gunakan formulir pendaftaran email resmi di bawah.")}
            </span>
          </div>
        )}

        {serverError && (
          <div
            role="alert"
            className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-start gap-2.5 mb-5 font-medium"
          >
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-600" aria-hidden="true" />
            <span className="leading-snug">{serverError}</span>
          </div>
        )}

        {/* Tombol Daftar Cepat dengan Google (Akun HR / Kantor) */}
        <div>
          <button
            type="button"
            onClick={handleGoogleRegister}
            disabled={isSubmitting || isGoogleSubmitting}
            className="w-full py-3.5 px-6 rounded-full bg-white hover:bg-slate-50 active:scale-98 border border-black/[0.12] text-black font-bold text-sm transition-all shadow-2xs hover:shadow flex items-center justify-center gap-3 min-h-[48px] disabled:opacity-50 cursor-pointer"
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
                ? t("Menghubungkan ke Google...")
                : t("Daftar Cepat dengan Google (Akun Kantor)")}
            </span>
          </button>
          <p className="text-[11px] text-slate-500 text-center mt-2 font-normal">
            {t("Khusus akun Google kantor atau email baru yang belum terdaftar sebagai pelamar.")}
          </p>
        </div>

        {/* Pemisah Pilihan Pendaftaran */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-black/[0.08]" />
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="bg-white px-3 text-slate-500 font-medium">
              {t("atau daftar resmi dengan email kantor (direkomendasikan)")}
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          {/* Input Nama Perusahaan */}
          <Input
            id="company-name"
            label={t("Nama Perusahaan / Instansi")}
            required
            type="text"
            autoComplete="organization"
            placeholder={
              language === "en" ? "e.g. Acme Corporation" : "Contoh: PT Teknologi Bangsa"
            }
            leftIcon={<Building2 className="w-4 h-4 text-slate-400" />}
            value={companyName}
            onChange={(e) => {
              const val = e.target.value;
              setCompanyName(val);
              if (hasProfanity(val)) {
                setErrors((prev) => ({
                  ...prev,
                  name: t(
                    "Nama mengandung kata yang tidak pantas. Harap gunakan nama resmi perusahaan yang sopan.",
                    "Name contains inappropriate words. Please use a respectful, official name."
                  ),
                }));
              } else if (errors.name) {
                setErrors((prev) => ({ ...prev, name: "" }));
              }
            }}
            error={errors.name}
            className="rounded-2xl bg-[#FAF8F0] border-black/[0.08] focus:border-black focus:bg-white text-sm py-3 font-medium transition-all"
          />

          {/* Input Alamat Email Kantor */}
          <Input
            id="company-email"
            label={t("Alamat Email Kantor / HR")}
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
            className="rounded-2xl bg-[#FAF8F0] border-black/[0.08] focus:border-black focus:bg-white text-sm py-3 font-medium transition-all"
          />

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
            className="rounded-2xl bg-[#FAF8F0] border-black/[0.08] focus:border-black focus:bg-white text-sm py-3 font-medium transition-all"
          />

          {/* Input Konfirmasi Kata Sandi */}
          <Input
            id="company-confirm-password"
            label={t("Konfirmasi Kata Sandi", "Confirm Password")}
            required
            type="password"
            autoComplete="new-password"
            placeholder="••••••••"
            helperText={t("Ulangi kata sandi yang sama", "Repeat the same password")}
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

          {/* Kotak Info Verifikasi Resmi */}
          <div className="p-3.5 rounded-2xl bg-[#FAF8F0] border border-black/[0.06] flex items-start gap-2.5 text-xs text-slate-600 leading-relaxed font-normal">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" aria-hidden="true" />
            <span>
              {t(
                "Setelah akun dibuat, Anda dapat melengkapi alamat operasional dan mengunggah logo resmi sebelum memasang lowongan.",
                "After your account is created, you can complete your operational address and upload your official logo before posting jobs."
              )}
            </span>
          </div>

          {/* Tombol Submit Pendaftaran Perusahaan */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting || isGoogleSubmitting}
              className="w-full inline-flex items-center justify-center gap-2 py-3.5 px-6 rounded-full bg-black hover:bg-slate-900 active:scale-98 text-white font-black text-sm transition-all shadow-2xs hover:shadow disabled:opacity-50 min-h-[48px] cursor-pointer"
            >
              <span>
                {isSubmitting
                  ? t("Mendaftarkan Perusahaan...", "Registering Company...")
                  : t("Daftarkan Akun Perusahaan", "Register Company Account")}
              </span>
              <ArrowRight className="w-4 h-4 stroke-[2.5] text-[#FFDD00]" aria-hidden="true" />
            </button>
          </div>
        </form>

        {/* Tautan Alternatif */}
        <div className="mt-8 pt-6 border-t border-black/[0.06] space-y-3 text-center">
          <p className="text-sm text-slate-600 font-medium">
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

