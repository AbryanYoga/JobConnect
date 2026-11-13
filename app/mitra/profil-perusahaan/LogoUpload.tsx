"use client";

import React, { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Upload, Trash2, Check, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { LOGO_MAX_BYTES, LOGO_ALLOWED_TYPES, LOGO_ERROR_MESSAGE } from "@/lib/validation/profil";

interface LogoUploadProps {
  initialLogoUrl?: string | null;
  companyName: string;
  onUploadAction: (
    formData: FormData
  ) => Promise<{ success: boolean; error?: string; publicUrl?: string }>;
  onDeleteAction: () => Promise<{ success: boolean; error?: string }>;
  onSuccess?: (url: string | null) => void;
}

import { getCompanyLogo, getCompanyInitials } from "@/lib/company-logo";

export function LogoUpload({
  initialLogoUrl,
  companyName,
  onUploadAction,
  onDeleteAction,
  onSuccess,
}: LogoUploadProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const fallbackLogo = getCompanyLogo(companyName);
  const [logoUrl, setLogoUrl] = useState<string | null>(
    initialLogoUrl || fallbackLogo || null
  );
  const [isUploading, setIsUploading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const initials = getCompanyInitials(companyName);

  const processFile = async (file: File) => {
    setErrorMessage(null);
    setSuccessMessage(null);

    // Validasi tipe berkas
    if (
      !LOGO_ALLOWED_TYPES.includes(
        file.type as (typeof LOGO_ALLOWED_TYPES)[number]
      )
    ) {
      setErrorMessage(LOGO_ERROR_MESSAGE);
      return;
    }

    // Validasi ukuran berkas
    if (file.size > LOGO_MAX_BYTES) {
      setErrorMessage(LOGO_ERROR_MESSAGE);
      return;
    }

    try {
      setIsUploading(true);
      const formData = new FormData();
      formData.append("logo", file);

      const res = await onUploadAction(formData);

      if (res.success && res.publicUrl) {
        setLogoUrl(res.publicUrl);
        setSuccessMessage("Logo perusahaan berhasil diperbarui.");
        onSuccess?.(res.publicUrl);
        router.refresh();
      } else {
        setErrorMessage(res.error || "Gagal mengunggah logo perusahaan.");
      }
    } catch {
      setErrorMessage("Terjadi kesalahan teknis saat mengunggah berkas.");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleDelete = async () => {
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      setIsDeleting(true);
      const res = await onDeleteAction();

      if (res.success) {
        setLogoUrl(null);
        setSuccessMessage("Logo perusahaan berhasil dihapus.");
        onSuccess?.(null);
        router.refresh();
      } else {
        setErrorMessage(res.error || "Gagal menghapus logo perusahaan.");
      }
    } catch {
      setErrorMessage("Terjadi kesalahan teknis saat menghapus logo.");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  return (
    <div className="bg-white rounded-card border border-slate-200 shadow-sm p-6 sm:p-8 space-y-5">
      <div>
        <div className="flex items-center gap-2 flex-wrap">
          <h2 className="text-lg font-bold text-navy-950 tracking-tight">
            Logo Resmi Perusahaan
          </h2>
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-red-50 text-red-700 border border-red-200">
            Wajib Diunggah
          </span>
        </div>
        <p className="text-sm text-slate-500 mt-1">
          Logo resmi wajib diunggah untuk membuktikan keaslian profil usaha Anda dan mengaktifkan izin publikasi lowongan pekerjaan.
        </p>
      </div>

      {successMessage && (
        <div
          role="status"
          className="p-3.5 rounded-control bg-green-50 border border-green-200 text-green-800 text-sm flex items-center gap-2.5"
        >
          <Check className="w-4 h-4 shrink-0 text-green-600" aria-hidden="true" />
          <span>{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div
          role="alert"
          className="p-3.5 rounded-control bg-red-50 border border-red-200 text-red-700 text-sm flex items-center gap-2.5"
        >
          <AlertCircle className="w-4 h-4 shrink-0 text-red-600" aria-hidden="true" />
          <span>{errorMessage}</span>
        </div>
      )}

      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`flex flex-col sm:flex-row items-center sm:items-start gap-6 p-4 sm:p-5 rounded-card border-2 border-dashed transition-colors ${
          isDragging
            ? "border-navy-600 bg-navy-50/50"
            : "border-slate-200 bg-slate-50/60"
        }`}
      >
        {/* Frame Logo / Avatar */}
        <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-card bg-white border border-slate-200 shadow-xs flex items-center justify-center shrink-0 overflow-hidden relative group">
          {logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={logoUrl}
              alt={`Logo ${companyName}`}
              className="w-full h-full object-contain p-2"
            />
          ) : (
            <div className="w-full h-full bg-navy-800 flex flex-col items-center justify-center text-white p-2">
              <span className="text-2xl font-bold tracking-wider">
                {initials}
              </span>
              <span className="text-[10px] text-navy-200 mt-0.5">JobConnect</span>
            </div>
          )}

          {isUploading && (
            <div className="absolute inset-0 bg-navy-950/60 flex flex-col items-center justify-center text-white gap-1 backdrop-blur-xs">
              <Loader2 className="w-6 h-6 animate-spin" />
              <span className="text-xs font-medium">Unggah...</span>
            </div>
          )}
        </div>

        {/* Kontrol & Aksi Unggah */}
        <div className="flex-1 text-center sm:text-left space-y-3">
          <div>
            <p className="text-sm font-medium text-slate-800">
              {logoUrl ? "Ubah berkas logo" : "Unggah berkas logo"}
            </p>
            <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
              Format yang didukung: PNG, JPG, atau WEBP. Ukuran maksimal berkas 2 MB. Tarik dan lepas berkas ke area ini atau gunakan tombol di bawah.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 pt-1">
            <input
              type="file"
              ref={fileInputRef}
              accept="image/png, image/jpeg, image/webp"
              onChange={handleFileChange}
              className="sr-only"
              id="company-logo-input"
              aria-label="Pilih berkas logo perusahaan"
            />

            <Button
              type="button"
              variant="outline"
              size="md"
              disabled={isUploading || isDeleting}
              onClick={() => fileInputRef.current?.click()}
              className="min-h-[44px] flex items-center gap-2"
            >
              <Upload className="w-4 h-4" aria-hidden="true" />
              <span>{logoUrl ? "Ganti Logo" : "Pilih Logo"}</span>
            </Button>

            {logoUrl && (
              <Button
                type="button"
                variant="ghost"
                size="md"
                disabled={isUploading || isDeleting}
                isLoading={isDeleting}
                onClick={handleDelete}
                className="min-h-[44px] text-red-600 hover:text-red-700 hover:bg-red-50 flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" aria-hidden="true" />
                <span>Hapus Logo</span>
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
