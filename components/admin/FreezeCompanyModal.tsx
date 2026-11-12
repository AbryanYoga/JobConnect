"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, X, ShieldAlert, CheckCircle2 } from "lucide-react";
import { takedownCompanyJobsAction } from "@/app/actions/admin";
import { useLanguage } from "@/lib/i18n";

interface FreezeCompanyModalProps {
  companyId: number;
  companyName: string;
  activeJobsCount: number;
}

export function FreezeCompanyModal({
  companyId,
  companyName,
  activeJobsCount,
}: FreezeCompanyModalProps) {
  const router = useRouter();
  const { t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successCount, setSuccessCount] = useState<number | null>(null);

  const handleFreeze = async () => {
    if (!reason.trim() || reason.trim().length < 5) {
      setError(
        t(
          "Alasan penonaktifan wajib diisi minimal 5 karakter.",
          "Deactivation reason must be at least 5 characters."
        )
      );
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const res = await takedownCompanyJobsAction(companyId, reason);
      if (!res.success) {
        setError(res.error || t("Gagal memproses penonaktifan lowongan.", "Failed to freeze company vacancies."));
      } else {
        setSuccessCount(res.count ?? 0);
        setTimeout(() => {
          setIsOpen(false);
          setSuccessCount(null);
          setReason("");
          router.refresh();
        }, 1200);
      }
    } catch {
      setError(
        t(
          "Terjadi kesalahan teknis saat memproses penonaktifan.",
          "Technical error while processing vacancy freeze."
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
        className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-full hover:bg-rose-50 text-rose-700 hover:text-rose-800 text-xs font-bold border border-rose-200 transition min-h-[40px] cursor-pointer"
        aria-label={`${t("Bekukan dan turunkan seluruh lowongan milik", "Freeze and takedown all vacancies belonging to")} ${companyName}`}
      >
        <ShieldAlert className="w-3.5 h-3.5" aria-hidden="true" />
        <span>{t("Bekukan Lowongan", "Freeze Vacancies")}</span>
      </button>

      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-freeze-company-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150"
          onKeyDown={(e) => {
            if (e.key === "Escape") setIsOpen(false);
          }}
        >
          <div className="bg-white rounded-3xl border border-black/[0.08] p-6 sm:p-8 max-w-lg w-full shadow-card space-y-5 animate-in zoom-in-95 duration-150">
            <div className="flex items-start justify-between gap-3">
              <div className="w-10 h-10 rounded-full bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-700 shrink-0">
                <AlertTriangle className="w-5 h-5" aria-hidden="true" />
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="w-11 h-11 rounded-full hover:bg-black/[0.05] flex items-center justify-center text-slate-700 hover:text-black transition cursor-pointer min-h-[44px] min-w-[44px]"
                aria-label={t("Tutup", "Close")}
              >
                <X className="w-5 h-5" aria-hidden="true" />
              </button>
            </div>

            <div className="space-y-2">
              <h3
                id="modal-freeze-company-title"
                className="text-lg font-black text-black tracking-tight"
              >
                {t("Bekukan Seluruh Lowongan Mitra", "Freeze All Partner Vacancies")}
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed">
                {t("Anda akan menurunkan seluruh", "You are taking down all")}{" "}
                ({activeJobsCount}){" "}
                {t(
                  "lowongan aktif dan pengajuan pending milik entitas",
                  "active vacancies and pending submissions belonging to"
                )}{" "}
                <strong className="text-black">{companyName}</strong>.{" "}
                {t(
                  "Tindakan ini bertujuan untuk mencegah pelamar melamar ke instansi yang terindikasi bodong atau melanggar aturan.",
                  "This action prevents applicants from applying to entities suspected of fraud or violating policies."
                )}
              </p>
            </div>

            {error && (
              <div
                role="alert"
                className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold"
              >
                {error}
              </div>
            )}

            {successCount !== null && (
              <div
                role="status"
                className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>
                  {t(
                    `Berhasil menurunkan ${successCount} lowongan dari perusahaan ini.`,
                    `Successfully took down ${successCount} vacancies from this company.`
                  )}
                </span>
              </div>
            )}

            <div className="space-y-1.5">
              <label
                htmlFor="freeze-reason-input"
                className="block text-xs font-bold text-slate-700 uppercase tracking-wider"
              >
                {t("Alasan Penonaktifan / Catatan Moderator:", "Deactivation Reason / Moderator Note:")}{" "}
                <span className="text-rose-600">*</span>
              </label>
              <textarea
                id="freeze-reason-input"
                rows={3}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder={t(
                  "Contoh: Terindikasi lowongan fiktif atau memungut biaya seleksi dari pencari kerja.",
                  "Example: Suspected fake vacancies or illegal recruitment fees from job seekers."
                )}
                className="w-full rounded-2xl border border-black/[0.12] p-3.5 text-xs sm:text-sm font-medium text-black placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900 transition"
              />
              <span className="text-[11px] text-slate-500 font-medium block">
                {t(
                  "Catatan ini akan tersimpan pada riwayat audit platform.",
                  "This note will be recorded in the platform audit history."
                )}
              </span>
            </div>

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
                onClick={handleFreeze}
                disabled={isLoading}
                className="w-full sm:w-auto px-6 py-2.5 rounded-full bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition shadow-2xs hover:shadow active:scale-95 disabled:opacity-50 min-h-[44px] cursor-pointer"
              >
                {isLoading
                  ? t("Memproses...", "Processing...")
                  : t("Konfirmasi Bekukan", "Confirm Freeze")}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
