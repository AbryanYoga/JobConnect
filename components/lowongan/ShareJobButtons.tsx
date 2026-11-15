"use client";

import React, { useState, useEffect } from "react";
import { Copy, Check, Share2, MessageCircle } from "lucide-react";

interface ShareJobButtonsProps {
  jobTitle: string;
  companyName: string;
  location: string;
  salaryText?: string;
  jobSlug: string;
  className?: string;
}

export function ShareJobButtons({
  jobTitle,
  companyName,
  location,
  salaryText,
  jobSlug,
  className = "",
}: ShareJobButtonsProps) {
  const [copied, setCopied] = useState(false);
  const [currentUrl, setCurrentUrl] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      setCurrentUrl(`${window.location.origin}/lowongan/${jobSlug}`);
    }
  }, [jobSlug]);

  const handleCopyLink = async () => {
    const targetUrl = currentUrl || `https://jobconnect-id.vercel.app/lowongan/${jobSlug}`;
    try {
      if (navigator?.clipboard) {
        await navigator.clipboard.writeText(targetUrl);
      } else {
        const textarea = document.createElement("textarea");
        textarea.value = targetUrl;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback diam jika diblokir perizinan
    }
  };

  const getWhatsAppShareUrl = () => {
    const targetUrl = currentUrl || `https://jobconnect-id.vercel.app/lowongan/${jobSlug}`;
    const lines = [
      `*Lowongan Kerja: ${jobTitle}*`,
      `*Perusahaan:* ${companyName}`,
      `*Lokasi:* ${location}`,
    ];
    if (salaryText) {
      lines.push(`*Gaji:* ${salaryText}`);
    }
    lines.push("");
    lines.push("Lamar secara resmi dan gratis melalui JobConnect:");
    lines.push(targetUrl);

    return `https://api.whatsapp.com/send?text=${encodeURIComponent(lines.join("\n"))}`;
  };

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
        <Share2 className="w-3.5 h-3.5 text-navy-800" aria-hidden="true" />
        <span>Bagikan Lowongan Ini</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {/* Tombol Bagikan ke WhatsApp */}
        <a
          href={getWhatsAppShareUrl()}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition shadow-2xs min-h-[44px]"
          aria-label={`Bagikan lowongan ${jobTitle} ke WhatsApp`}
        >
          <MessageCircle className="w-4 h-4 text-white fill-current shrink-0" aria-hidden="true" />
          <span>Kirim ke WhatsApp</span>
        </a>

        {/* Tombol Salin Tautan */}
        <button
          type="button"
          onClick={handleCopyLink}
          className={`inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border text-xs font-bold transition shadow-2xs min-h-[44px] ${
            copied
              ? "bg-emerald-50 text-emerald-800 border-emerald-300"
              : "bg-white hover:bg-slate-50 text-slate-800 border-black/10"
          }`}
          aria-label="Salin tautan lowongan ke papan klip"
        >
          {copied ? (
            <>
              <Check className="w-4 h-4 text-emerald-600 shrink-0" aria-hidden="true" />
              <span>Tautan Tersalin!</span>
            </>
          ) : (
            <>
              <Copy className="w-4 h-4 text-slate-600 shrink-0" aria-hidden="true" />
              <span>Salin Tautan</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
