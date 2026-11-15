"use client";

import React from "react";
import Image from "next/image";
import { Calendar, ShieldCheck, MapPin, PencilLine } from "lucide-react";
import { useLanguage } from "@/lib/i18n";

interface ProfilHeaderProps {
  name: string;
  email: string;
  headline?: string | null;
  domicileString?: string | null;
  avatarUrl?: string | null;
  createdAtRaw?: string | null;
  onEdit?: () => void;
  isEditing?: boolean;
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "U";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function formatDate(dateString: string, locale: string): string {
  try {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat(locale, {
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(date);
  } catch {
    return dateString;
  }
}

export function ProfilHeader({
  name,
  email,
  headline,
  domicileString,
  avatarUrl,
  createdAtRaw,
  onEdit,
  isEditing = false,
}: ProfilHeaderProps) {
  const { language, t } = useLanguage();
  const locale = language === "en" ? "en-US" : "id-ID";
  const formattedDate = createdAtRaw
    ? formatDate(createdAtRaw, locale)
    : t("Terbaru", "Recent");

  return (
    <div className="bg-white rounded-[32px] sm:rounded-[36px] border border-black/[0.08] shadow-card p-6 sm:p-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="flex items-center gap-4 sm:gap-5 min-w-0">
          {avatarUrl ? (
            <Image
              src={avatarUrl}
              alt={`Foto profil ${name}`}
              width={80}
              height={80}
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover shrink-0 shadow-xs border-2 border-black/10"
              unoptimized
            />
          ) : (
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-[#0D0C23] text-white font-black text-xl sm:text-2xl flex items-center justify-center shrink-0 shadow-xs border-2 border-black/10 select-none">
              {getInitials(name)}
            </div>
          )}
          <div className="space-y-1.5 min-w-0">
            <div className="flex items-center gap-2 flex-wrap min-w-0">
              <h1 className="text-xl sm:text-3xl font-black text-black tracking-tight break-words min-w-0">
                {name}
              </h1>
              <span className="inline-flex items-center gap-1 px-3 py-0.5 rounded-full bg-[#FFDD00] text-black text-xs font-bold border border-black/10 shadow-2xs shrink-0">
                <ShieldCheck className="w-3.5 h-3.5 text-black" aria-hidden="true" />
                <span>{t("Akun Pelamar", "Job Seeker Account")}</span>
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 font-medium truncate" title={email}>{email}</p>
            {headline && (
              <p className="text-xs sm:text-sm font-semibold text-slate-800 pt-0.5 break-words">
                {headline}
              </p>
            )}
            {domicileString && (
              <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium pt-0.5 min-w-0">
                <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" aria-hidden="true" />
                <span className="truncate">{domicileString}</span>
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0 w-full sm:w-auto">
          {onEdit && !isEditing && (
            <button
              type="button"
              onClick={onEdit}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-[#FFDD00] hover:bg-[#F5D500] active:scale-98 text-black font-black text-sm transition-all shadow-2xs border border-black/10 min-h-[44px] cursor-pointer"
            >
              <PencilLine className="w-4 h-4 text-black" aria-hidden="true" />
              <span>{t("Edit Profil", "Edit Profile")}</span>
            </button>
          )}

          <div className="flex items-center justify-center gap-2 text-xs text-slate-600 bg-[#FAF8F0] px-3.5 py-2 rounded-full border border-black/[0.08] shrink-0 font-medium">
            <Calendar className="w-4 h-4 text-slate-400" aria-hidden="true" />
            <span>{t("Bergabung", "Joined")} {formattedDate}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

