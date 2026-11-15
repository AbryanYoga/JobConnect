"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  User,
  Mail,
  Lock,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  Building2,
  RefreshCw,
  Loader2,
} from "lucide-react";
import { Input } from "@/components/ui/Input";
import { createClient } from "@/lib/supabase/client";
import { registerSchema, peranToRole } from "@/lib/validation/auth";
import { fieldErrors } from "@/lib/validation/helpers";
import { hasProfanity } from "@/lib/validation/profanity";
import { useLanguage } from "@/lib/i18n";

export function RegisterForm() {
  const searchParams = useSearchParams();
  const { t, language } = useLanguage();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleSubmitting, setIsGoogleSubmitting] = useState(false);

  // Status dan state verifikasi kode OTP
  const [showOtp, setShowOtp] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [otpError, setOtpError] = useState<string | null>(null);
  const [otpSuccess, setOtpSuccess] = useState<string | null>(null);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [isResendingOtp, setIsResendingOtp] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(60);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (showOtp && resendCountdown > 0) {
      timer = setInterval(() => {
        setResendCountdown((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [showOtp, resendCountdown]);

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setOtpError(null);
    setOtpSuccess(null);

    const trimmed = otpCode.trim();
    if (trimmed.length !== 6 || !/^\d{6}$/.test(trimmed)) {
      setOtpError(
        t(
          "Kode OTP harus terdiri dari 6 digit angka.",
          "OTP code must be 6 digits."
        )
      );
      return;
    }

    setIsVerifyingOtp(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.verifyOtp({
        email,
        token: trimmed,
        type: "signup",
      });

      if (error) {
        const lower = error.message.toLowerCase();
        if (lower.includes("expired")) {
          setOtpError(
            t(
              "Kode OTP sudah kedaluwarsa. Silakan klik kirim ulang kode.",
              "OTP code has expired. Please request a new one."
            )
          );
        } else {
          setOtpError(
            t(
              "Kode verifikasi salah atau tidak valid. Silakan periksa kembali email Anda.",
              "Invalid verification code. Please check your email."
            )
          );
        }
        setIsVerifyingOtp(false);
        return;
      }

      // Berhasil diverifikasi, arahkan ke onboarding biodata
      // eslint-disable-next-line @next/next/no-location-assign-relative-destination
      window.location.href = "/profil?onboarding=true";
    } catch {
      setOtpError(
        t(
          "Terjadi kendala saat memverifikasi kode. Silakan coba lagi.",
          "An error occurred while verifying OTP. Please try again."
        )
      );
      setIsVerifyingOtp(false);
    }
  };

  const handleResendOtp = async () => {
    if (resendCountdown > 0 || isResendingOtp) return;
    setOtpError(null);
    setOtpSuccess(null);
    setIsResendingOtp(true);

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.resend({
        type: "signup",
        email,
      });

      if (error) {
        setOtpError(
          error.message ||
            t("Gagal mengirim ulang kode OTP.", "Failed to resend OTP.")
        );
      } else {
        setResendCountdown(60);
        setOtpSuccess(
          t(
            "Kode OTP baru telah berhasil dikirim ke alamat email Anda.",
            "New OTP code has been sent to your email."
          )
        );
      }
    } catch {
      setOtpError(
        t("Terjadi kendala saat menghubungi server.", "Network error occurred.")
      );
    } finally {
      setIsResendingOtp(false);
    }
  };

  const handleGoogleRegister = async () => {
    setServerError(null);
    setIsGoogleSubmitting(true);
    try {
      const supabase = createClient();
      const callbackUrl = `${window.location.origin}/auth/callback?flow=register&peran=pelamar&next=${encodeURIComponent(
        "/profil?onboarding=true"
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
      name,
      email,
      password,
      confirmPassword,
      peran: "pelamar",
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
            role: peranToRole("pelamar"),
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

      // Deteksi jika email sudah terdaftar sebelumnya (User Enumeration Protection)
      if (
        data.user &&
        Array.isArray(data.user.identities) &&
        data.user.identities.length === 0
      ) {
        setServerError(
          "Email ini sudah terdaftar sebelumnya di JobConnect (misalnya lewat Akun Google). Silakan gunakan tombol Masuk dengan Google atau masuk ke akun Anda."
        );
        setIsSubmitting(false);
        return;
      }

      // Jika sesi langsung terbentuk (tanpa verifikasi email)
      if (data.session) {
        // Alihkan langsung ke onboarding pengisian biodata
        // eslint-disable-next-line @next/next/no-location-assign-relative-destination
        window.location.href = "/profil?onboarding=true";
        return;
      }

      // Tampilkan form verifikasi kode OTP
      setShowOtp(true);
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

  if (showOtp) {
    return (
      <div className="w-full max-w-md mx-auto">
        <div className="bg-white rounded-[32px] sm:rounded-[40px] border border-black/[0.08] shadow-card p-8 sm:p-10 text-center">
          <div className="w-14 h-14 rounded-2xl bg-[#FFDD00] text-black mx-auto flex items-center justify-center mb-5 shadow-2xs">
            <Mail className="w-7 h-7" aria-hidden="true" />
          </div>

          <div className="space-y-2 mb-6">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-semibold">
              <ShieldCheck className="w-3.5 h-3.5 text-slate-500" aria-hidden="true" />
              <span>{t("Verifikasi Akun Email", "Email Verification")}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-black tracking-tight">
              {t("Cek Email Gmail Anda", "Check Your Gmail Inbox")}
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
              {t(
                "Kami telah mengirimkan tautan konfirmasi pendaftaran resmi ke:",
                "We sent an official registration confirmation link to:"
              )}{" "}
              <span className="font-bold text-black block mt-0.5">{email}</span>
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-[#FAF8F0] border border-black/[0.08] text-left text-xs text-slate-700 leading-relaxed mb-6 space-y-2 font-medium">
            <p className="font-bold text-black flex items-center gap-1.5">
              <span className="w-4 h-4 rounded-full bg-[#FFDD00] text-black text-[10px] font-black inline-flex items-center justify-center">
                ✓
              </span>
              <span>{t("Langkah Konfirmasi:", "Confirmation Steps:")}</span>
            </p>
            <ol className="list-decimal list-inside space-y-1 pl-1 text-slate-600 font-normal">
              <li>
                {t(
                  "Buka aplikasi Gmail Anda (cek Kotak Masuk atau folder Spam).",
                  "Open your Gmail app (check Inbox or Spam folder)."
                )}
              </li>
              <li>
                {t(
                  "Buka email dari JobConnect berjudul 'Confirm your email address'.",
                  "Open email from JobConnect titled 'Confirm your email address'."
                )}
              </li>
              <li>
                {t(
                  "Klik tombol biru 'Confirm email address' di dalam email.",
                  "Click the blue 'Confirm email address' button inside the email."
                )}
              </li>
            </ol>
          </div>

          {otpError && (
            <div
              role="alert"
              className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs sm:text-sm flex items-start gap-2.5 mb-5 font-medium text-left"
            >
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-600" aria-hidden="true" />
              <span className="leading-snug">{otpError}</span>
            </div>
          )}

          {otpSuccess && (
            <div
              role="status"
              className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm flex items-start gap-2.5 mb-5 font-medium text-left"
            >
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" aria-hidden="true" />
              <span className="leading-snug">{otpSuccess}</span>
            </div>
          )}

          <div className="space-y-3">
            <a
              href="https://mail.google.com"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3.5 px-6 rounded-full bg-black hover:bg-slate-900 active:scale-98 text-white font-black text-sm transition-all shadow-2xs hover:shadow flex items-center justify-center gap-2 min-h-[48px] cursor-pointer"
            >
              <Mail className="w-4 h-4 text-[#FFDD00]" aria-hidden="true" />
              <span>{t("Buka Gmail Langsung", "Open Gmail Directly")}</span>
              <ArrowRight className="w-4 h-4 stroke-[2.5] text-slate-400" aria-hidden="true" />
            </a>

            <Link
              href="/login"
              className="w-full py-3 px-6 rounded-full bg-white hover:bg-slate-50 border border-black/[0.12] text-black font-bold text-sm transition-all shadow-2xs flex items-center justify-center gap-2 min-h-[44px]"
            >
              <span>{t("Sudah Konfirmasi? Masuk ke Akun", "Already Confirmed? Sign In")}</span>
            </Link>
          </div>

          {/* Opsi alternatif jika menerima 6 digit kode OTP */}
          <div className="mt-6 pt-5 border-t border-black/[0.06] text-left">
            <details className="text-xs text-slate-600 group">
              <summary className="font-bold text-slate-700 hover:text-black cursor-pointer select-none">
                {t(
                  "Punya 6 digit kode OTP? Masukkan di sini",
                  "Have a 6-digit OTP code? Enter here"
                )}
              </summary>
              <form onSubmit={handleVerifyOtp} className="mt-3 space-y-3 pt-2">
                <input
                  id="otp-input"
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={6}
                  value={otpCode}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, "");
                    setOtpCode(val);
                    if (otpError) setOtpError(null);
                  }}
                  placeholder="••••••"
                  className="w-full text-center text-xl tracking-[0.3em] font-black py-2.5 px-4 rounded-xl bg-[#FAF8F0] border border-black/[0.12] focus:border-black focus:bg-white focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={isVerifyingOtp || otpCode.trim().length !== 6}
                  className="w-full py-2.5 px-4 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-black disabled:opacity-50 flex items-center justify-center gap-1.5"
                >
                  {isVerifyingOtp ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <span>{t("Verifikasi Kode OTP", "Verify OTP")}</span>
                  )}
                </button>
              </form>
            </details>
          </div>

          <div className="mt-5 pt-4 border-t border-black/[0.06] text-center space-y-2.5">
            <div className="text-xs text-slate-600 font-medium">
              {t("Tidak menerima email?", "Didn't receive email?")}{" "}
              <button
                type="button"
                onClick={handleResendOtp}
                disabled={resendCountdown > 0 || isResendingOtp}
                className="font-bold text-black hover:underline disabled:opacity-50 disabled:no-underline cursor-pointer inline-flex items-center gap-1"
              >
                {isResendingOtp && <RefreshCw className="w-3 h-3 animate-spin" />}
                {resendCountdown > 0
                  ? `${t("Kirim ulang dalam", "Resend in")} ${resendCountdown}s`
                  : t("Kirim Ulang Email Konfirmasi", "Resend Confirmation Email")}
              </button>
            </div>

            <div>
              <button
                type="button"
                onClick={() => {
                  setShowOtp(false);
                  setOtpCode("");
                  setOtpError(null);
                  setOtpSuccess(null);
                }}
                className="text-xs font-semibold text-slate-500 hover:text-black transition-colors"
              >
                ← {t("Ganti alamat email pendaftaran", "Change registration email")}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Header Kartu Pendaftaran */}
      <div className="bg-white rounded-[32px] sm:rounded-[40px] border border-black/[0.08] shadow-card p-8 sm:p-10">
        <div className="mb-6 text-center space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#FFDD00] text-black text-xs font-bold border border-black/10 shadow-2xs">
            <ShieldCheck className="w-3.5 h-3.5 text-black" aria-hidden="true" />
            <span>{t("Pencari Kerja Terverifikasi", "Job Seeker Account")}</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-black tracking-tight pt-1">
            {t("Daftar Akun Baru")}
          </h1>
          <p className="text-sm text-slate-600 leading-relaxed font-normal">
            {t(
              "Mulai langkah karier impian Anda dengan mengakses ribuan lowongan kerja resmi di 38 provinsi.",
              "Start your dream career by accessing thousands of official verified jobs across 38 provinces."
            )}
          </p>
        </div>

        {/* Peringatan jika sebelumnya mencoba masuk dengan Google tanpa registrasi */}
        {searchParams.get("error") === "not_registered" && (
          <div
            role="alert"
            className="p-4 rounded-2xl bg-amber-50 border border-amber-300 text-amber-950 flex items-start gap-3 text-xs sm:text-sm font-medium mb-5"
          >
            <AlertCircle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" aria-hidden="true" />
            <div className="space-y-1">
              <p className="font-bold text-amber-950">
                {t("Akun Google Anda Belum Terdaftar", "Google Account Not Registered")}
              </p>
              <p className="text-amber-900 leading-relaxed text-xs sm:text-sm">
                {t(
                  "Email Google Anda belum terdaftar di JobConnect. Silakan klik tombol Google di bawah ini untuk menyelesaikan pendaftaran akun Anda.",
                  "Your Google email is not yet registered on JobConnect. Please click the Google button below to complete your registration."
                )}
              </p>
            </div>
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

        {/* Tombol Cepat Daftar dengan Google */}
        <button
          type="button"
          onClick={handleGoogleRegister}
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
              : t("Daftar Cepat dengan Google", "Quick Sign Up with Google")}
          </span>
        </button>

        {/* Pemisah atau Daftar dengan Email */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-black/[0.08]" />
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="bg-white px-3 text-slate-500 font-medium">
              {t("atau daftar dengan email", "or sign up with email")}
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          {/* Input Nama Lengkap */}
          <Input
            id="register-name"
            label={t("Nama Lengkap")}
            required
            type="text"
            autoComplete="name"
            placeholder={
              language === "en" ? "e.g. Alex Pratama" : "Contoh: Nama Lengkap Anda"
            }
            leftIcon={<User className="w-4 h-4 text-slate-400" />}
            value={name}
            onChange={(e) => {
              const val = e.target.value;
              setName(val);
              if (hasProfanity(val)) {
                setErrors((prev) => ({
                  ...prev,
                  name: t(
                    "Nama mengandung kata yang tidak pantas. Harap gunakan nama asli yang sopan.",
                    "Name contains inappropriate words. Please use a respectful, real name."
                  ),
                }));
              } else if (errors.name) {
                setErrors((prev) => ({ ...prev, name: "" }));
              }
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
            placeholder={
              language === "en" ? "e.g. name@example.com" : "Contoh: nama@email.com"
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
            id="register-password"
            label={t("Kata Sandi")}
            required
            type="password"
            autoComplete="new-password"
            placeholder="••••••••"
            helperText={t("Minimal 8 karakter")}
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

          {/* Tombol Submit Pendaftaran */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting || isGoogleSubmitting}
              className="w-full inline-flex items-center justify-center gap-2 py-3.5 px-6 rounded-full bg-[#FFDD00] hover:bg-[#F5D500] active:scale-98 text-black font-black text-sm transition-all shadow-2xs hover:shadow disabled:opacity-50 min-h-[48px] cursor-pointer"
            >
              <span>
                {isSubmitting
                  ? t("Memproses Pendaftaran...", "Processing Registration...")
                  : t("Daftar sebagai Pencari Kerja", "Sign Up as Job Seeker")}
              </span>
              <ArrowRight className="w-4 h-4 stroke-[2.5]" aria-hidden="true" />
            </button>
          </div>
        </form>

        {/* Tautan Alternatif Khusus Perusahaan & Sudah Punya Akun */}
        <div className="mt-8 pt-6 border-t border-black/[0.06] space-y-3 text-center">
          <p className="text-sm text-slate-600 font-medium">
            {t("Sudah memiliki akun JobConnect?", "Already have a JobConnect account?")}{" "}
            <Link
              href="/login"
              className="font-bold text-black hover:underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-black rounded-xs"
            >
              {t("Masuk di sini", "Sign in here")}
            </Link>
          </p>

          <div className="pt-2">
            <Link
              href="/perusahaan/register"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-black hover:underline py-1"
            >
              <Building2 className="w-3.5 h-3.5 text-slate-500" aria-hidden="true" />
              <span>{t("Ingin pasang lowongan? Daftar Akun Perusahaan Mitra →", "Looking to hire? Register Company Account →")}</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
