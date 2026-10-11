"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";

interface CopyJobLinkButtonProps {
  jobSlug: string;
  className?: string;
}

export function CopyJobLinkButton({ jobSlug, className = "" }: CopyJobLinkButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      const origin = typeof window !== "undefined" ? window.location.origin : "";
      const url = `${origin}/lowongan/${jobSlug}`;
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback jika akses clipboard diblokir
    }
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      className={`inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-[#FFDD00] hover:bg-[#F5D400] text-black font-bold text-xs sm:text-sm shadow-2xs hover:shadow transition min-h-[44px] cursor-pointer ${className}`}
      aria-label="Salin tautan lowongan kerja ke papan klip"
    >
      {copied ? (
        <>
          <Check className="w-4 h-4 text-emerald-800" aria-hidden="true" />
          <span>Tautan Tersalin</span>
        </>
      ) : (
        <>
          <Copy className="w-4 h-4 text-black" aria-hidden="true" />
          <span>Salin Tautan Lowongan</span>
        </>
      )}
    </button>
  );
}
