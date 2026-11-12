"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, X, AlertCircle } from "lucide-react";
import { approveJobAction } from "@/app/actions/admin";
import { useLanguage } from "@/lib/i18n";

interface ApproveJobModalProps {
  jobId: number;
  jobTitle: string;
  companyName: string;
}

export function ApproveJobModal({
  jobId,
  jobTitle,
  companyName,
}: ApproveJobModalProps) {
  const router = useRouter();
  const { t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [note, setNote] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleApprove = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await approveJobAction(jobId, note);
      if (!res.success) {
        setError(res.error || t("Gagal menyetujui lowongan.", "Failed to approve vacancy."));
      } else {
        setIsOpen(false);
        router.refresh();
      }
    } catch {
      setError(t("Terjadi kesalahan teknis saat memproses persetujuan lowongan.", "Technical error while processing vacancy approval."));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-2xs transition min-h-[44px] cursor-pointer"
        aria-label={`${t("Setujui lowongan", "Approve vacancy")} ${jobTitle}`}
      >
        <CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" />
        <span>{t("Setujui Lowongan", "Approve Vacancy")}</span>
      </button>

      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-approve-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150"
          onKeyDown={(e) => {
            if (e.key === "Escape") setIsOpen(false);
          }}
        >
          <div className="bg-white rounded-3xl border border-black/[0.08] p-6 sm:p-8 max-w-lg w-full shadow-card space-y-5 animate-in zoom-in-95 duration-150">
            <div className="flex items-start justify-between gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700 shrink-0">
                <CheckCircle2 className="w-5 h-5" aria-hidden="true" />
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
                id="modal-approve-title"
                className="text-lg font-black text-black tracking-tight"
              >
                {t("Persetujuan Publikasi Lowongan (ACC)", "Vacancy Publication Approval (ACC)")}
              </h3>
              <p className="text-sm text-slate-600 font-medium leading-relaxed">
                {t("Anda akan menyetujui lowongan", "You are approving vacancy")}{" "}
                <strong className="text-black">{jobTitle}</strong>{" "}
                {t("dari perusahaan", "from company")}{" "}
                <strong className="text-black">{companyName}</strong>.
              </p>
              <p className="text-xs text-slate-500 font-medium leading-relaxed">
                {t(
                  "Status lowongan akan otomatis beralih menjadi Aktif (Open) dan dapat ditemukan serta dilamar oleh seluruh pencari kerja di portal publik.",
                  "Vacancy status will automatically switch to Active (Open) and can be discovered and applied for by all job seekers on the public portal."
                )}
              </p>
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="approve-note"
                className="block text-xs font-bold text-slate-700"
              >
                {t("Catatan Moderator (Opsional)", "Moderator Note (Optional)")}
              </label>
              <textarea
                id="approve-note"
                rows={3}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder={t(
                  "Tambahkan catatan opsional jika ada arahan tambahan bagi mitra...",
                  "Add optional notes if any additional guidance for partner..."
                )}
                className="w-full rounded-2xl border border-black/[0.12] p-3 text-xs sm:text-sm font-medium text-black placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600 transition"
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
                onClick={handleApprove}
                disabled={isLoading}
                className="w-full sm:w-auto px-6 py-2.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-2xs hover:shadow active:scale-95 disabled:opacity-50 min-h-[44px] cursor-pointer"
              >
                {isLoading
                  ? t("Memproses...", "Processing...")
                  : t("Setujui & Publikasikan", "Approve & Publish")}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
