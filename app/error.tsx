"use client";

import { useEffect } from "react";
import { ErrorState } from "@/components/ui/ErrorState";

// Komponen penanganan eror global aplikasi
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Catat rincian eror untuk pemantauan sistem
    console.error("Terjadi kendala pada sistem:", error);
  }, [error]);

  return (
    <div className="min-h-[70vh] bg-[#FAF8F0] flex items-center justify-center p-4 sm:p-8">
      <div className="w-full max-w-lg bg-white rounded-[32px] border border-black/[0.08] p-6 sm:p-8 shadow-card">
        <ErrorState
          title="Terjadi Gangguan pada Halaman Ini"
          message="Sistem sedang mengalami kendala teknis sementara saat memproses permintaan Anda. Silakan coba muat ulang halaman."
          onRetry={reset}
          retryLabel="Muat Ulang Halaman"
          actionHref="/"
          actionLabel="Kembali ke Beranda"
        />
      </div>
    </div>
  );
}
