"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { XCircle, X, AlertCircle } from "lucide-react";
import { rejectJobAction } from "@/app/actions/admin";
import { useLanguage } from "@/lib/i18n";

interface RejectJobModalProps {
  jobId: number;
  jobTitle: string;
  companyName: string;
}

export function RejectJobModal({
  jobId,
  jobTitle,
  companyName,
}: RejectJobModalProps) {
  const router = useRouter();
  const { t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleReject = async () => {
    if (!reason.trim() || reason.trim().length < 5) {
      setError(
        t(
          "Alasan penolakan wajib diisi minimal 5 karakter.",
          "Rejection reason must be at least 5 characters."
        )
      );
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const res = await rejectJobAction(jobId, reason);
      if (!res.success) {
        setError(res.error || t("Gagal menolak lowongan.", "Failed to reject vacancy."));
      } else {
        setIsOpen(false);
        router.refresh();
      }
    } catch {
      setError(
        t(
          "Terjadi kesalahan teknis saat memproses penolakan lowongan.",
          "Technical error while processing vacancy rejection."
        )
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-full hover:bg-red-50 text-red-700 hover:text-red-800 text-xs font-bold border border-red-200 transition min-h-[44px] cursor-pointer"
        aria-label={`${t("Tolak pengajuan lowongan", "Reject vacancy application")} ${jobTitle}`}
      >
        <XCircle className="w-3.5 h-3.5" aria-hidden="true" />
        <span>{t("Tolak Lowongan", "Reject Vacancy")}</span>
      </button>

      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-reject-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150"
          onKeyDown={(e) => {
            if (e.key === "Escape") setIsOpen(false);
          }}
        >
          <div className="bg-white rounded-3xl border border-black/[0.08] p-6 sm:p-8 max-w-lg w-full shadow-card space-y-5 animate-in zoom-in-95 duration-150">
            <div className="flex items-start justify-between gap-3">
              <div className="w-10 h-10 rounded-full bg-red-50 border border-red-200 flex items-center justify-center text-red-700 shrink-0">
                <XCircle className="w-5 h-5" aria-hidden="true" />
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="w-11 h-11 rounded-full hover:bg-black/[0.05] flex items-center justify-center text-slate-700 hover:text-black transition cursor-pointer min-h-[44px] min-w-[44px]"
                aria-label={t("Tutup", "Close")}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2">
              <h3
                id="modal-reject-title"
                className="text-lg font-black text-black tracking-tight"
              >
                {t("Tolak Pengajuan Lowongan", "Reject Vacancy Submission")}
              </h3>
              <p className="text-sm text-slate-600 font-medium leading-relaxed">
                {t("Anda akan menolak pengajuan lowongan", "You are rejecting vacancy submission")}{" "}
                <strong className="text-black">{jobTitle}</strong>{" "}
                {t("dari perusahaan", "from company")}{" "}
                <strong className="text-black">{companyName}</strong>.
              </p>
              <p className="text-xs text-slate-500 font-medium leading-relaxed">
                {t(
                  "Status lowongan akan beralih menjadi Ditolak (Rejected). Berikan catatan alasan penolakan yang jelas agar mitra dapat memperbaikinya.",
                  "Vacancy status will switch to Rejected. Provide clear feedback so the partner company can revise it."
                )}
              </p>
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="reject-reason"
                className="block text-xs font-bold text-slate-700"
              >
                {t("Alasan Penolakan / Arahan Perbaikan", "Rejection Reason / Guidance")}{" "}
                <span className="text-red-600">*</span>
              </label>
              <textarea
                id="reject-reason"
                rows={3}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder={t(
                  "Contoh: Rentang gaji tidak realistis, deskripsi tanggung jawab kurang jelas...",
                  "Example: Unrealistic salary range, vague responsibility descriptions..."
                )}
                className="w-full rounded-2xl border border-black/[0.12] p-3 text-xs sm:text-sm font-medium text-black placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-red-600 transition"
              />
            </div>

            {error && (
              <div
                role="alert"
                className="p-3 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-center gap-2"
              >
                <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                <span>{error}</span>
              </div>
            )}

            <div className="pt-2 flex flex-col-reverse sm:flex-row items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                disabled={isLoading}
                className="w-full sm:w-auto px-5 py-2.5 rounded-full hover:bg-black/[0.05] text-slate-700 hover:text-black text-xs font-bold transition min-h-[44px] cursor-pointer"
              >
                {t("Batal", "Cancel")}
              </button>
              <button
                type="button"
                onClick={handleReject}
                disabled={isLoading}
                className="w-full sm:w-auto px-6 py-2.5 rounded-full bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition shadow-2xs hover:shadow active:scale-95 disabled:opacity-50 min-h-[44px] cursor-pointer"
              >
                {isLoading
                  ? t("Memproses...", "Processing...")
                  : t("Konfirmasi Penolakan", "Confirm Rejection")}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
