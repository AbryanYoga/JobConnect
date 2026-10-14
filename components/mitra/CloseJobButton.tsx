"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, AlertCircle, X } from "lucide-react";
import { closeJobAction } from "@/app/actions/mitra";

interface CloseJobButtonProps {
  jobId: number;
  jobTitle: string;
  className?: string;
}

export function CloseJobButton({
  jobId,
  jobTitle,
  className,
}: CloseJobButtonProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleClose = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await closeJobAction(jobId);
      if (!res.success) {
        setError(res.error || "Gagal menutup lowongan.");
      } else {
        setIsOpen(false);
        router.refresh();
      }
    } catch {
      setError("Terjadi kesalahan teknis saat menutup lowongan.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className={
          className ||
          "inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-full hover:bg-red-50 text-red-700 hover:text-red-800 text-xs font-bold border border-red-200 transition min-h-[44px] cursor-pointer"
        }
        aria-label={`Tutup lowongan ${jobTitle}`}
      >
        <Lock className="w-3.5 h-3.5" aria-hidden="true" />
        <span>Tutup Lowongan</span>
      </button>

      {/* Modal Konfirmasi Tutup Lowongan */}
      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-close-job-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150"
          onKeyDown={(e) => {
            if (e.key === "Escape") setIsOpen(false);
          }}
        >
          <div className="bg-white rounded-3xl border border-black/[0.08] p-6 sm:p-8 max-w-md w-full shadow-card space-y-5 animate-in zoom-in-95 duration-150">
            <div className="flex items-start justify-between gap-3">
              <div className="w-10 h-10 rounded-full bg-red-50 border border-red-200 flex items-center justify-center text-red-700 shrink-0">
                <AlertCircle className="w-5 h-5" aria-hidden="true" />
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="w-11 h-11 rounded-full hover:bg-black/[0.05] flex items-center justify-center text-slate-700 hover:text-black transition cursor-pointer min-h-[44px] min-w-[44px]"
                aria-label="Tutup dialog konfirmasi"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2">
              <h3
                id="modal-close-job-title"
                className="text-lg font-black text-black tracking-tight"
              >
                Konfirmasi Tutup Lowongan
              </h3>
              <p className="text-sm text-slate-600 font-medium leading-relaxed">
                Apakah Anda yakin ingin menutup lowongan <strong className="text-black">{jobTitle}</strong>?
              </p>
              <p className="text-xs text-slate-500 font-medium leading-relaxed">
                Setelah ditutup, lowongan ini tidak lagi menerima berkas lamaran baru dari pencari kerja. Anda tetap dapat meninjau pelamar yang telah masuk sebelumnya.
              </p>
            </div>

            {error && (
              <div
                role="alert"
                className="p-3 rounded-2xl bg-red-50 border border-red-200 text-red-800 text-xs font-semibold"
              >
                {error}
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
                onClick={handleClose}
                disabled={isLoading}
                className="px-6 py-3 rounded-full bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-2xs transition min-h-[44px] disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>{isLoading ? "Menutup..." : "Ya, Tutup Lowongan"}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
