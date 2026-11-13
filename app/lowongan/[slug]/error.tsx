"use client";

import { useEffect } from "react";
import { ErrorState } from "@/components/ui/ErrorState";

export default function JobDetailError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Kesalahan pada detail lowongan:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[#FAF8F0] flex items-center justify-center p-4 sm:p-8">
      <div className="w-full max-w-lg bg-white rounded-[32px] border border-black/[0.08] p-8 shadow-card">
        <ErrorState
          title="Lowongan Tidak Dapat Dimuat"
          message="Terjadi kesalahan saat memproses detail lowongan pekerjaan ini. Silakan coba kembali atau periksa lowongan lainnya."
          onRetry={reset}
          retryLabel="Muat Ulang"
          actionHref="/lowongan"
          actionLabel="Kembali ke Katalog Lowongan"
        />
      </div>
    </div>
  );
}
