"use client";

import { useEffect } from "react";
import { ErrorState } from "@/components/ui/ErrorState";

export default function LowonganError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error untuk kebutuhan pemantauan
    console.error("Kesalahan pada katalog lowongan:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 sm:p-8">
      <div className="w-full max-w-lg bg-white rounded-card border border-slate-200 p-8 shadow-xs">
        <ErrorState
          title="Gagal Memuat Katalog Lowongan"
          message="Terjadi gangguan saat mengambil data lowongan pekerjaan. Silakan coba lagi beberapa saat lagi."
          onRetry={reset}
          retryLabel="Muat Ulang"
          actionHref="/"
          actionLabel="Kembali ke Beranda"
        />
      </div>
    </div>
  );
}
