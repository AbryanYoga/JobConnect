"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, Undo2, Loader2 } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { tarikLamaranAction } from "@/app/actions/lamaran";

export interface TombolTarikLamaranProps {
  applicationId: number;
  currentStatus: string;
  jobTitle: string;
  companyName: string;
}

export function TombolTarikLamaran({
  applicationId,
  currentStatus,
  jobTitle,
  companyName,
}: TombolTarikLamaranProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Status akhir tidak dapat ditarik lagi
  const statusAkhir = ["diterima", "ditolak", "ditarik"];
  if (statusAkhir.includes(currentStatus)) {
    return null;
  }

  const handleTarik = async () => {
    setIsLoading(true);
    setErrorMessage(null);

    const res = await tarikLamaranAction(applicationId);

    if (!res.success) {
      setErrorMessage(res.error || "Gagal menarik berkas lamaran.");
      setIsLoading(false);
      return;
    }

    setIsLoading(false);
    setIsOpen(false);
    router.refresh();
  };

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setErrorMessage(null);
          setIsOpen(true);
        }}
        className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-full border border-red-200 bg-red-50 hover:bg-red-100/80 text-red-700 font-bold text-xs transition shadow-2xs min-h-[44px]"
        aria-label="Tarik pengajuan lamaran ini"
      >
        <Undo2 className="w-3.5 h-3.5" aria-hidden="true" />
        <span>Tarik Lamaran</span>
      </button>

      <Modal
        isOpen={isOpen}
        onClose={() => {
          if (!isLoading) setIsOpen(false);
        }}
        title="Tarik Berkas Lamaran?"
        description="Konfirmasi pembatalan berkas lamaran yang telah dikirim."
        size="md"
        footer={
          <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-3 w-full">
            <button
              type="button"
              disabled={isLoading}
              onClick={() => setIsOpen(false)}
              className="w-full sm:w-auto px-5 py-2.5 rounded-full border border-black/10 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition min-h-[44px]"
            >
              Batalkan
            </button>
            <button
              type="button"
              disabled={isLoading}
              onClick={handleTarik}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-full bg-red-600 hover:bg-red-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-black text-xs transition shadow-2xs min-h-[44px]"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-white" aria-hidden="true" />
                  <span>Memproses Penarikan...</span>
                </>
              ) : (
                <span>Ya, Tarik Lamaran</span>
              )}
            </button>
          </div>
        }
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-700 leading-relaxed font-medium">
            Apakah Anda yakin ingin menarik berkas lamaran untuk posisi{" "}
            <span className="font-bold text-slate-900">{jobTitle}</span> di{" "}
            <span className="font-bold text-slate-900">{companyName}</span>?
          </p>

          <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 leading-relaxed font-medium">
            Perhatian: Tindakan ini bersifat permanen. Status lamaran akan berubah menjadi{" "}
            <span className="font-bold">Ditarik</span> dan pihak HRD perusahaan tidak akan memproses kualifikasi Anda lebih lanjut.
          </div>

          {errorMessage && (
            <div
              role="alert"
              className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-xs text-red-700 font-medium flex items-start gap-2"
            >
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" aria-hidden="true" />
              <span>{errorMessage}</span>
            </div>
          )}
        </div>
      </Modal>
    </>
  );
}
