"use client";

import { useState } from "react";
import { FileText, ExternalLink, Loader2, AlertCircle } from "lucide-react";
import { getApplicantCvUrlAction } from "@/app/actions/mitra";
import { useLanguage } from "@/lib/i18n";

interface ViewCvButtonProps {
  applicationId: number;
  initialSignedUrl?: string | null;
  className?: string;
}

export function ViewCvButton({
  applicationId,
  initialSignedUrl,
  className = "",
}: ViewCvButtonProps) {
  const { t } = useLanguage();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleOpenCv = async () => {
    setErrorMessage(null);

    if (initialSignedUrl) {
      window.open(initialSignedUrl, "_blank", "noopener,noreferrer");
      return;
    }

    setIsLoading(true);
    try {
      const res = await getApplicantCvUrlAction(applicationId);
      if (!res.success || !res.signedUrl) {
        setErrorMessage(res.error || "Gagal membuka berkas CV.");
        return;
      }

      window.open(res.signedUrl, "_blank", "noopener,noreferrer");
    } catch {
      setErrorMessage("Terjadi kendala jaringan saat meminta akses CV.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={handleOpenCv}
        disabled={isLoading}
        className={`inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full bg-black hover:bg-slate-800 text-white font-bold text-xs sm:text-sm shadow-2xs hover:shadow transition min-h-[44px] cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed ${className}`}
        aria-label={t("Buka berkas CV pelamar dalam tab baru", "Open applicant CV file in a new tab")}
      >
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin text-white" aria-hidden="true" />
            <span>{t("Menyiapkan Berkas CV...", "Preparing CV File...")}</span>
          </>
        ) : (
          <>
            <FileText className="w-4 h-4 text-[#FFDD00]" aria-hidden="true" />
            <span>{t("Buka CV Pelamar (PDF)", "Open Candidate CV (PDF)")}</span>
            <ExternalLink className="w-3.5 h-3.5 text-white/70" aria-hidden="true" />
          </>
        )}
      </button>

      {errorMessage && (
        <div
          role="alert"
          className="flex items-center gap-2 text-xs text-red-600 font-semibold pt-1"
        >
          <AlertCircle className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
          <span>{errorMessage}</span>
        </div>
      )}
    </div>
  );
}
