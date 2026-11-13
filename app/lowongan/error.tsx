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
    <div className="min-h-screen bg-[#FAF8F0] flex items-center justify-center p-4 sm:p-8">
      <div className="w-full max-w-lg bg-white rounded-[32px] border border-black/[0.08] p-8 shadow-card">
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
