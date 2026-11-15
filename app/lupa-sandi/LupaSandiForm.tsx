"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Mail,
  Lock,
  ArrowRight,
  KeyRound,
  CheckCircle2,
  AlertCircle,
  Loader2,
  RefreshCw,
  ShieldCheck,
} from "lucide-react";
import { Input } from "@/components/ui/Input";
import { createClient } from "@/lib/supabase/client";
import {
  forgotPasswordSchema,
  resetPasswordSchema,
} from "@/lib/validation/auth";
import { fieldErrors } from "@/lib/validation/helpers";
import { useLanguage } from "@/lib/i18n";

type Step = "input_email" | "verify_otp" | "new_password" | "success";

export function LupaSandiForm() {
  const { t, language } = useLanguage();

  const [step, setStep] = useState<Step>("input_email");
  const [email, setEmail] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [serverSuccess, setServerSuccess] = useState<string | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(60);

  // Timer countdown untuk kirim ulang OTP
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (step === "verify_otp" && resendCountdown > 0) {
      timer = setInterval(() => {
        setResendCountdown((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [step, resendCountdown]);

  // Langkah 1: Kirim kode pemulihan ke email
  const handleSendRecoveryCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);
    setServerSuccess(null);

    const validationResult = forgotPasswordSchema.safeParse({ email });
    if (!validationResult.success) {
      setErrors(fieldErrors(validationResult.error));
      return;
    }

    setErrors({});
    setIsSubmitting(true);

    try {
      const supabase = createClient();
      const callbackUrl = `${window.location.origin}/auth/callback?flow=recovery`;

      const { error } = await supabase.auth.resetPasswordForEmail(
        validationResult.data.email,
        {
          redirectTo: callbackUrl,
        }
      );

      if (error) {
        setServerError(
          error.message ||
            t(
              "Gagal mengirimkan kode pemulihan kata sandi. Silakan periksa kembali email Anda.",
              "Failed to send recovery code. Please check your email."
            )
        );
        setIsSubmitting(false);
        return;
      }

      setResendCountdown(60);
      setStep("verify_otp");
      setIsSubmitting(false);
    } catch {
      setServerError(
        t(
          "Terjadi kendala saat menghubungi server. Silakan coba beberapa saat lagi.",
          "An error occurred while contacting the server. Please try again."
        )
      );
      setIsSubmitting(false);
    }
  };

  // Langkah 2: Verifikasi kode OTP 6 digit
  const handleVerifyRecoveryOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);
    setServerSuccess(null);

    const trimmedOtp = otpCode.trim();
    if (trimmedOtp.length !== 6 || !/^\d{6}$/.test(trimmedOtp)) {
      setServerError(
        t(
          "Kode verifikasi harus terdiri dari 6 digit angka.",
          "Verification code must be 6 digits."
        )
      );
      return;
    }

    setIsSubmitting(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.verifyOtp({
        email,
        token: trimmedOtp,
        type: "recovery",
      });

      if (error) {
        const lower = error.message.toLowerCase();
        if (lower.includes("expired")) {
          setServerError(
            t(
              "Kode OTP sudah kedaluwarsa. Silakan klik kirim ulang kode baru.",
              "OTP code has expired. Please request a new one."
            )
          );
        } else {
          setServerError(
            t(
              "Kode verifikasi salah atau tidak valid. Silakan periksa kembali email Gmail Anda.",
              "Invalid verification code. Please check your Gmail inbox."
            )
          );
        }
        setIsSubmitting(false);
        return;
      }

      // Berhasil diverifikasi, lanjut ke tahap buat kata sandi baru
      setStep("new_password");
      setIsSubmitting(false);
    } catch {
      setServerError(
        t(
          "Terjadi kendala saat memverifikasi kode OTP. Silakan coba lagi.",
          "An error occurred while verifying OTP. Please try again."
        )
      );
      setIsSubmitting(false);
    }
  };

  // Kirim ulang kode pemulihan
  const handleResendRecoveryOtp = async () => {
    if (resendCountdown > 0 || isResending) return;
    setServerError(null);
    setServerSuccess(null);
    setIsResending(true);

    try {
      const supabase = createClient();
      const callbackUrl = `${window.location.origin}/auth/callback?flow=recovery`;

      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: callbackUrl,
      });

      if (error) {
        setServerError(
          error.message ||
            t("Gagal mengirim ulang kode OTP.", "Failed to resend OTP.")
        );
      } else {
        setResendCountdown(60);
        setServerSuccess(
          t(
            "Kode pemulihan baru telah berhasil dikirim ke email Anda.",
            "A new recovery code has been sent to your email."
          )
        );
      }
    } catch {
      setServerError(
        t("Terjadi gangguan koneksi.", "Network error occurred.")
      );
    } finally {
      setIsResending(false);
    }
  };

  // Langkah 3: Simpan kata sandi baru
  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);
    setServerSuccess(null);

    const validationResult = resetPasswordSchema.safeParse({
      password: newPassword,
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
      const { error } = await supabase.auth.updateUser({
        password: validationResult.data.password,
      });

      if (error) {
        setServerError(
          error.message ||
            t(
              "Gagal memperbarui kata sandi. Silakan coba kembali.",
              "Failed to update password. Please try again."
            )
        );
        setIsSubmitting(false);
        return;
      }

      // Berhasil ubah kata sandi
      setStep("success");
      setIsSubmitting(false);
    } catch {
      setServerError(
        t(
          "Terjadi gangguan koneksi saat memperbarui kata sandi.",
          "Network error occurred while updating password."
        )
      );
      setIsSubmitting(false);
    }
  };

  // Tampilan Sukses Akhir
  if (step === "success") {
    return (
      <div className="w-full max-w-md mx-auto">
        <div className="bg-white rounded-[32px] sm:rounded-[40px] border border-black/[0.08] shadow-card p-8 sm:p-10 text-center">
          <div className="w-14 h-14 rounded-2xl bg-[#FFDD00] text-black mx-auto flex items-center justify-center mb-5 shadow-2xs">
            <CheckCircle2 className="w-7 h-7" aria-hidden="true" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-black tracking-tight">
            {t("Kata Sandi Berhasil Diperbarui!", "Password Successfully Updated!")}
          </h2>
          <p className="text-sm text-slate-600 mt-2.5 leading-relaxed font-normal">
            {t(
              "Kata sandi akun Anda telah berhasil diatur ulang. Sekarang Anda dapat masuk ke JobConnect menggunakan kata sandi baru Anda.",
              "Your account password has been reset. You can now sign in to JobConnect using your new password."
            )}
          </p>
          <div className="mt-8">
            <Link
              href="/login"
              className="inline-flex items-center justify-center w-full px-6 py-3.5 rounded-full bg-black hover:bg-slate-900 text-white font-black text-sm transition-all shadow-2xs min-h-[48px]"
            >
              <span>{t("Masuk dengan Kata Sandi Baru", "Sign In with New Password")}</span>
              <ArrowRight className="w-4 h-4 ml-2 text-[#FFDD00]" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Tampilan Langkah 2: Verifikasi Kode OTP
  if (step === "verify_otp") {
    return (
      <div className="w-full max-w-md mx-auto">
        <div className="bg-white rounded-[32px] sm:rounded-[40px] border border-black/[0.08] shadow-card p-8 sm:p-10">
          <div className="w-14 h-14 rounded-2xl bg-[#FFDD00] text-black mx-auto flex items-center justify-center mb-5 shadow-2xs">
            <KeyRound className="w-7 h-7" aria-hidden="true" />
          </div>

          <div className="text-center space-y-2 mb-6">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-semibold">
              <ShieldCheck className="w-3.5 h-3.5 text-slate-500" aria-hidden="true" />
              <span>{t("Konfirmasi Pemilik Akun", "Confirm Account Ownership")}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-black tracking-tight pt-1">
              {t("Verifikasi Kode OTP", "Verify OTP Code")}
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
              {t(
                "Masukkan 6 digit kode pemulihan yang baru saja dikirimkan ke email:",
                "Enter the 6-digit recovery code sent to your email:"
              )}{" "}
              <span className="font-bold text-black block mt-0.5">{email}</span>
            </p>
          </div>

          {serverError && (
            <div
              role="alert"
              className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs sm:text-sm flex items-start gap-2.5 mb-5 font-medium"
            >
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-600" aria-hidden="true" />
              <span className="leading-snug">{serverError}</span>
            </div>
          )}

          {serverSuccess && (
            <div
              role="status"
              className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm flex items-start gap-2.5 mb-5 font-medium"
            >
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" aria-hidden="true" />
              <span className="leading-snug">{serverSuccess}</span>
            </div>
          )}

          <form onSubmit={handleVerifyRecoveryOtp} className="space-y-5">
            <div>
              <label
                htmlFor="recovery-otp-input"
                className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 text-center"
              >
                {t("6 Digit Kode Verifikasi OTP", "6-Digit OTP Code")}
              </label>
              <input
                id="recovery-otp-input"
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={6}
                value={otpCode}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, "");
                  setOtpCode(val);
                  if (serverError) setServerError(null);
                }}
                placeholder="••••••"
                className="w-full text-center text-2xl tracking-[0.4em] font-black py-3.5 px-4 rounded-2xl bg-[#FAF8F0] border border-black/[0.12] focus:border-black focus:bg-white focus:outline-none transition-all placeholder:text-slate-300"
                autoFocus
              />
              <p className="text-[11px] text-slate-500 text-center mt-2 font-normal">
                {t(
                  "Periksa kotak masuk atau folder Spam Gmail Anda.",
                  "Check your Gmail inbox or Spam folder."
                )}
              </p>
            </div>

            <button
              type="submit"
              disabled={isSubmitting || otpCode.trim().length !== 6}
              className="w-full py-3.5 px-6 rounded-full bg-black hover:bg-slate-900 active:scale-98 text-white font-black text-sm transition-all shadow-2xs hover:shadow flex items-center justify-center gap-2 min-h-[48px] disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" aria-hidden="true" />
                  <span>{t("Memverifikasi Kode OTP...", "Verifying OTP...")}</span>
                </>
              ) : (
                <>
                  <span>{t("Verifikasi & Buat Kata Sandi Baru", "Verify & Create New Password")}</span>
                  <ArrowRight className="w-4 h-4 stroke-[2.5] text-[#FFDD00]" aria-hidden="true" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-black/[0.06] text-center space-y-3">
            <div className="text-xs text-slate-600 font-medium">
              {t("Tidak menerima kode?", "Didn't receive code?")}{" "}
              <button
                type="button"
                onClick={handleResendRecoveryOtp}
                disabled={resendCountdown > 0 || isResending}
                className="font-bold text-black hover:underline disabled:opacity-50 disabled:no-underline cursor-pointer inline-flex items-center gap-1"
              >
                {isResending && <RefreshCw className="w-3 h-3 animate-spin" />}
                {resendCountdown > 0
                  ? `${t("Kirim ulang dalam", "Resend in")} ${resendCountdown}s`
                  : t("Kirim Ulang Kode OTP", "Resend OTP Code")}
              </button>
            </div>

            <div>
              <button
                type="button"
                onClick={() => {
                  setStep("input_email");
                  setOtpCode("");
                  setServerError(null);
                  setServerSuccess(null);
                }}
                className="text-xs font-semibold text-slate-500 hover:text-black transition-colors"
              >
                ← {t("Ganti alamat email", "Change email address")}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Tampilan Langkah 3: Input Kata Sandi Baru
  if (step === "new_password") {
    return (
      <div className="w-full max-w-md mx-auto">
        <div className="bg-white rounded-[32px] sm:rounded-[40px] border border-black/[0.08] shadow-card p-8 sm:p-10">
          <div className="w-14 h-14 rounded-2xl bg-[#FFDD00] text-black mx-auto flex items-center justify-center mb-5 shadow-2xs">
            <Lock className="w-7 h-7" aria-hidden="true" />
          </div>

          <div className="text-center space-y-2 mb-6">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-semibold border border-emerald-200">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" aria-hidden="true" />
              <span>{t("Akun Terverifikasi", "Account Verified")}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-black tracking-tight pt-1">
              {t("Buat Kata Sandi Baru", "Create New Password")}
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
              {t(
                "Silakan masukkan kata sandi baru yang kuat untuk akun Anda.",
                "Please enter a strong new password for your account."
              )}
            </p>
          </div>

          {serverError && (
            <div
              role="alert"
              className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs sm:text-sm flex items-start gap-2.5 mb-5 font-medium"
            >
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-600" aria-hidden="true" />
              <span className="leading-snug">{serverError}</span>
            </div>
          )}

          <form onSubmit={handleUpdatePassword} noValidate className="space-y-4">
            <Input
              id="new-password"
              label={t("Kata Sandi Baru", "New Password")}
              required
              type="password"
              autoComplete="new-password"
              placeholder="••••••••"
              helperText={t("Minimal 8 karakter", "Minimum 8 characters")}
              leftIcon={<Lock className="w-4 h-4 text-slate-400" />}
              value={newPassword}
              onChange={(e) => {
                setNewPassword(e.target.value);
                if (errors.password) setErrors((prev) => ({ ...prev, password: "" }));
              }}
              error={errors.password}
              className="rounded-2xl bg-[#FAF8F0] border-black/[0.08] focus:border-black focus:bg-white text-sm py-2.5 font-medium transition-all"
            />

            <Input
              id="confirm-new-password"
              label={t("Konfirmasi Kata Sandi Baru", "Confirm New Password")}
              required
              type="password"
              autoComplete="new-password"
              placeholder="••••••••"
              helperText={t("Ulangi kata sandi baru", "Repeat new password")}
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

            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 px-6 rounded-full bg-black hover:bg-slate-900 active:scale-98 text-white font-black text-sm transition-all shadow-2xs hover:shadow flex items-center justify-center gap-2 min-h-[48px] disabled:opacity-50 cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white" aria-hidden="true" />
                    <span>{t("Menyimpan Kata Sandi...", "Saving Password...")}</span>
                  </>
                ) : (
                  <>
                    <span>{t("Simpan Kata Sandi Baru", "Save New Password")}</span>
                    <ArrowRight className="w-4 h-4 stroke-[2.5] text-[#FFDD00]" aria-hidden="true" />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // Tampilan Langkah 1: Input Email Pemulihan (Default)
  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-white rounded-[32px] sm:rounded-[40px] border border-black/[0.08] shadow-card p-8 sm:p-10">
        <div className="w-14 h-14 rounded-2xl bg-[#FFDD00] text-black mx-auto flex items-center justify-center mb-5 shadow-2xs">
          <KeyRound className="w-7 h-7" aria-hidden="true" />
        </div>

        <div className="text-center space-y-2 mb-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-semibold">
            <Mail className="w-3.5 h-3.5 text-slate-500" aria-hidden="true" />
            <span>{t("Pemulihan Akun", "Account Recovery")}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-black tracking-tight pt-1">
            {t("Lupa Kata Sandi?", "Forgot Password?")}
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
            {t(
              "Masukkan alamat email akun JobConnect Anda. Kami akan mengirimkan kode verifikasi 6 digit ke email Anda untuk mengatur ulang kata sandi.",
              "Enter your JobConnect account email. We will send a 6-digit verification code to reset your password."
            )}
          </p>
        </div>

        {serverError && (
          <div
            role="alert"
            className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs sm:text-sm flex items-start gap-2.5 mb-5 font-medium"
          >
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-600" aria-hidden="true" />
            <span className="leading-snug">{serverError}</span>
          </div>
        )}

        <form onSubmit={handleSendRecoveryCode} noValidate className="space-y-4">
          <Input
            id="recovery-email"
            label={t("Alamat Email Akun", "Account Email Address")}
            required
            type="email"
            autoComplete="email"
            placeholder={
              language === "en" ? "yourname@gmail.com" : "nama@gmail.com"
            }
            helperText={t(
              "Gunakan email Gmail atau email aktif yang terdaftar",
              "Use registered Gmail or active email"
            )}
            leftIcon={<Mail className="w-4 h-4 text-slate-400" />}
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (errors.email) setErrors((prev) => ({ ...prev, email: "" }));
            }}
            error={errors.email}
            className="rounded-2xl bg-[#FAF8F0] border-black/[0.08] focus:border-black focus:bg-white text-sm py-2.5 font-medium transition-all"
          />

          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 px-6 rounded-full bg-black hover:bg-slate-900 active:scale-98 text-white font-black text-sm transition-all shadow-2xs hover:shadow flex items-center justify-center gap-2 min-h-[48px] disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" aria-hidden="true" />
                  <span>{t("Mengirim Kode Verifikasi...", "Sending Verification Code...")}</span>
                </>
              ) : (
                <>
                  <span>{t("Kirim Kode Verifikasi ke Email", "Send Verification Code to Email")}</span>
                  <ArrowRight className="w-4 h-4 stroke-[2.5] text-[#FFDD00]" aria-hidden="true" />
                </>
              )}
            </button>
          </div>
        </form>

        <div className="mt-8 pt-6 border-t border-black/[0.06] text-center">
          <p className="text-xs sm:text-sm text-slate-600 font-medium">
            {t("Sudah mengingat kata sandi Anda?", "Remembered your password?")}{" "}
            <Link
              href="/login"
              className="font-bold text-black hover:underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-black rounded-xs"
            >
              {t("Kembali ke Halaman Masuk", "Back to Sign In")}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
