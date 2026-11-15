"use client";

import React, { useState, useRef, useTransition } from "react";
import Link from "next/link";
import {
  FileText,
  Upload,
  Trash2,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Zap,
  Printer,
} from "lucide-react";
import { useLanguage } from "@/lib/i18n";

interface DefaultCvManagerProps {
  initialCvUrl?: string | null;
  initialUpdatedAt?: string | null;
  onUploadAction: (formData: FormData) => Promise<{
    success: boolean;
    error?: string;
    signedUrl?: string;
  }>;
  onDeleteAction: () => Promise<{
    success: boolean;
    error?: string;
  }>;
}

export function DefaultCvManager({
  initialCvUrl = null,
  initialUpdatedAt = null,
  onUploadAction,
  onDeleteAction,
}: DefaultCvManagerProps) {
  const { t } = useLanguage();
  const [cvUrl, setCvUrl] = useState<string | null>(initialCvUrl);
  const [updatedAt, setUpdatedAt] = useState<string | null>(initialUpdatedAt);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      setErrorMessage(
        t("Berkas harus berformat PDF.", "File must be in PDF format.")
      );
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setErrorMessage(
        t("Ukuran berkas maksimal 2 MB.", "File size must not exceed 2 MB.")
      );
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    setErrorMessage(null);
    const formData = new FormData();
    formData.append("cv", file);

    startTransition(async () => {
      const result = await onUploadAction(formData);
      if (result.success) {
        setCvUrl(result.signedUrl || "available");
        setUpdatedAt(new Date().toISOString());
      } else {
        setErrorMessage(
          result.error ||
            t("Gagal mengunggah CV utama.", "Failed to upload main CV.")
        );
      }
      if (fileInputRef.current) fileInputRef.current.value = "";
    });
  };

  const handleDelete = () => {
    if (
      !confirm(
        t(
          "Apakah Anda yakin ingin menghapus CV utama ini dari profil?",
          "Are you sure you want to remove this main CV from your profile?"
        )
      )
    ) {
      return;
    }

    setErrorMessage(null);
    startTransition(async () => {
      const result = await onDeleteAction();
      if (result.success) {
        setCvUrl(null);
        setUpdatedAt(null);
      } else {
        setErrorMessage(
          result.error ||
            t("Gagal menghapus CV utama.", "Failed to delete main CV.")
        );
      }
    });
  };

  function formatDate(dateStr: string | null): string {
    if (!dateStr) return "";
    try {
      return new Intl.DateTimeFormat("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric",
      }).format(new Date(dateStr));
    } catch {
      return dateStr;
    }
  }

  return (
    <div className="bg-white rounded-[28px] sm:rounded-[36px] border border-black/[0.08] shadow-card p-6 sm:p-8 space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-900 flex items-center justify-center">
            <Zap className="w-4 h-4 fill-amber-500 text-amber-600" aria-hidden="true" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-bold text-navy-950">
              {t("Berkas CV Utama (Quick Apply)", "Main CV Document (Quick Apply)")}
            </h3>
          </div>
        </div>
        <span className="text-xs font-semibold text-slate-500">
          {t("Format PDF maks 2 MB", "PDF format max 2 MB")}
        </span>
      </div>

      <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
        {t(
          "Simpan CV utama Anda satu kali di sini. Saat melamar lowongan kerja di JobConnect, Anda dapat memilih 'Gunakan CV Utama' untuk melamar dalam hitungan detik tanpa perlu mengunggah ulang file.",
          "Save your main CV once here. When applying for jobs on JobConnect, you can choose 'Use Main CV' to apply in seconds without re-uploading."
        )}
      </p>

      {errorMessage && (
        <div
          role="alert"
          className="flex items-center gap-2.5 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold"
        >
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" aria-hidden="true" />
          <span>{errorMessage}</span>
        </div>
      )}

      {cvUrl ? (
        <div className="p-4 sm:p-5 rounded-2xl bg-[#FAF8F0] border border-black/[0.06] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="w-11 h-11 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center shrink-0">
              <FileText className="w-5 h-5" aria-hidden="true" />
            </div>
            <div className="space-y-0.5 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm font-bold text-navy-950 truncate">
                  CV-Utama-Pelamar.pdf
                </span>
                <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-200">
                  <CheckCircle2 className="w-3 h-3 text-emerald-700" aria-hidden="true" />
                  <span>{t("Aktif untuk Quick Apply", "Ready for Quick Apply")}</span>
                </span>
              </div>
              {updatedAt && (
                <p className="text-xs text-slate-500 font-medium">
                  {t("Terakhir diperbarui:", "Last updated:")} {formatDate(updatedAt)}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2.5 shrink-0 w-full sm:w-auto">
            {cvUrl !== "available" && (
              <a
                href={cvUrl}
                target="_blank"
                rel="noreferrer noopener"
                className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-white hover:bg-slate-50 text-navy-950 font-bold text-xs border border-black/10 shadow-2xs transition min-h-[40px] flex-1 sm:flex-none"
              >
                <ExternalLink className="w-3.5 h-3.5 text-navy-700" aria-hidden="true" />
                <span>{t("Buka CV", "Open CV")}</span>
              </a>
            )}

            <button
              type="button"
              disabled={isPending}
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-navy-900 hover:bg-navy-950 text-white font-bold text-xs shadow-2xs transition min-h-[40px] flex-1 sm:flex-none cursor-pointer disabled:opacity-50"
            >
              {isPending ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" aria-hidden="true" />
              ) : (
                <Upload className="w-3.5 h-3.5" aria-hidden="true" />
              )}
              <span>{t("Ganti Berkas", "Replace File")}</span>
            </button>

            <button
              type="button"
              disabled={isPending}
              onClick={handleDelete}
              className="inline-flex items-center justify-center p-2 rounded-xl text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-200 transition min-h-[40px] min-w-[40px] cursor-pointer disabled:opacity-50"
              title={t("Hapus CV utama", "Delete main CV")}
              aria-label={t("Hapus CV utama", "Delete main CV")}
            >
              <Trash2 className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>
        </div>
      ) : (
        <div className="p-6 rounded-2xl border-2 border-dashed border-black/15 bg-[#FAF8F0]/50 hover:bg-[#FAF8F0] transition flex flex-col items-center justify-center text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-white border border-black/10 flex items-center justify-center text-slate-600 shadow-2xs">
            <Upload className="w-5 h-5 text-navy-900" aria-hidden="true" />
          </div>
          <div className="space-y-1 max-w-sm">
            <p className="text-sm font-bold text-navy-950">
              {t("Belum ada CV utama yang tersimpan", "No main CV saved yet")}
            </p>
            <p className="text-xs text-slate-500">
              {t(
                "Unggah CV dalam format PDF (maksimal 2 MB) untuk mengaktifkan fitur lamar cepat.",
                "Upload CV in PDF format (max 2 MB) to enable quick apply feature."
              )}
            </p>
          </div>
          <div>
            <button
              type="button"
              disabled={isPending}
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-navy-900 hover:bg-navy-950 text-white font-bold text-xs shadow-2xs transition min-h-[44px] cursor-pointer disabled:opacity-50"
            >
              {isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                  <span>{t("Mengunggah...", "Uploading...")}</span>
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" aria-hidden="true" />
                  <span>{t("Unggah CV Utama Sekarang", "Upload Main CV Now")}</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Tautan Cetak CV Format Standar ATS */}
      <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
        <span className="text-slate-600 font-medium">
          {t(
            "Butuh berkas CV fisik untuk wawancara kerja langsung?",
            "Need a physical printed CV for walk-in interview?"
          )}
        </span>
        <Link
          href="/profil/cetak-cv"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 font-bold text-navy-900 hover:text-navy-950 hover:underline shrink-0"
        >
          <Printer className="w-3.5 h-3.5 text-navy-800" aria-hidden="true" />
          <span>{t("Cetak CV Standar ATS dari Profil", "Print ATS CV from Profile")}</span>
        </Link>
      </div>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="application/pdf"
        className="hidden"
        onChange={handleFileSelect}
      />
    </div>
  );
}
