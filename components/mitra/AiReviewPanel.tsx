"use client";

import React from "react";
import {
  Sparkles,
  CheckCircle2,
  XCircle,
  HelpCircle,
  AlertTriangle,
  Clock,
  ShieldAlert,
} from "lucide-react";

export interface AiReviewData {
  id: number;
  status: "pending" | "processing" | "done" | "failed" | "skipped";
  score: number | null;
  level: "tinggi" | "sedang" | "rendah" | null;
  summary: string | null;
  matched_skills: string[] | null;
  missing_skills: string[] | null;
  interview_questions: string[] | null;
  suspicious: boolean | null;
  attempts: number | null;
  error_message: string | null;
  model: string | null;
  completed_at: string | null;
}

interface AiReviewPanelProps {
  applicationId: number;
  aiConsent: boolean;
  jobAiScreening: boolean;
  review: AiReviewData | null;
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

export function AiReviewPanel({
  aiConsent,
  jobAiScreening,
  review,
}: AiReviewPanelProps) {
  // 1. Kasus Pelamar Tidak Menyetujui Analisis AI
  if (!aiConsent) {
    return (
      <div className="bg-white rounded-3xl border border-black/[0.08] p-6 sm:p-7 shadow-card space-y-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500">
            <Sparkles className="w-4 h-4" aria-hidden="true" />
          </div>
          <h2 className="text-base sm:text-lg font-black text-black">
            Evaluasi Berbantuan AI
          </h2>
        </div>
        <div className="p-4 rounded-2xl bg-[#FAF8F0] border border-black/[0.06] text-xs sm:text-sm text-slate-600 font-medium leading-relaxed">
          Pelamar memilih untuk tidak menggunakan fitur analisis berbantuan AI saat mengirimkan berkas lamaran. Peninjauan kualifikasi dilakukan secara manual melalui dokumen CV terlampir.
        </div>
      </div>
    );
  }

  // 2. Kasus Lowongan Tidak Mengaktifkan Screening AI
  if (!jobAiScreening) {
    return (
      <div className="bg-white rounded-3xl border border-black/[0.08] p-6 sm:p-7 shadow-card space-y-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500">
            <Sparkles className="w-4 h-4" aria-hidden="true" />
          </div>
          <h2 className="text-base sm:text-lg font-black text-black">
            Evaluasi Berbantuan AI
          </h2>
        </div>
        <div className="p-4 rounded-2xl bg-[#FAF8F0] border border-black/[0.06] text-xs sm:text-sm text-slate-600 font-medium leading-relaxed">
          Fitur screening AI tidak diaktifkan pada lowongan pekerjaan ini. Seluruh berkas diproses secara manual oleh tim rekruter perusahaan.
        </div>
      </div>
    );
  }

  // 3. Kasus Sedang Diproses
  if (review?.status === "processing") {
    return (
      <div className="bg-white rounded-3xl border border-black/[0.08] p-6 sm:p-7 shadow-card space-y-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#FFDD00]/30 flex items-center justify-center text-black">
              <Sparkles className="w-4 h-4 animate-spin" aria-hidden="true" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-black">
                Evaluasi AI Sedang Diproses
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                Sistem sedang menganalisis dokumen CV terhadap kriteria pekerjaan
              </p>
            </div>
          </div>
          <span className="px-3 py-1 rounded-full bg-amber-50 text-amber-900 border border-amber-200 text-xs font-bold">
            Memproses
          </span>
        </div>
        <div className="p-5 rounded-2xl bg-[#FAF8F0] border border-black/[0.06] flex items-center gap-3">
          <Clock className="w-5 h-5 text-amber-600 shrink-0" aria-hidden="true" />
          <p className="text-xs sm:text-sm text-slate-700 font-medium">
            Analisis kesesuaian keahlian dan riwayat kandidat sedang berlangsung. Halaman akan menampilkan hasil ringkasan begitu pemrosesan selesai.
          </p>
        </div>
      </div>
    );
  }

  // 4. Kasus Dilewati (Skipped)
  if (review?.status === "skipped") {
    return (
      <div className="bg-white rounded-3xl border border-black/[0.08] p-6 sm:p-7 shadow-card space-y-3">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600">
              <AlertTriangle className="w-4 h-4" aria-hidden="true" />
            </div>
            <h2 className="text-base sm:text-lg font-black text-black">
              Evaluasi AI Dilewati
            </h2>
          </div>
          <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200 text-xs font-bold">
            Dilewati
          </span>
        </div>
        <div className="p-4 rounded-2xl bg-[#FAF8F0] border border-black/[0.06] text-xs sm:text-sm text-slate-700 font-medium leading-relaxed">
          {review.error_message ||
            "Analisis AI dilewati untuk lamaran ini. Anda tetap dapat meninjau berkas CV kandidat secara manual."}
        </div>
      </div>
    );
  }

  // 5. Kasus Gagal (Failed)
  if (review?.status === "failed") {
    return (
      <div className="bg-white rounded-3xl border border-red-200 p-6 sm:p-7 shadow-card space-y-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-red-50 flex items-center justify-center text-red-600">
              <AlertTriangle className="w-4 h-4" aria-hidden="true" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-black">
                Evaluasi AI Belum Berhasil
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                Percobaan {review.attempts || 1} dari 3 kali
              </p>
            </div>
          </div>
          <span className="px-3 py-1 rounded-full bg-red-50 text-red-800 border border-red-200 text-xs font-bold">
            Gagal
          </span>
        </div>
        <div className="p-4 rounded-2xl bg-red-50/50 border border-red-100 text-xs sm:text-sm text-red-800 font-medium leading-relaxed">
          {review.error_message ||
            "Terjadi kendala saat memproses berkas CV. Silakan periksa kembali berkas CV atau lakukan analisis ulang."}
        </div>
      </div>
    );
  }

  // 6. Kasus Belum Ada Review
  if (!review || review.status === "pending") {
    return (
      <div className="bg-white rounded-3xl border border-black/[0.08] p-6 sm:p-7 shadow-card space-y-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-[#FAF8F0] flex items-center justify-center text-slate-700">
            <Sparkles className="w-4 h-4" aria-hidden="true" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-black text-black">
              Evaluasi Berbantuan AI
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              Pelamar telah menyetujui evaluasi kesesuaian kualifikasi
            </p>
          </div>
        </div>
        <div className="p-4 rounded-2xl bg-[#FAF8F0] border border-black/[0.06] text-xs sm:text-sm text-slate-600 font-medium leading-relaxed">
          Berkas lamaran ini siap diproses untuk analisis kecocokan profil dengan kriteria lowongan pekerjaan.
        </div>
      </div>
    );
  }

  // 7. Kasus Berhasil (Done): Tampilan Panel Hasil Review AI Gaya Landing Page
  const score = review.score ?? 0;
  const level = review.level || "sedang";

  let levelBadgeStyle = "bg-amber-100 text-amber-950 border-amber-300";
  let levelLabel = "Kesesuaian Sedang";

  if (level === "tinggi") {
    levelBadgeStyle = "bg-emerald-100 text-emerald-950 border-emerald-300";
    levelLabel = "Kesesuaian Tinggi";
  } else if (level === "rendah") {
    levelBadgeStyle = "bg-rose-100 text-rose-950 border-rose-300";
    levelLabel = "Kesesuaian Rendah";
  }

  const matched = review.matched_skills || [];
  const missing = review.missing_skills || [];
  const questions = review.interview_questions || [];

  return (
    <div className="bg-white rounded-3xl border border-black/[0.08] p-6 sm:p-8 shadow-card space-y-6">
      {/* Header Panel Review */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-black/[0.06]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#FFDD00] text-black flex items-center justify-center shrink-0 shadow-2xs font-bold">
            <Sparkles className="w-5 h-5" aria-hidden="true" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-black text-black">
                Hasil Review Kecocokan AI
              </h2>
            </div>
            <p className="text-xs text-slate-500 font-medium">
              Objektif tanpa bias demografi • Selesai{" "}
              {review.completed_at ? formatDateIndo(review.completed_at) : "baru saja"}
            </p>
          </div>
        </div>

        {/* Skor & Level Pill Bergaya Landing Page */}
        <div className="flex items-center gap-2.5">
          <span
            className={`px-3 py-1 rounded-full text-xs font-extrabold border ${levelBadgeStyle}`}
          >
            {levelLabel}
          </span>
          <div className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-2xl bg-[#FFDD00] text-[#0D0C23] font-black text-sm border border-black/[0.1] shadow-2xs">
            <span>Skor</span>
            <span className="text-base font-black">{score}</span>
            <span className="text-xs opacity-75 font-bold">/100</span>
          </div>
        </div>
      </div>

      {/* Peringatan Integritas Jika Terdeteksi Upaya Manipulasi (Suspicious) */}
      {review.suspicious && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-300 text-amber-950 flex items-start gap-3">
          <ShieldAlert className="w-5 h-5 text-amber-800 shrink-0 mt-0.5" aria-hidden="true" />
          <div className="space-y-1 text-xs">
            <strong className="font-extrabold text-amber-950 block">
              Indikasi Manipulasi Prompt Terdeteksi pada Dokumen CV
            </strong>
            <p className="leading-relaxed text-amber-900">
              Sistem menemukan instruksi tersembunyi atau kalimat manipulatif yang mencoba memengaruhi sistem penilaian. Sistem telah menetralkan instruksi tersebut dan mengevaluasi profil murni berdasarkan bukti keahlian yang nyata.
            </p>
          </div>
        </div>
      )}

      {/* Ringkasan Analisis AI */}
      {review.summary && (
        <div className="space-y-2">
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-600">
            Ringkasan Pertimbangan AI
          </h3>
          <div className="p-4 sm:p-5 rounded-2xl bg-[#FAF8F0] border border-black/[0.06] text-xs sm:text-sm text-slate-800 font-medium leading-relaxed">
            {review.summary}
          </div>
        </div>
      )}

      {/* Grid Dua Kolom: Keahlian Cocok vs Belum Terpenuhi */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Kolom Keahlian Cocok */}
        <div className="p-5 rounded-2xl bg-[#FAF8F0] border border-black/[0.06] space-y-3">
          <div className="flex items-center gap-2 text-emerald-800">
            <CheckCircle2 className="w-4 h-4 shrink-0" aria-hidden="true" />
            <h4 className="text-xs font-black uppercase tracking-wider">
              Keahlian yang Sesuai ({matched.length})
            </h4>
          </div>
          {matched.length === 0 ? (
            <p className="text-xs text-slate-500 font-medium italic">
              Tidak ada keahlian wajib yang terbukti secara eksplisit pada CV.
            </p>
          ) : (
            <div className="flex flex-wrap gap-1.5">
              {matched.map((skill, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-1 rounded-lg bg-white border border-emerald-200 text-emerald-950 text-xs font-bold shadow-2xs"
                >
                  {skill}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Kolom Keahlian Belum Terpenuhi */}
        <div className="p-5 rounded-2xl bg-[#FAF8F0] border border-black/[0.06] space-y-3">
          <div className="flex items-center gap-2 text-rose-800">
            <XCircle className="w-4 h-4 shrink-0" aria-hidden="true" />
            <h4 className="text-xs font-black uppercase tracking-wider">
              Keahlian Belum Ditemukan ({missing.length})
            </h4>
          </div>
          {missing.length === 0 ? (
            <p className="text-xs text-slate-500 font-medium italic">
              Seluruh keahlian yang disyaratkan lowongan telah ditemukan pada CV.
            </p>
          ) : (
            <div className="flex flex-wrap gap-1.5">
              {missing.map((skill, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-1 rounded-lg bg-white border border-rose-200 text-rose-950 text-xs font-bold shadow-2xs"
                >
                  {skill}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Rekomendasi Pertanyaan Wawancara */}
      {questions.length > 0 && (
        <div className="space-y-3 pt-2">
          <div className="flex items-center gap-2">
            <HelpCircle className="w-4 h-4 text-black" aria-hidden="true" />
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-700">
              Rekomendasi Pertanyaan Wawancara Teknis
            </h3>
          </div>
          <div className="space-y-2.5">
            {questions.map((q, idx) => (
              <div
                key={idx}
                className="flex items-start gap-3 p-3.5 rounded-2xl bg-[#FAF8F0] border border-black/[0.06]"
              >
                <span className="w-5 h-5 rounded-full bg-white border border-black/[0.1] text-black font-black text-xs flex items-center justify-center shrink-0">
                  {idx + 1}
                </span>
                <p className="text-xs sm:text-sm text-slate-800 font-medium leading-relaxed">
                  {q}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
