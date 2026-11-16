"use client";

import React, { useState } from "react";
import { Lock, Eye, EyeOff, Loader2, CheckCircle2, AlertCircle, X } from "lucide-react";
import { useLanguage } from "@/lib/i18n";
import { updatePasswordAction } from "@/app/actions/profil";

interface UbahPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Modal untuk memperbarui kata sandi akun pelamar kerja secara langsung
export function UbahPasswordModal({ isOpen, onClose }: UbahPasswordModalProps) {
  const { t } = useLanguage();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (password.length < 8) {
      setErrorMessage(t("Kata sandi baru minimal 8 karakter.", "New password must be at least 8 characters."));
      setTimeout(() => {
        document.getElementById("new-password")?.focus();
      }, 50);
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage(t("Konfirmasi kata sandi tidak cocok.", "Password confirmation does not match."));
      setTimeout(() => {
        document.getElementById("confirm-password")?.focus();
      }, 50);
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await updatePasswordAction(password);
      if (res.success) {
        setSuccessMessage(t("Kata sandi berhasil diperbarui!", "Password successfully updated!"));
        setPassword("");
        setConfirmPassword("");
        setTimeout(() => {
          onClose();
        }, 1500);
      } else {
        setErrorMessage(res.error || t("Gagal mengganti kata sandi.", "Failed to change password."));
      }
    } catch {
      setErrorMessage(t("Terjadi gangguan koneksi.", "Connection error occurred."));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-password-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div className="w-full max-w-md bg-white rounded-3xl border border-black/[0.08] p-6 shadow-2xl space-y-5 animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between pb-3 border-b border-black/[0.06]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#FAF8F0] border border-black/[0.08] flex items-center justify-center text-black">
              <Lock className="w-4 h-4" />
            </div>
            <h3 id="modal-password-title" className="text-base font-black text-black">
              {t("Ubah Kata Sandi", "Change Password")}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-black hover:bg-slate-100 transition min-w-[32px] min-h-[32px] flex items-center justify-center"
            aria-label={t("Tutup modal", "Close modal")}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {errorMessage && (
          <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
            <span>{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
            <span>{successMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label htmlFor="new-password" className="text-xs font-bold text-slate-700 block">
              {t("Kata Sandi Baru", "New Password")}
            </label>
            <div className="relative">
              <input
                id="new-password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t("Minimal 8 karakter", "Min. 8 characters")}
                required
                minLength={8}
                className="w-full px-4 py-2.5 pr-10 rounded-xl bg-[#FAF8F0] border border-black/[0.08] text-sm text-black focus:bg-white focus:border-black transition"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-black p-1"
                aria-label={showPassword ? t("Sembunyikan sandi", "Hide password") : t("Tampilkan sandi", "Show password")}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="confirm-password" className="text-xs font-bold text-slate-700 block">
              {t("Konfirmasi Kata Sandi Baru", "Confirm New Password")}
            </label>
            <input
              id="confirm-password"
              type={showPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder={t("Ketik ulang kata sandi baru", "Retype new password")}
              required
              minLength={8}
              className="w-full px-4 py-2.5 rounded-xl bg-[#FAF8F0] border border-black/[0.08] text-sm text-black focus:bg-white focus:border-black transition"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 rounded-full border border-black/[0.08] text-slate-700 hover:bg-slate-100 text-xs font-bold transition min-h-[40px]"
            >
              {t("Batal", "Cancel")}
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center justify-center gap-2 px-5 py-2 rounded-full bg-[#FFDD00] hover:bg-[#F5D400] text-black text-xs font-black shadow-2xs active:scale-95 transition min-h-[40px] disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>{t("Menyimpan...", "Saving...")}</span>
                </>
              ) : (
                <span>{t("Simpan Kata Sandi", "Save Password")}</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
