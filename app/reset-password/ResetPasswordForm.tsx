"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Lock, ArrowRight, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { createClient } from "@/lib/supabase/client";
import { resetPasswordSchema } from "@/lib/validation/auth";
import { fieldErrors } from "@/lib/validation/helpers";
import { useLanguage } from "@/lib/i18n";

export function ResetPasswordForm() {
  const { t } = useLanguage();

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);

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
              "Gagal memperbarui kata sandi. Tautan atau sesi pemulihan mungkin sudah kedaluwarsa.",
              "Failed to update password. Recovery link or session may have expired."
            )
        );
        setIsSubmitting(false);
        return;
      }

      setIsSuccess(true);
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

  if (isSuccess) {
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

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-white rounded-[32px] sm:rounded-[40px] border border-black/[0.08] shadow-card p-8 sm:p-10">
        <div className="w-14 h-14 rounded-2xl bg-[#FFDD00] text-black mx-auto flex items-center justify-center mb-5 shadow-2xs">
          <Lock className="w-7 h-7" aria-hidden="true" />
        </div>

        <div className="text-center space-y-2 mb-6">
          <h1 className="text-2xl sm:text-3xl font-black text-black tracking-tight pt-1">
            {t("Atur Ulang Kata Sandi", "Reset Your Password")}
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
            {t(
              "Masukkan kata sandi baru yang kuat untuk akun JobConnect Anda.",
              "Enter a strong new password for your JobConnect account."
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
            id="reset-password-input"
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
            id="reset-confirm-password-input"
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

        <div className="mt-8 pt-6 border-t border-black/[0.06] text-center">
          <Link
            href="/login"
            className="text-xs font-semibold text-slate-500 hover:text-black transition-colors"
          >
            ← {t("Kembali ke Halaman Masuk", "Back to Sign In")}
          </Link>
        </div>
      </div>
    </div>
  );
}
