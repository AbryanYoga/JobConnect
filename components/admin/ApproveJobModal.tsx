"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, X, AlertCircle } from "lucide-react";
import { approveJobAction } from "@/app/actions/admin";

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
        setError(res.error || "Gagal menyetujui lowongan.");
      } else {
        setIsOpen(false);
        router.refresh();
      }
    } catch {
      setError("Terjadi kesalahan teknis saat memproses persetujuan lowongan.");
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
        aria-label={`Setujui lowongan ${jobTitle}`}
      >
        <CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" />
        <span>Setujui Lowongan</span>
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
                aria-label="Tutup modal persetujuan"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2">
              <h3
                id="modal-approve-title"
                className="text-lg font-black text-black tracking-tight"
              >
                Persetujuan Publikasi Lowongan (ACC)
              </h3>
              <p className="text-sm text-slate-600 font-medium leading-relaxed">
                Anda akan menyetujui lowongan <strong className="text-black">{jobTitle}</strong> dari perusahaan <strong className="text-black">{companyName}</strong>.
              </p>
              <p className="text-xs text-slate-500 font-medium leading-relaxed">
                Status lowongan akan otomatis beralih menjadi <strong>Aktif (Open)</strong> dan dapat ditemukan serta dilamar oleh seluruh pencari kerja di portal publik.
              </p>
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="approve-note"
                className="block text-xs font-bold text-slate-700"
              >
                Catatan Moderator (Opsional)
              </label>
              <textarea
                id="approve-note"
                rows={3}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Contoh: Kriteria dan transparansi gaji telah sesuai standar platform."
                className="w-full p-3 rounded-2xl bg-[#FAF8F0] border border-black/[0.08] text-xs font-medium text-black placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-600 resize-none"
              />
            </div>

            {error && (
              <div
                role="alert"
                className="p-3 rounded-2xl bg-red-50 border border-red-200 text-red-800 text-xs font-semibold flex items-center gap-2"
              >
                <AlertCircle className="w-4 h-4 shrink-0" aria-hidden="true" />
                <span>{error}</span>
              </div>
            )}

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                disabled={isLoading}
                className="px-5 py-3 rounded-full hover:bg-black/[0.05] text-black text-xs font-bold transition min-h-[44px] cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleApprove}
                disabled={isLoading}
                className="px-6 py-3 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-2xs transition min-h-[44px] disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{isLoading ? "Memproses..." : "Ya, Setujui & Publikasikan"}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
