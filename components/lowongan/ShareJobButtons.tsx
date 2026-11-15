"use client";

import React, { useState } from "react";
import { Copy, Check, Share2, MessageCircle } from "lucide-react";
import { useLanguage } from "@/lib/i18n";

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
  const { t } = useLanguage();
  const [copied, setCopied] = useState(false);

  const getTargetUrl = () => {
    if (typeof window !== "undefined" && window.location.origin) {
      return `${window.location.origin}/lowongan/${jobSlug}`;
    }
    return `https://jobconnect-id.vercel.app/lowongan/${jobSlug}`;
  };

  const handleCopyLink = async () => {
    const targetUrl = getTargetUrl();
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
    const targetUrl = getTargetUrl();
    const lines = [
      `*Lowongan Kerja: ${jobTitle}*`,
      `*Perusahaan:* ${companyName}`,
      `*Lokasi:* ${location}`,
    ];
    if (salaryText) {
      lines.push(`*Gaji:* ${salaryText}`);
    }
    lines.push("");
    lines.push(t("Lamar secara resmi dan gratis melalui JobConnect:", "Apply officially and free of charge on JobConnect:"));
    lines.push(targetUrl);

    return `https://api.whatsapp.com/send?text=${encodeURIComponent(lines.join("\n"))}`;
  };

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
        <Share2 className="w-3.5 h-3.5 text-navy-800" aria-hidden="true" />
        <span>{t("Bagikan Lowongan Ini", "Share This Vacancy")}</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {/* Tombol Bagikan ke WhatsApp */}
        <a
          href={getWhatsAppShareUrl()}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition shadow-2xs min-h-[44px]"
          aria-label={`${t("Bagikan lowongan", "Share vacancy")} ${jobTitle} WhatsApp`}
        >
          <MessageCircle className="w-4 h-4 text-white fill-current shrink-0" aria-hidden="true" />
          <span>{t("Kirim ke WhatsApp", "Send to WhatsApp")}</span>
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
          aria-label={t("Salin tautan lowongan ke papan klip", "Copy vacancy link to clipboard")}
        >
          {copied ? (
            <>
              <Check className="w-4 h-4 text-emerald-600 shrink-0" aria-hidden="true" />
              <span>{t("Tautan Tersalin!", "Link Copied!")}</span>
            </>
          ) : (
            <>
              <Copy className="w-4 h-4 text-slate-600 shrink-0" aria-hidden="true" />
              <span>{t("Salin Tautan", "Copy Link")}</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
