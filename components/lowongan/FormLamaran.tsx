"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import {
  Send,
  FileText,
  AlertCircle,
  LogIn,
  ShieldAlert,
  Upload,
  X,
  CheckCircle2,
  Loader2,
  Zap,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import {
  COVER_LETTER_MAX,
  validateCvFile,
  CV_ERROR_MESSAGE,
  CV_BUCKET,
  buildCvPath,
} from "@/lib/validation/lamaran";
import {
  convertCvImageToPdf,
  isSupportedCvFile,
  SUPPORTED_CV_ACCEPT,
} from "@/lib/cv/image-to-pdf";
import { useLanguage } from "@/lib/i18n";

export interface FormLamaranProps {
  jobId: number;
  jobTitle: string;
  jobSlug: string;
  companyName: string;
  isOpen: boolean;
  isExpired?: boolean;
  deadline?: string | null;
  isLoggedIn: boolean;
  userRole?: string | null;
  hasApplied?: boolean;
  existingApplicationId?: number | null;
  hasDefaultCv?: boolean;
}

export function FormLamaran({
  jobId,
  jobTitle,
  jobSlug,
  companyName,
  isOpen,
  isExpired = false,
  deadline,
  isLoggedIn,
  userRole = "user",
  hasApplied = false,
  existingApplicationId,
  hasDefaultCv = false,
}: FormLamaranProps) {
  const { t, language } = useLanguage();
  const [coverLetter, setCoverLetter] = useState("");
  const [useDefaultCv, setUseDefaultCv] = useState<boolean>(hasDefaultCv);
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isConvertingCv, setIsConvertingCv] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [alreadyApplied, setAlreadyApplied] = useState(hasApplied);
  const [submittedAppId, setSubmittedAppId] = useState<number | null>(null);
  const appId = existingApplicationId || submittedAppId;
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setFileError(null);
    setErrorMessage(null);
    const file = e.target.files?.[0];
    if (!file) {
      setCvFile(null);
      return;
    }

    if (!isSupportedCvFile(file)) {
      setCvFile(null);
      setFileError(
        t(
          "Berkas harus berformat PDF, JPG, PNG, atau WEBP.",
          "File must be in PDF, JPG, PNG, or WEBP format."
        )
      );
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      return;
    }

    try {
      setIsConvertingCv(true);
      // Konversi otomatis foto/gambar CV ke PDF resmi
      const pdfFile = await convertCvImageToPdf(file);
      const validation = await validateCvFile(pdfFile);
      if (!validation.ok) {
        setCvFile(null);
        setFileError(validation.message || CV_ERROR_MESSAGE);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
        return;
      }

      setCvFile(pdfFile);
    } catch {
      setCvFile(null);
      setFileError(
        t(
          "Gagal memproses berkas CV. Pastikan berkas gambar atau PDF valid.",
          "Failed to process CV file. Ensure image or PDF format is valid."
        )
      );
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } finally {
      setIsConvertingCv(false);
    }
  };

  const handleRemoveFile = () => {
    setCvFile(null);
    setFileError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Jika lowongan sudah ditutup oleh perusahaan atau masa pendaftaran telah berakhir
  if (!isOpen || isExpired) {
    const formattedDeadline = deadline
      ? new Intl.DateTimeFormat(language === "en" ? "en-US" : "id-ID", {
          day: "numeric",
          month: "long",
          year: "numeric",
        }).format(new Date(deadline))
      : null;

    return (
      <section
        id="formulir-lamaran"
        aria-label={isExpired ? t("Batas Waktu Lamaran Telah Berakhir") : t("Status Lowongan Ditutup")}
        className="bg-white rounded-[28px] border border-black/[0.08] p-6 sm:p-8 shadow-card text-center space-y-3"
      >
        <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-500">
          <ShieldAlert className="w-6 h-6" aria-hidden="true" />
        </div>
        <h2 className="text-xl font-black text-black tracking-tight">
          {isExpired ? t("Batas Waktu Lamaran Berakhir") : t("Penerimaan Lamaran Telah Ditutup")}
        </h2>
        <p className="text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
          {isExpired
            ? (language === "en"
                ? `The application period for ${jobTitle} at ${companyName} has ended${
                    formattedDeadline ? ` on ${formattedDeadline}` : ""
                  }. Please explore other active vacancies.`
                : `Masa penerimaan berkas untuk posisi ${jobTitle} di ${companyName} telah berakhir${
                    formattedDeadline ? ` pada ${formattedDeadline}` : ""
                  }. Silakan eksplorasi lowongan aktif lainnya.`)
            : (language === "en"
                ? `Applications for ${jobTitle} at ${companyName} are no longer accepted. Please explore other active vacancies.`
                : `Lowongan untuk posisi ${jobTitle} di ${companyName} sudah tidak menerima lamaran baru. Silakan eksplorasi lowongan aktif lainnya.`)}
        </p>
        <div className="pt-2">
          <Link
            href="/lowongan"
            className="inline-flex items-center justify-center px-6 py-3 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-900 font-bold text-sm transition min-h-[44px]"
          >
            {t("Lihat Lowongan Lain")}
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
        aria-label={t("Ajakan Masuk Akun untuk Melamar", "Sign in invitation to apply")}
        className="bg-white rounded-[28px] border border-black/[0.08] p-6 sm:p-8 shadow-card text-center space-y-4"
      >
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFDD00] text-black text-xs font-bold border border-black/10">
          <LogIn className="w-3.5 h-3.5" aria-hidden="true" />
          <span>{t("Wajib Masuk Akun")}</span>
        </div>
        <div className="space-y-1.5">
          <h2 className="text-2xl font-black text-black tracking-tight">
            {t("Tertarik Mengisi Posisi Ini?")}
          </h2>
          <p className="text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
            {language === "en"
              ? `Sign in to your job seeker account to submit your official application and CV directly to ${companyName}.`
              : `Masuk ke akun pencari kerja Anda untuk mengirimkan lamaran resmi dan CV langsung kepada ${companyName}.`}
          </p>
        </div>
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href={`/login?redirectTo=/lowongan/${jobSlug}#formulir-lamaran`}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-[#FFDD00] hover:bg-[#F2D200] text-black font-black text-sm transition shadow-2xs border border-black/10 min-h-[44px]"
          >
            <LogIn className="w-4 h-4" aria-hidden="true" />
            <span>{t("Masuk untuk Melamar")}</span>
          </Link>
          <Link
            href="/register"
            className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-sm transition min-h-[44px]"
          >
            {t("Daftar Akun Baru")}
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
        aria-label={t("Pemberitahuan Peran Akun", "Account role notice")}
        className="bg-amber-50/80 rounded-[28px] border border-amber-200/80 p-6 sm:p-8 text-center space-y-3"
      >
        <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center mx-auto text-amber-800">
          <ShieldAlert className="w-6 h-6" aria-hidden="true" />
        </div>
        <h2 className="text-xl font-black text-amber-950 tracking-tight">
          {t("Akses Khusus Akun Pencari Kerja")}
        </h2>
        <p className="text-sm text-amber-900/80 max-w-md mx-auto leading-relaxed">
          {language === "en"
            ? `You are logged in with role: ${userRole === "company" ? "Partner Company" : userRole}. Job application forms can only be submitted by Job Seeker accounts.`
            : `Anda sedang masuk dengan akun berstatus ${userRole === "company" ? "Mitra Perusahaan" : userRole}. Formulir lamaran kerja hanya dapat diajukan oleh akun Pencari Kerja.`}
        </p>
      </section>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setFileError(null);

    if (!isOpen || isExpired) {
      setErrorMessage(
        isExpired
          ? "Batas waktu penerimaan lamaran untuk lowongan ini telah berakhir."
          : "Lowongan ini sudah ditutup dan tidak menerima lamaran baru."
      );
      return;
    }

    if (!useDefaultCv && !cvFile) {
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

      const cvPath = buildCvPath(user.id, jobId);

      if (useDefaultCv) {
        // Gunakan CV profil utama: salin default-cv.pdf ke cvPath lowongan ini
        const defaultSource = `${user.id}/default-cv.pdf`;
        const { error: copyError } = await supabase.storage
          .from(CV_BUCKET)
          .copy(defaultSource, cvPath);

        if (copyError) {
          // Fallback download buffer lalu upload jika copy langsung storage dibatasi
          const { data: fileData, error: downloadError } = await supabase.storage
            .from(CV_BUCKET)
            .download(defaultSource);

          if (downloadError || !fileData) {
            setErrorMessage(
              "Gagal mengambil CV utama profil. Silakan pilih opsi unggah berkas CV baru."
            );
            setIsUploading(false);
            return;
          }

          const { error: fallbackUploadError } = await supabase.storage
            .from(CV_BUCKET)
            .upload(cvPath, fileData, {
              upsert: true,
              contentType: "application/pdf",
            });

          if (fallbackUploadError) {
            setErrorMessage(
              "Gagal menyimpan berkas CV ke lamaran. Silakan coba kembali."
            );
            setIsUploading(false);
            return;
          }
        }
      } else {
        if (!cvFile) {
          setFileError("Silakan unggah berkas CV Anda terlebih dahulu.");
          setIsUploading(false);
          return;
        }

        // Unggah berkas CV baru ke bucket privat cvs di Supabase Storage
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
      }

      // 2. Simpan baris lamaran dengan status awal 'dikirim'
      const { data: newApp, error: insertError } = await supabase
        .from("applications")
        .insert({
          job_id: jobId,
          user_id: user.id,
          cv_path: cvPath,
          cover_letter: coverLetter.trim() || null,
          ai_consent: false,
          status: "dikirim",
        })
        .select("id")
        .single();

      if (insertError) {
        if (
          insertError.code === "23505" ||
          insertError.message.toLowerCase().includes("unique") ||
          insertError.message.toLowerCase().includes("duplicate")
        ) {
          setAlreadyApplied(true);
          setErrorMessage("Anda sudah pernah mengirimkan lamaran untuk lowongan ini.");
        } else {
          setErrorMessage(
            insertError.message ||
              "Gagal menyimpan data lamaran. Silakan coba kembali."
          );
        }
        setIsUploading(false);
        return;
      }

      setIsUploading(false);
      setIsSuccess(true);
      if (newApp?.id) {
        setSubmittedAppId(newApp.id);
      }
    } catch {
      setErrorMessage("Terjadi gangguan koneksi saat mengirimkan lamaran.");
      setIsUploading(false);
    }
  };

  if (isSuccess) {
    return (
      <section
        id="formulir-lamaran"
        aria-label={t("Lamaran Berhasil Dikirimkan")}
        className="bg-white rounded-[28px] sm:rounded-[36px] border border-black/[0.08] p-6 sm:p-9 shadow-card text-center space-y-5"
      >
        <div className="w-16 h-16 rounded-full bg-emerald-100 border border-emerald-200 flex items-center justify-center mx-auto text-emerald-700 shadow-2xs">
          <CheckCircle2 className="w-8 h-8" aria-hidden="true" />
        </div>
        <div className="space-y-2 max-w-lg mx-auto">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200">
            <span>{t("Lamaran Terkirim")}</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-black tracking-tight">
            {t("Lamaran Anda Berhasil Terkirim")}
          </h2>
          <p className="text-sm text-slate-600 leading-relaxed font-medium">
            {language === "en"
              ? `Your application and CV for ${jobTitle} have been officially received by ${companyName}. The HR team will review your qualifications.`
              : `Berkas lamaran dan CV Anda untuk posisi ${jobTitle} telah resmi diterima oleh ${companyName}. Pihak HRD akan meninjau kualifikasi Anda.`}
          </p>
        </div>
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href={submittedAppId ? `/lamaran-saya/${submittedAppId}` : "/lamaran-saya"}
            className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3.5 rounded-full bg-[#FFDD00] hover:bg-[#F2D200] text-black font-black text-sm transition shadow-card border border-black/10 min-h-[44px]"
          >
            {t("Lihat Status Lamaran Saya")}
          </Link>
          <Link
            href="/lowongan"
            className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-sm transition min-h-[44px]"
          >
            {t("Eksplorasi Lowongan Lain")}
          </Link>
        </div>
      </section>
    );
  }

  if (alreadyApplied) {
    return (
      <section
        id="formulir-lamaran"
        aria-label={t("Status Lamaran Sudah Dikirimkan", "Application status already sent")}
        className="bg-white rounded-[28px] sm:rounded-[36px] border border-black/[0.08] p-6 sm:p-9 shadow-card text-center space-y-4"
      >
        <div className="w-14 h-14 rounded-full bg-blue-50 border border-blue-200 flex items-center justify-center mx-auto text-blue-700 shadow-2xs">
          <CheckCircle2 className="w-7 h-7" aria-hidden="true" />
        </div>
        <div className="space-y-1.5 max-w-md mx-auto">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-800 text-xs font-bold border border-blue-200">
            <span>{t("Sudah Pernah Melamar")}</span>
          </div>
          <h2 className="text-2xl font-black text-black tracking-tight">
            {t("Anda Sudah Melamar Posisi Ini")}
          </h2>
          <p className="text-sm text-slate-600 leading-relaxed font-medium">
            {language === "en"
              ? `You have already submitted an application for ${jobTitle} at ${companyName}. The system prevents duplicate applications for the same opening.`
              : `Anda telah mengirimkan berkas lamaran untuk lowongan ${jobTitle} di ${companyName}. Sistem mencegah pengiriman berkas ganda untuk lowongan yang sama.`}
          </p>
        </div>
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href={appId ? `/lamaran-saya/${appId}` : "/lamaran-saya"}
            className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3.5 rounded-full bg-[#FFDD00] hover:bg-[#F2D200] text-black font-black text-sm transition shadow-card border border-black/10 min-h-[44px]"
          >
            {t("Lihat Status Lamaran Saya")}
          </Link>
          <Link
            href="/lowongan"
            className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-sm transition min-h-[44px]"
          >
            {t("Cari Lowongan Lain")}
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section
      id="formulir-lamaran"
      aria-label={t("Formulir Lamaran Pekerjaan")}
      className="bg-white rounded-[28px] sm:rounded-[36px] border border-black/[0.08] p-6 sm:p-9 shadow-card space-y-6"
    >
      {/* Header Formulir */}
      <div className="space-y-2 border-b border-black/[0.06] pb-5">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFDD00] text-black text-xs font-bold border border-black/10">
          <FileText className="w-3.5 h-3.5" aria-hidden="true" />
          <span>{t("Formulir Lamaran Resmi")}</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-black text-black tracking-tight">
          {t("Kirim Lamaran Pekerjaan")}
        </h2>
        <p className="text-sm text-slate-600 leading-relaxed font-medium">
          {language === "en"
            ? `Complete your cover letter and ensure your info is accurate for ${jobTitle} at ${companyName}.`
            : `Lengkapi surat pengantar dan pastikan informasi yang Anda berikan akurat untuk posisi ${jobTitle} di ${companyName}.`}
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
        {/* Pilihan Sumber CV: Quick Apply vs Unggah Khusus */}
        {hasDefaultCv && (
          <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 space-y-3">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 fill-amber-500 text-amber-600" aria-hidden="true" />
              <span className="text-xs font-bold text-amber-950">
                {t("Fitur Lamar Cepat (Quick Apply)", "Quick Apply Feature")}
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => {
                  setUseDefaultCv(true);
                  setFileError(null);
                }}
                className={`p-3 rounded-xl border text-left text-xs transition cursor-pointer ${
                  useDefaultCv
                    ? "bg-white border-amber-500 ring-2 ring-amber-400 font-bold text-navy-950 shadow-2xs"
                    : "bg-white/70 border-amber-200 text-slate-700 hover:bg-white"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span>{t("Gunakan CV Profil Utama", "Use Main Profile CV")}</span>
                  {useDefaultCv && (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  )}
                </div>
                <p className="text-[11px] text-slate-500 font-normal">
                  {t("CV tersimpan di akun Anda (default-cv.pdf)", "CV saved in your account")}
                </p>
              </button>

              <button
                type="button"
                onClick={() => {
                  setUseDefaultCv(false);
                  setFileError(null);
                }}
                className={`p-3 rounded-xl border text-left text-xs transition cursor-pointer ${
                  !useDefaultCv
                    ? "bg-white border-amber-500 ring-2 ring-amber-400 font-bold text-navy-950 shadow-2xs"
                    : "bg-white/70 border-amber-200 text-slate-700 hover:bg-white"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span>{t("Unggah CV Khusus Lainnya", "Upload Custom CV")}</span>
                  {!useDefaultCv && (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  )}
                </div>
                <p className="text-[11px] text-slate-500 font-normal">
                  {t("Pilih file PDF baru khusus lowongan ini", "Choose a new PDF for this job")}
                </p>
              </button>
            </div>
          </div>
        )}

        {/* Kolom Berkas CV */}
        <div className="space-y-2">
          <label
            htmlFor="cv-file"
            className="text-sm font-bold text-slate-900 flex items-center justify-between"
          >
            <span>
              {t("Berkas CV (Curriculum Vitae)")} <span className="text-red-500">*</span>
            </span>
            <span className="text-xs font-semibold text-slate-500">
              {t("PDF, Maksimal 2 MB")}
            </span>
          </label>

          {useDefaultCv ? (
            <div className="p-4 sm:p-5 rounded-2xl bg-emerald-50/80 border border-emerald-200 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
                  <FileText className="w-5 h-5 text-emerald-700" aria-hidden="true" />
                </div>
                <div className="space-y-0.5 min-w-0">
                  <p className="text-sm font-bold text-emerald-950 truncate">
                    CV-Utama-Pelamar.pdf
                  </p>
                  <p className="text-xs text-emerald-800 font-medium">
                    {t(
                      "Siap dikirimkan otomatis menggunakan berkas CV utama profil Anda",
                      "Ready to submit automatically using your profile main CV"
                    )}
                  </p>
                </div>
              </div>
              <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-800 shrink-0 bg-white/80 px-3 py-1.5 rounded-full border border-emerald-200">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>{t("Quick Apply", "Quick Apply")}</span>
              </span>
            </div>
          ) : (
            <>
              <input
                ref={fileInputRef}
                id="cv-file"
                name="cvFile"
                type="file"
                accept={SUPPORTED_CV_ACCEPT}
                onChange={handleFileChange}
                className="sr-only"
              />

              {!cvFile ? (
                <div
                  onClick={() => !isConvertingCv && fileInputRef.current?.click()}
                  onKeyDown={(e) => {
                    if ((e.key === "Enter" || e.key === " ") && !isConvertingCv) {
                      e.preventDefault();
                      fileInputRef.current?.click();
                    }
                  }}
                  tabIndex={0}
                  role="button"
                  aria-label={t(
                    "Pilih berkas CV format PDF atau foto gambar maksimal 2 MB",
                    "Choose CV PDF or image file maximum 2 MB"
                  )}
                  className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition ${
                    fileError
                      ? "border-red-300 bg-red-50/40 hover:bg-red-50/70"
                      : "border-black/[0.12] bg-[#FAF8F0]/50 hover:bg-[#FAF8F0] hover:border-black/30"
                  }`}
                >
                  {isConvertingCv ? (
                    <div className="py-2 flex flex-col items-center justify-center space-y-2">
                      <Loader2 className="w-8 h-8 text-navy-900 animate-spin" aria-hidden="true" />
                      <p className="text-sm font-bold text-slate-900">
                        {t(
                          "Mengonversi Gambar ke Dokumen PDF...",
                          "Converting Image to PDF Document..."
                        )}
                      </p>
                      <p className="text-xs text-slate-500">
                        {t(
                          "Menyesuaikan resolusi dan tata letak secara otomatis",
                          "Automatically adjusting resolution and layout"
                        )}
                      </p>
                    </div>
                  ) : (
                    <>
                      <div className="w-12 h-12 rounded-full bg-white border border-black/[0.08] flex items-center justify-center mx-auto text-slate-700 shadow-2xs mb-3">
                        <Upload className="w-5 h-5 text-slate-700" aria-hidden="true" />
                      </div>
                      <p className="text-sm font-bold text-slate-900">
                        {t("Pilih Berkas atau Foto CV Anda", "Choose Your CV File or Photo")}
                      </p>
                      <p className="text-xs text-slate-500 mt-1">
                        {t(
                          "Format didukung: PDF, JPG, PNG, atau WEBP (maksimal 2 MB). Foto CV otomatis dirapikan ke dokumen resmi.",
                          "Supported formats: PDF, JPG, PNG, or WEBP (max 2 MB). CV images are automatically formatted."
                        )}
                      </p>
                    </>
                  )}
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
                          {(cvFile.size / (1024 * 1024)).toFixed(2)} MB • {t("Berkas siap dikirim")}
                        </span>
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleRemoveFile}
                    className="p-2 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 transition min-w-[44px] min-h-[44px] flex items-center justify-center shrink-0"
                    aria-label={t("Hapus berkas CV yang dipilih")}
                  >
                    <X className="w-5 h-5" aria-hidden="true" />
                  </button>
                </div>
              )}
            </>
          )}

          {!hasDefaultCv && (
            <p className="text-xs text-slate-500 font-medium">
              Tip: Anda dapat menyimpan CV utama di{" "}
              <Link href="/profil" className="text-navy-900 font-bold hover:underline">
                halaman profil
              </Link>{" "}
              untuk mengaktifkan fitur Quick Apply pada lamaran berikutnya.
            </p>
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
              {t("Surat Pengantar Singkat")} <span className="text-xs font-normal text-slate-500">{t("(Opsional)")}</span>
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
            placeholder={t("Tuliskan perkenalan singkat, ketertarikan Anda pada posisi ini, atau catatan tambahan untuk HRD...")}
            className="w-full rounded-2xl border border-black/[0.12] bg-[#FAF8F0]/40 p-4 text-sm text-slate-900 placeholder:text-slate-400 focus:border-black focus:bg-white focus:outline-none focus:ring-2 focus:ring-black/10 transition resize-y min-h-[110px]"
          />
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
                <span>{t("Mengunggah Berkas CV...")}</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4" aria-hidden="true" />
                <span>{t("Kirim Lamaran")}</span>
              </>
            )}
          </button>
        </div>
      </form>
    </section>
  );
}
