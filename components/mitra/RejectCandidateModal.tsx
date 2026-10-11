"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { AlertTriangle, Loader2, AlertCircle } from "lucide-react";
import { updateApplicationStatusAction } from "@/app/actions/mitra";

interface RejectCandidateModalProps {
  isOpen: boolean;
  onClose: () => void;
  applicationId: number;
  candidateName: string;
}

const TEMPLATE_REASONS = [
  "Terima kasih atas lamarannya. Saat ini kami telah memilih kandidat lain yang profilnya lebih sesuai dengan kebutuhan posisi ini.",
  "Kualifikasi pengalaman dan keahlian yang Anda miliki belum sepenuhnya sesuai dengan kriteria utama posisi yang kami buka.",
  "Proses seleksi untuk posisi ini telah ditutup karena kuota kandidat telah terpenuhi.",
];

export function RejectCandidateModal({
  isOpen,
  onClose,
  applicationId,
  candidateName,
}: RejectCandidateModalProps) {
  const [reason, setReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const trimmedReason = reason.trim();
  const isValid = trimmedReason.length >= 10 && trimmedReason.length <= 500;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) {
      setErrorMessage("Alasan penolakan wajib diisi minimal 10 karakter.");
      return;
    }

    setErrorMessage(null);
    setIsSubmitting(true);
    try {
      const res = await updateApplicationStatusAction({
        applicationId,
        toStatus: "ditolak",
        message: trimmedReason,
      });

      if (!res.success) {
        setErrorMessage(res.error || "Gagal mengirimkan penolakan lamaran.");
        return;
      }

      onClose();
    } catch {
      setErrorMessage("Terjadi kendala jaringan saat mengirimkan penolakan.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Tolak Lamaran Kandidat"
      description={`Kirimkan pemberitahuan penolakan yang jelas dan sopan kepada ${candidateName}.`}
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-950 text-xs font-medium flex items-start gap-3">
          <AlertTriangle className="w-4 h-4 text-amber-800 shrink-0 mt-0.5" aria-hidden="true" />
          <p className="leading-relaxed">
            Untuk mencegah ghosting, pesan penolakan ini akan dikirimkan kepada pelamar melalui riwayat lamaran dan notifikasi. Status lamaran yang ditolak tidak dapat diubah kembali.
          </p>
        </div>

        {/* Saran Template Alasan Cepat */}
        <div className="space-y-1.5">
          <span className="text-xs font-bold text-slate-700 block">
            Pilihan Alasan Cepat:
          </span>
          <div className="flex flex-col gap-1.5">
            {TEMPLATE_REASONS.map((template, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setReason(template)}
                className="text-left text-xs text-slate-700 hover:text-black p-2.5 rounded-xl bg-[#FAF8F0] hover:bg-[#F3EEDD] border border-black/[0.06] transition font-medium cursor-pointer"
              >
                {template}
              </button>
            ))}
          </div>
        </div>

        {/* Textarea Alasan Penolakan */}
        <div className="space-y-1.5">
          <label htmlFor="rejection-reason-input" className="text-xs font-bold text-slate-900 block">
            Pesan Alasan Penolakan untuk Pelamar <span className="text-red-500">*</span>
          </label>
          <textarea
            id="rejection-reason-input"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={4}
            maxLength={500}
            placeholder="Tuliskan alasan penolakan secara jelas dan sopan (minimal 10 karakter)..."
            className="w-full p-3.5 rounded-2xl bg-[#FAF8F0] border border-black/[0.08] text-xs sm:text-sm text-black placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-black focus:bg-white transition resize-none font-medium"
            required
          />
          <div className="flex justify-between items-center text-[11px] text-slate-500 font-medium">
            <span>Minimal 10 karakter</span>
            <span>{reason.length}/500 karakter</span>
          </div>
        </div>

        {errorMessage && (
          <div
            role="alert"
            className="flex items-center gap-2 text-xs text-red-600 font-semibold"
          >
            <AlertCircle className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
            <span>{errorMessage}</span>
          </div>
        )}

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-black/[0.06]">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="px-5 py-2.5 rounded-full border border-black/[0.08] hover:bg-black/[0.04] text-slate-700 font-bold text-xs sm:text-sm transition min-h-[44px] cursor-pointer disabled:opacity-50"
          >
            Batal
          </button>
          <button
            type="submit"
            disabled={isSubmitting || !isValid}
            className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-full bg-red-600 hover:bg-red-700 text-white font-black text-xs sm:text-sm shadow-2xs hover:shadow transition min-h-[44px] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-white" aria-hidden="true" />
                <span>Mengirim Penolakan...</span>
              </>
            ) : (
              <span>Kirim Penolakan Lamaran</span>
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
}
