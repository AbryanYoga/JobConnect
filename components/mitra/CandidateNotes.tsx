"use client";

import { useState } from "react";
import {
  Lock,
  MessageSquare,
  PlusCircle,
  Trash2,
  Loader2,
  AlertCircle,
  Clock,
} from "lucide-react";
import {
  addApplicationNoteAction,
  deleteApplicationNoteAction,
} from "@/app/actions/mitra";

export interface CandidateNoteItem {
  id: number;
  application_id: number;
  author_id: string;
  note: string;
  created_at: string;
}

interface CandidateNotesProps {
  applicationId: number;
  notes: CandidateNoteItem[];
  currentUserId: string;
}

function formatDateIndo(dateStr: string): string {
  try {
    return new Intl.DateTimeFormat("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(dateStr));
  } catch {
    return dateStr;
  }
}

export function CandidateNotes({
  applicationId,
  notes,
  currentUserId,
}: CandidateNotesProps) {
  const [noteText, setNoteText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const clean = noteText.trim();
    if (!clean) {
      setErrorMessage("Catatan internal tidak boleh kosong.");
      return;
    }
    if (clean.length > 2000) {
      setErrorMessage("Catatan internal maksimal 2000 karakter.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await addApplicationNoteAction(applicationId, clean);
      if (!res.success) {
        setErrorMessage(res.error || "Gagal menyimpan catatan.");
        return;
      }
      setNoteText("");
    } catch {
      setErrorMessage("Terjadi kendala jaringan saat menyimpan catatan.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (noteId: number) => {
    if (!confirm("Hapus catatan internal ini?")) return;
    setErrorMessage(null);
    setDeletingId(noteId);
    try {
      const res = await deleteApplicationNoteAction(noteId, applicationId);
      if (!res.success) {
        setErrorMessage(res.error || "Gagal menghapus catatan.");
      }
    } catch {
      setErrorMessage("Terjadi kendala jaringan saat menghapus catatan.");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-black/[0.08] p-6 sm:p-7 shadow-card space-y-6">
      {/* Header Catatan Internal */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-black" aria-hidden="true" />
          <h2 className="text-base sm:text-lg font-black text-black">
            Catatan Internal Tim
          </h2>
        </div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-900 border border-amber-200 text-xs font-bold self-start sm:self-auto">
          <Lock className="w-3.5 h-3.5 text-amber-700" aria-hidden="true" />
          <span>Hanya Terlihat Internal Perusahaan</span>
        </div>
      </div>

      <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed">
        Catatan evaluasi ini bersifat rahasia dan tidak pernah dibagikan kepada pelamar. Gunakan untuk mencatat hasil review kualifikasi, rekam wawancara, atau pertimbangan tim HR.
      </p>

      {/* Form Input Catatan Baru */}
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label htmlFor="internal-note-input" className="sr-only">
            Tulis catatan internal kandidat
          </label>
          <textarea
            id="internal-note-input"
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
            maxLength={2000}
            rows={3}
            placeholder="Tuliskan hasil evaluasi, kelebihan, atau catatan tim untuk kandidat ini..."
            className="w-full p-4 rounded-2xl bg-[#FAF8F0] border border-black/[0.08] text-xs sm:text-sm text-black placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-black focus:bg-white transition resize-none font-medium"
          />
        </div>

        <div className="flex items-center justify-between gap-4">
          <span className="text-[11px] text-slate-500 font-medium">
            {noteText.length}/2000 karakter
          </span>

          <button
            type="submit"
            disabled={isSubmitting || !noteText.trim()}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-[#FFDD00] hover:bg-[#F5D400] text-black font-bold text-xs sm:text-sm shadow-2xs hover:shadow transition min-h-[44px] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-black" aria-hidden="true" />
                <span>Menyimpan...</span>
              </>
            ) : (
              <>
                <PlusCircle className="w-4 h-4 stroke-[2.5]" aria-hidden="true" />
                <span>Simpan Catatan</span>
              </>
            )}
          </button>
        </div>

        {errorMessage && (
          <div
            role="alert"
            className="flex items-center gap-2 text-xs text-red-600 font-semibold pt-1"
          >
            <AlertCircle className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
            <span>{errorMessage}</span>
          </div>
        )}
      </form>

      {/* Daftar Catatan yang Sudah Ada */}
      <div className="pt-2 border-t border-black/[0.06] space-y-3">
        <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
          Daftar Catatan ({notes.length})
        </h3>

        {notes.length === 0 ? (
          <div className="p-4 rounded-2xl bg-[#FAF8F0] border border-black/[0.04] text-xs text-slate-500 font-medium">
            Belum ada catatan internal untuk kandidat ini. Tuliskan catatan evaluasi pertama tim Anda di atas.
          </div>
        ) : (
          <div className="space-y-3">
            {notes.map((item) => {
              const isDeleting = deletingId === item.id;
              const isAuthor = item.author_id === currentUserId;

              return (
                <div
                  key={item.id}
                  className="p-4 rounded-2xl bg-[#FAF8F0] border border-black/[0.06] space-y-2 group"
                >
                  <div className="flex items-center justify-between gap-2 text-xs">
                    <span className="inline-flex items-center gap-1.5 text-slate-500 font-medium">
                      <Clock className="w-3.5 h-3.5" aria-hidden="true" />
                      <span>{formatDateIndo(item.created_at)}</span>
                    </span>

                    {isAuthor && (
                      <button
                        type="button"
                        onClick={() => handleDelete(item.id)}
                        disabled={isDeleting}
                        className="inline-flex items-center gap-1 text-slate-500 hover:text-red-600 transition text-[11px] font-semibold min-h-[44px] px-2.5 cursor-pointer disabled:opacity-50"
                        aria-label="Hapus catatan internal ini"
                      >
                        {isDeleting ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" aria-hidden="true" />
                        ) : (
                          <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                        )}
                        <span>Hapus</span>
                      </button>
                    )}
                  </div>

                  <p className="text-xs sm:text-sm text-slate-800 font-medium leading-relaxed whitespace-pre-wrap">
                    {item.note}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
