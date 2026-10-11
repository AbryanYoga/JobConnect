"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Calendar, MapPin, Loader2, AlertCircle, Info } from "lucide-react";
import { updateApplicationStatusAction } from "@/app/actions/mitra";

interface ScheduleInterviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  applicationId: number;
  candidateName: string;
  initialInterviewAt?: string | null;
  initialInterviewPlace?: string | null;
}

function formatToInputDateTime(dateStr?: string | null): string {
  if (!dateStr) return "";
  try {
    const d = new Date(dateStr);
    const pad = (n: number) => String(n).padStart(2, "0");
    const year = d.getFullYear();
    const month = pad(d.getMonth() + 1);
    const day = pad(d.getDate());
    const hours = pad(d.getHours());
    const minutes = pad(d.getMinutes());
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  } catch {
    return "";
  }
}

export function ScheduleInterviewModal({
  isOpen,
  onClose,
  applicationId,
  candidateName,
  initialInterviewAt,
  initialInterviewPlace,
}: ScheduleInterviewModalProps) {
  const [interviewAt, setInterviewAt] = useState(() =>
    formatToInputDateTime(initialInterviewAt)
  );
  const [interviewPlace, setInterviewPlace] = useState(
    initialInterviewPlace || ""
  );
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Batas minimum waktu adalah sekarang
  const minDateTime = formatToInputDateTime(new Date().toISOString());

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!interviewAt) {
      setErrorMessage("Tanggal dan waktu wawancara wajib diisi.");
      return;
    }

    const selectedTime = new Date(interviewAt).getTime();
    if (selectedTime <= Date.now()) {
      setErrorMessage("Waktu wawancara harus dijadwalkan di masa depan.");
      return;
    }

    const cleanPlace = interviewPlace.trim();
    if (!cleanPlace) {
      setErrorMessage("Lokasi atau tautan pertemuan wawancara wajib diisi.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await updateApplicationStatusAction({
        applicationId,
        toStatus: "wawancara",
        interviewAt: new Date(interviewAt).toISOString(),
        interviewPlace: cleanPlace,
        message: notes.trim() || undefined,
      });

      if (!res.success) {
        setErrorMessage(res.error || "Gagal menjadwalkan wawancara.");
        return;
      }

      onClose();
    } catch {
      setErrorMessage("Terjadi kendala jaringan saat menyimpan jadwal.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialInterviewAt ? "Ubah Jadwal Wawancara" : "Jadwalkan Wawancara"}
      description={`Atur jadwal dan lokasi atau tautan wawancara untuk ${candidateName}.`}
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="p-4 rounded-2xl bg-[#FAF8F0] border border-black/[0.06] text-xs font-medium text-slate-700 flex items-start gap-3">
          <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" aria-hidden="true" />
          <p className="leading-relaxed">
            Status lamaran akan diperbarui menjadi <strong>Wawancara</strong>. Jadwal dan lokasi akan dicatat secara transparan pada timeline pelamar.
          </p>
        </div>

        {/* Input Tanggal & Waktu */}
        <div className="space-y-1.5">
          <label htmlFor="interview-time-input" className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-slate-600" aria-hidden="true" />
            <span>Tanggal & Jam Wawancara</span>
            <span className="text-red-500">*</span>
          </label>
          <input
            id="interview-time-input"
            type="datetime-local"
            min={minDateTime}
            value={interviewAt}
            onChange={(e) => setInterviewAt(e.target.value)}
            className="w-full p-3.5 rounded-2xl bg-[#FAF8F0] border border-black/[0.08] text-xs sm:text-sm text-black focus:outline-none focus:ring-2 focus:ring-black focus:bg-white transition font-medium min-h-[44px]"
            required
          />
        </div>

        {/* Input Lokasi atau Tautan Online */}
        <div className="space-y-1.5">
          <label htmlFor="interview-place-input" className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-slate-600" aria-hidden="true" />
            <span>Lokasi Kantor atau Tautan Pertemuan Daring</span>
            <span className="text-red-500">*</span>
          </label>
          <input
            id="interview-place-input"
            type="text"
            value={interviewPlace}
            onChange={(e) => setInterviewPlace(e.target.value)}
            maxLength={250}
            placeholder="Contoh: Kantor JobConnect Lt. 2, atau Google Meet: https://meet.google.com/abc-defg-hij"
            className="w-full p-3.5 rounded-2xl bg-[#FAF8F0] border border-black/[0.08] text-xs sm:text-sm text-black placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-black focus:bg-white transition font-medium min-h-[44px]"
            required
          />
          <span className="text-[11px] text-slate-500 font-medium block">
            Bisa berupa alamat fisik kantor operasional atau tautan Google Meet / Zoom.
          </span>
        </div>

        {/* Input Catatan Persiapan Wawancara (Opsional) */}
        <div className="space-y-1.5">
          <label htmlFor="interview-notes-input" className="text-xs font-bold text-slate-900 block">
            Catatan Tambahan untuk Pelamar (Opsional)
          </label>
          <textarea
            id="interview-notes-input"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            maxLength={500}
            placeholder="Contoh: Harap membawa portofolio cetak dan mempersiapkan presentasi singkat..."
            className="w-full p-3.5 rounded-2xl bg-[#FAF8F0] border border-black/[0.08] text-xs sm:text-sm text-black placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-black focus:bg-white transition resize-none font-medium"
          />
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
            disabled={isSubmitting || !interviewAt || !interviewPlace.trim()}
            className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-full bg-[#FFDD00] hover:bg-[#F5D400] text-black font-black text-xs sm:text-sm shadow-2xs hover:shadow transition min-h-[44px] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-black" aria-hidden="true" />
                <span>Menyimpan Jadwal...</span>
              </>
            ) : (
              <span>Simpan Jadwal Wawancara</span>
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
}
