"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import {
  Send,
  FileText,
  AlertCircle,
  LogIn,
  ShieldAlert,
  Info,
  Upload,
  X,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import {
  COVER_LETTER_MAX,
  validateCvFile,
  CV_ERROR_MESSAGE,
  CV_BUCKET,
  buildCvPath,
} from "@/lib/validation/lamaran";

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
  jobId,
  jobTitle,
  jobSlug,
  companyName,
  isOpen,
  isLoggedIn,
  userRole = "user",
}: FormLamaranProps) {
  const [coverLetter, setCoverLetter] = useState("");
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [aiConsent, setAiConsent] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setFileError(null);
    setErrorMessage(null);
    const file = e.target.files?.[0];
    if (!file) {
      setCvFile(null);
      return;
    }

    const validation = await validateCvFile(file);
    if (!validation.ok) {
      setCvFile(null);
      setFileError(validation.message || CV_ERROR_MESSAGE);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      return;
    }

    setCvFile(file);
  };

  const handleRemoveFile = () => {
    setCvFile(null);
    setFileError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setFileError(null);

    if (!cvFile) {
      setFileError("Silakan unggah berkas CV Anda terlebih dahulu.");
      return;
    }

    if (coverLetter.length > COVER_LETTER_MAX) {
      setErrorMessage(`Surat pengantar maksimal ${COVER_LETTER_MAX} karakter.`);
      return;
    }

    setIsUploading(true);
    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setErrorMessage("Sesi masuk Anda telah berakhir. Silakan masuk kembali.");
        setIsUploading(false);
        return;
      }

      // Unggah berkas CV ke bucket privat cvs di Supabase Storage
      const cvPath = buildCvPath(user.id, jobId);
      const { error: uploadError } = await supabase.storage
        .from(CV_BUCKET)
        .upload(cvPath, cvFile, {
          upsert: true,
          contentType: "application/pdf",
        });

      if (uploadError) {
        setErrorMessage(
          "Gagal mengunggah berkas CV ke penyimpanan aman. Silakan coba kembali."
        );
        setIsUploading(false);
        return;
      }

      setIsUploading(false);
    } catch {
      setErrorMessage("Terjadi gangguan koneksi saat mengunggah CV.");
      setIsUploading(false);
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
        {/* Kolom Unggah Berkas CV */}
        <div className="space-y-2">
          <label
            htmlFor="cv-file"
            className="text-sm font-bold text-slate-900 flex items-center justify-between"
          >
            <span>
              Berkas CV (Curriculum Vitae) <span className="text-red-500">*</span>
            </span>
            <span className="text-xs font-semibold text-slate-500">
              PDF, Maksimal 2 MB
            </span>
          </label>

          <input
            ref={fileInputRef}
            id="cv-file"
            name="cvFile"
            type="file"
            accept=".pdf,application/pdf"
            onChange={handleFileChange}
            className="sr-only"
          />

          {!cvFile ? (
            <div
              onClick={() => fileInputRef.current?.click()}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  fileInputRef.current?.click();
                }
              }}
              tabIndex={0}
              role="button"
              aria-label="Pilih berkas CV format PDF maksimal 2 MB"
              className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition ${
                fileError
                  ? "border-red-300 bg-red-50/40 hover:bg-red-50/70"
                  : "border-black/[0.12] bg-[#FAF8F0]/50 hover:bg-[#FAF8F0] hover:border-black/30"
              }`}
            >
              <div className="w-12 h-12 rounded-full bg-white border border-black/[0.08] flex items-center justify-center mx-auto text-slate-700 shadow-2xs mb-3">
                <Upload className="w-5 h-5 text-slate-700" aria-hidden="true" />
              </div>
              <p className="text-sm font-bold text-slate-900">
                Pilih Berkas CV Anda
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Format resmi wajib PDF dengan ukuran maksimal 2 MB
              </p>
            </div>
          ) : (
            <div className="p-4 rounded-2xl bg-white border border-black/[0.12] shadow-2xs flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center shrink-0 text-amber-900 font-bold text-xs border border-amber-200">
                  PDF
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-slate-900 truncate">
                    {cvFile.name}
                  </p>
                  <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" aria-hidden="true" />
                    <span>
                      {(cvFile.size / (1024 * 1024)).toFixed(2)} MB • Berkas siap dikirim
                    </span>
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleRemoveFile}
                className="p-2 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 transition min-w-[44px] min-h-[44px] flex items-center justify-center shrink-0"
                aria-label="Hapus berkas CV yang dipilih"
              >
                <X className="w-5 h-5" aria-hidden="true" />
              </button>
            </div>
          )}

          {fileError && (
            <p className="text-xs text-red-600 font-semibold flex items-center gap-1 mt-1">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
              <span>{fileError}</span>
            </p>
          )}
        </div>

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

        {/* Kotak Centang Analisis AI (Opsional) */}
        <div className="p-4 sm:p-5 rounded-2xl bg-[#FAF8F0] border border-black/[0.08] space-y-3">
          <label
            htmlFor="ai-consent"
            className="flex items-start gap-3 cursor-pointer select-none"
          >
            <input
              type="checkbox"
              id="ai-consent"
              name="aiConsent"
              checked={aiConsent}
              onChange={(e) => setAiConsent(e.target.checked)}
              className="mt-1 h-5 w-5 rounded-md border-black/20 text-[#0A2540] focus:ring-black focus:ring-offset-0 cursor-pointer accent-[#0A2540]"
            />
            <div className="space-y-1">
              <span className="text-sm font-bold text-slate-900 block">
                Izinkan analisis kecocokan berkas dengan bantuan AI (Opsional)
              </span>
              <p className="text-xs text-slate-600 leading-relaxed font-medium">
                Sistem akan membaca ringkasan kualifikasi CV Anda dan memberikan saran estimasi kecocokan kepada HRD perusahaan mitra.
              </p>
            </div>
          </label>
          <div className="text-[11px] text-slate-500 bg-white/80 p-3 rounded-xl border border-black/[0.04] leading-normal flex items-start gap-2">
            <Info className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" aria-hidden="true" />
            <span>
              Catatan: Analisis ini hanya berperan sebagai panduan awal bagi rekruter. Keputusan seleksi berkas, panggilan wawancara, dan penerimaan tetap 100% diputuskan oleh manusia.
            </span>
          </div>
        </div>

        {/* Tombol Kirim Lamaran */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={isUploading}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full bg-[#FFDD00] hover:bg-[#F2D200] active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed text-black font-black text-sm transition shadow-card border border-black/10 min-h-[44px]"
          >
            {isUploading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-black" aria-hidden="true" />
                <span>Mengunggah Berkas CV...</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4" aria-hidden="true" />
                <span>Kirim Lamaran</span>
              </>
            )}
          </button>
        </div>
      </form>
    </section>
  );
}
