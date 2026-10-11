"use client";

import { useState } from "react";
import Link from "next/link";
import { Send, FileText, AlertCircle, LogIn, ShieldAlert } from "lucide-react";
import { COVER_LETTER_MAX } from "@/lib/validation/lamaran";

export interface FormLamaranProps {
  jobId: number;
  jobTitle: string;
  jobSlug: string;
  companyName: string;
  isOpen: boolean;
  isLoggedIn: boolean;
  userRole?: string | null;
}

export function FormLamaran({
  jobTitle,
  jobSlug,
  companyName,
  isOpen,
  isLoggedIn,
  userRole = "user",
}: FormLamaranProps) {
  const [coverLetter, setCoverLetter] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Jika lowongan sudah ditutup oleh perusahaan atau moderator
  if (!isOpen) {
    return (
      <section
        id="formulir-lamaran"
        aria-label="Status Lowongan Ditutup"
        className="bg-white rounded-[28px] border border-black/[0.08] p-6 sm:p-8 shadow-card text-center space-y-3"
      >
        <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-500">
          <ShieldAlert className="w-6 h-6" aria-hidden="true" />
        </div>
        <h2 className="text-xl font-black text-black tracking-tight">
          Penerimaan Lamaran Telah Ditutup
        </h2>
        <p className="text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
          Lowongan untuk posisi <span className="font-semibold">{jobTitle}</span> di {companyName} sudah tidak menerima lamaran baru. Silakan eksplorasi lowongan aktif lainnya.
        </p>
        <div className="pt-2">
          <Link
            href="/lowongan"
            className="inline-flex items-center justify-center px-6 py-3 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-900 font-bold text-sm transition min-h-[44px]"
          >
            Lihat Lowongan Lain
          </Link>
        </div>
      </section>
    );
  }

  // Jika pengunjung belum login
  if (!isLoggedIn) {
    return (
      <section
        id="formulir-lamaran"
        aria-label="Ajakan Masuk Akun untuk Melamar"
        className="bg-white rounded-[28px] border border-black/[0.08] p-6 sm:p-8 shadow-card text-center space-y-4"
      >
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFDD00] text-black text-xs font-bold border border-black/10">
          <LogIn className="w-3.5 h-3.5" aria-hidden="true" />
          <span>Wajib Masuk Akun</span>
        </div>
        <div className="space-y-1.5">
          <h2 className="text-2xl font-black text-black tracking-tight">
            Tertarik Mengisi Posisi Ini?
          </h2>
          <p className="text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
            Masuk ke akun pencari kerja Anda untuk mengirimkan lamaran resmi dan CV langsung kepada {companyName}.
          </p>
        </div>
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href={`/login?redirectTo=/lowongan/${jobSlug}#formulir-lamaran`}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-[#FFDD00] hover:bg-[#F2D200] text-black font-black text-sm transition shadow-2xs border border-black/10 min-h-[44px]"
          >
            <LogIn className="w-4 h-4" aria-hidden="true" />
            <span>Masuk untuk Melamar</span>
          </Link>
          <Link
            href="/register"
            className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-sm transition min-h-[44px]"
          >
            Daftar Akun Baru
          </Link>
        </div>
      </section>
    );
  }

  // Jika akun yang login bukan pencari kerja (misalnya mitra perusahaan atau admin)
  if (userRole && userRole !== "user") {
    return (
      <section
        id="formulir-lamaran"
        aria-label="Pemberitahuan Peran Akun"
        className="bg-amber-50/80 rounded-[28px] border border-amber-200/80 p-6 sm:p-8 text-center space-y-3"
      >
        <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center mx-auto text-amber-800">
          <ShieldAlert className="w-6 h-6" aria-hidden="true" />
        </div>
        <h2 className="text-xl font-black text-amber-950 tracking-tight">
          Akses Khusus Akun Pencari Kerja
        </h2>
        <p className="text-sm text-amber-900/80 max-w-md mx-auto leading-relaxed">
          Anda sedang masuk dengan akun berstatus <span className="font-bold capitalize">{userRole === "company" ? "Mitra Perusahaan" : userRole}</span>. Formulir lamaran kerja hanya dapat diajukan oleh akun Pencari Kerja.
        </p>
      </section>
    );
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (coverLetter.length > COVER_LETTER_MAX) {
      setErrorMessage(`Surat pengantar maksimal ${COVER_LETTER_MAX} karakter.`);
      return;
    }
  };

  return (
    <section
      id="formulir-lamaran"
      aria-label="Formulir Lamaran Pekerjaan"
      className="bg-white rounded-[28px] sm:rounded-[36px] border border-black/[0.08] p-6 sm:p-9 shadow-card space-y-6"
    >
      {/* Header Formulir */}
      <div className="space-y-2 border-b border-black/[0.06] pb-5">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFDD00] text-black text-xs font-bold border border-black/10">
          <FileText className="w-3.5 h-3.5" aria-hidden="true" />
          <span>Formulir Lamaran Resmi</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-black text-black tracking-tight">
          Kirim Lamaran Pekerjaan
        </h2>
        <p className="text-sm text-slate-600 leading-relaxed font-medium">
          Lengkapi surat pengantar dan pastikan informasi yang Anda berikan akurat untuk posisi <span className="font-bold text-slate-900">{jobTitle}</span> di {companyName}.
        </p>
      </div>

      {/* Pesan Kesalahan */}
      {errorMessage && (
        <div
          role="alert"
          className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-start gap-2.5 font-medium"
        >
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-600" aria-hidden="true" />
          <span className="leading-snug">{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate className="space-y-5">
        {/* Kolom Surat Pengantar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label
              htmlFor="cover-letter"
              className="text-sm font-bold text-slate-900"
            >
              Surat Pengantar Singkat <span className="text-xs font-normal text-slate-500">(Opsional)</span>
            </label>
            <span
              className={`text-xs font-semibold ${
                coverLetter.length > COVER_LETTER_MAX ? "text-red-600" : "text-slate-500"
              }`}
            >
              {coverLetter.length} / {COVER_LETTER_MAX}
            </span>
          </div>
          <textarea
            id="cover-letter"
            name="coverLetter"
            rows={4}
            maxLength={COVER_LETTER_MAX}
            value={coverLetter}
            onChange={(e) => setCoverLetter(e.target.value)}
            placeholder="Tuliskan perkenalan singkat, ketertarikan Anda pada posisi ini, atau catatan tambahan untuk HRD..."
            className="w-full rounded-2xl border border-black/[0.12] bg-[#FAF8F0]/40 p-4 text-sm text-slate-900 placeholder:text-slate-400 focus:border-black focus:bg-white focus:outline-none focus:ring-2 focus:ring-black/10 transition resize-y min-h-[110px]"
          />
        </div>

        {/* Tombol Kirim Lamaran */}
        <div className="pt-2">
          <button
            type="submit"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full bg-[#FFDD00] hover:bg-[#F2D200] active:scale-[0.99] text-black font-black text-sm transition shadow-card border border-black/10 min-h-[44px]"
          >
            <Send className="w-4 h-4" aria-hidden="true" />
            <span>Kirim Lamaran</span>
          </button>
        </div>
      </form>
    </section>
  );
}
