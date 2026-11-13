"use client";

import React, { useState, useRef } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Camera, Trash2, Loader2, AlertCircle, Check, Crop } from "lucide-react";
import {
  AVATAR_MAX_BYTES,
  AVATAR_ALLOWED_TYPES,
  AVATAR_ERROR_MESSAGE,
} from "@/lib/validation/profil";
import { ImageCropperModal } from "./ImageCropperModal";
import { useLanguage } from "@/lib/i18n";

interface AvatarUploadProps {
  initialAvatarUrl?: string | null;
  name: string;
  onUploadAction: (
    formData: FormData
  ) => Promise<{ success: boolean; error?: string; publicUrl?: string }>;
  onDeleteAction: () => Promise<{ success: boolean; error?: string }>;
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "U";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function AvatarUpload({
  initialAvatarUrl,
  name,
  onUploadAction,
  onDeleteAction,
}: AvatarUploadProps) {
  const router = useRouter();
  const { t } = useLanguage();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(initialAvatarUrl || null);
  const [isUploading, setIsUploading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // State untuk modal crop
  const [cropImageSrc, setCropImageSrc] = useState<string | null>(null);
  const [isCropperOpen, setIsCropperOpen] = useState(false);

  const initials = getInitials(name);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setErrorMessage(null);
    setSuccessMessage(null);

    // Validasi tipe berkas
    if (!AVATAR_ALLOWED_TYPES.includes(file.type as (typeof AVATAR_ALLOWED_TYPES)[number])) {
      setErrorMessage(AVATAR_ERROR_MESSAGE);
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    // Validasi ukuran berkas
    if (file.size > AVATAR_MAX_BYTES) {
      setErrorMessage("Ukuran foto profil maksimal 2 MB.");
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    // Baca berkas sebagai data URL untuk dipotong terlebih dahulu
    const reader = new FileReader();
    reader.onload = () => {
      setCropImageSrc(reader.result as string);
      setIsCropperOpen(true);
      if (fileInputRef.current) fileInputRef.current.value = "";
    };
    reader.readAsDataURL(file);
  };

  const handleCropComplete = async (croppedFile: File) => {
    try {
      setIsUploading(true);
      setErrorMessage(null);
      setSuccessMessage(null);

      const formData = new FormData();
      formData.append("avatar", croppedFile);

      const res = await onUploadAction(formData);

      if (res.success && res.publicUrl) {
        setAvatarUrl(res.publicUrl);
        setSuccessMessage("Foto profil berhasil diperbarui.");
        setIsCropperOpen(false);
        setCropImageSrc(null);
        router.refresh();
      } else {
        setErrorMessage(res.error || "Gagal mengunggah foto profil.");
      }
    } catch {
      setErrorMessage("Terjadi gangguan koneksi saat mengunggah foto.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async () => {
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      setIsDeleting(true);
      const res = await onDeleteAction();

      if (res.success) {
        setAvatarUrl(null);
        setSuccessMessage("Foto profil berhasil dihapus.");
        router.refresh();
      } else {
        setErrorMessage(res.error || "Gagal menghapus foto profil.");
      }
    } catch {
      setErrorMessage("Terjadi gangguan koneksi saat menghapus foto.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Modal Crop Gambar */}
      {isCropperOpen && cropImageSrc && (
        <ImageCropperModal
          imageSrc={cropImageSrc}
          onClose={() => {
            setIsCropperOpen(false);
            setCropImageSrc(null);
          }}
          onCropComplete={handleCropComplete}
        />
      )}

      {/* Pesan Kesalahan */}
      {errorMessage && (
        <div
          role="alert"
          className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium flex items-center gap-2"
        >
          <AlertCircle className="w-4 h-4 shrink-0 text-red-600" aria-hidden="true" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Pesan Berhasil */}
      {successMessage && (
        <div
          role="status"
          className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium flex items-center gap-2"
        >
          <Check className="w-4 h-4 shrink-0 text-emerald-600" aria-hidden="true" />
          <span>{successMessage}</span>
        </div>
      )}

      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
        {/* Lingkaran Avatar */}
        <div className="relative group shrink-0">
          <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full border-2 border-black/[0.08] shadow-sm bg-[#FAF8F0] overflow-hidden flex items-center justify-center relative">
            {avatarUrl ? (
              <Image
                src={avatarUrl}
                alt={`Foto profil ${name}`}
                width={112}
                height={112}
                className="w-full h-full object-cover"
                unoptimized
              />
            ) : (
              <span className="text-2xl sm:text-3xl font-black text-[#0D0C23] select-none">
                {initials}
              </span>
            )}

            {/* Indikator Loading */}
            {(isUploading || isDeleting) && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-full">
                <Loader2 className="w-6 h-6 text-white animate-spin" aria-hidden="true" />
              </div>
            )}
          </div>

          {/* Tombol Kamera Mengambang */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading || isDeleting}
            aria-label={t("Pilih foto profil baru", "Choose new profile photo")}
            className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-[#FFDD00] hover:bg-[#F2D200] active:scale-95 text-black border border-black/15 shadow-2xs flex items-center justify-center transition-all cursor-pointer disabled:opacity-50"
          >
            <Camera className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>

        {/* Input Berkas Tersembunyi */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          onChange={handleFileChange}
          className="hidden"
          aria-hidden="true"
        />

        {/* Keterangan & Tombol Aksi */}
        <div className="space-y-2 text-center sm:text-left flex-1">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              {t("Foto Profil Akun", "Account Profile Photo")}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5 font-medium leading-relaxed">
              {t(
                "Pilih foto lalu atur posisi crop. Format didukung: PNG, JPG, atau WEBP (maksimal 2 MB).",
                "Choose a photo then crop. Supported formats: PNG, JPG, or WEBP (up to 2 MB)."
              )}
            </p>
          </div>

          <div className="flex items-center justify-center sm:justify-start gap-2 pt-1 flex-wrap">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading || isDeleting}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-white hover:bg-slate-50 active:scale-98 border border-black/[0.12] text-xs font-bold text-black shadow-2xs hover:shadow transition-all min-h-[40px] cursor-pointer disabled:opacity-50"
            >
              <Crop className="w-3.5 h-3.5 text-slate-600" aria-hidden="true" />
              <span>
                {avatarUrl
                  ? t("Ganti & Posisikan Foto", "Change & Reposition Photo")
                  : t("Unggah & Posisikan Foto", "Upload & Reposition Photo")}
              </span>
            </button>

            {avatarUrl && (
              <button
                type="button"
                onClick={handleDelete}
                disabled={isUploading || isDeleting}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full hover:bg-red-50 text-xs font-bold text-red-600 border border-transparent hover:border-red-200 transition-all min-h-[40px] cursor-pointer disabled:opacity-50"
              >
                <Trash2 className="w-3.5 h-3.5 text-red-500" aria-hidden="true" />
                <span>{t("Hapus", "Delete")}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
