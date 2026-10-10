"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { XCircle, X, AlertCircle } from "lucide-react";
import { rejectJobAction } from "@/app/actions/admin";

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
  const [isOpen, setIsOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleReject = async () => {
    if (!reason.trim() || reason.trim().length < 5) {
      setError("Alasan penolakan wajib diisi minimal 5 karakter.");
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const res = await rejectJobAction(jobId, reason);
      if (!res.success) {
        setError(res.error || "Gagal menolak lowongan.");
      } else {
        setIsOpen(false);
        router.refresh();
      }
    } catch {
      setError("Terjadi kesalahan teknis saat memproses penolakan lowongan.");
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
        aria-label={`Tolak pengajuan lowongan ${jobTitle}`}
      >
        <XCircle className="w-3.5 h-3.5" aria-hidden="true" />
        <span>Tolak Lowongan</span>
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
                className="w-9 h-9 rounded-full hover:bg-black/[0.05] flex items-center justify-center text-slate-500 hover:text-black transition cursor-pointer min-h-[36px]"
                aria-label="Tutup modal penolakan"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2">
              <h3
                id="modal-reject-title"
                className="text-lg font-black text-black tracking-tight"
              >
                Tolak Pengajuan Lowongan
              </h3>
              <p className="text-sm text-slate-600 font-medium leading-relaxed">
                Anda akan menolak pengajuan lowongan <strong className="text-black">{jobTitle}</strong> dari <strong className="text-black">{companyName}</strong>.
              </p>
              <p className="text-xs text-slate-500 font-medium leading-relaxed">
                Alasan penolakan ini akan ditampilkan di dashboard mitra agar mereka dapat merevisi dan mengajukan kembali lowongannya.
              </p>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <label
                  htmlFor="reject-reason"
                  className="font-bold text-slate-700"
                >
                  Alasan Penolakan <span className="text-red-600">*</span>
                </label>
                <span className="text-slate-400 font-medium">
                  {reason.trim().length} karakter (min. 5)
                </span>
              </div>
              <textarea
                id="reject-reason"
                rows={4}
                required
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Contoh: Kriteria keterampilan terlalu umum dan rincian gaji belum memenuhi standar transparansi. Silakan lengkapi tanggung jawab harian pekerjaan."
                className="w-full p-3.5 rounded-2xl bg-[#FAF8F0] border border-black/[0.08] text-xs font-medium text-black placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-red-600 resize-none"
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
                onClick={handleReject}
                disabled={isLoading || reason.trim().length < 5}
                className="px-6 py-3 rounded-full bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-2xs transition min-h-[44px] disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
              >
                <XCircle className="w-3.5 h-3.5" />
                <span>{isLoading ? "Memproses..." : "Tolak Pengajuan"}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
