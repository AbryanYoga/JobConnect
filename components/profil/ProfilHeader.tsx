"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Calendar, ShieldCheck, MapPin, PencilLine, Printer } from "lucide-react";
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
    <div className="bg-white rounded-[28px] sm:rounded-[36px] border border-black/[0.08] shadow-card p-4 xs:p-5 sm:p-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 sm:gap-6 min-w-0 w-full">
        <div className="flex items-start sm:items-center gap-3.5 sm:gap-5 min-w-0 flex-1 w-full overflow-hidden">
          {avatarUrl ? (
            <Image
              src={avatarUrl}
              alt={`Foto profil ${name}`}
              width={80}
              height={80}
              className="w-14 h-14 sm:w-20 sm:h-20 rounded-full object-cover shrink-0 shadow-xs border-2 border-black/10"
              unoptimized
            />
          ) : (
            <div className="w-14 h-14 sm:w-20 sm:h-20 rounded-full bg-[#0D0C23] text-white font-black text-lg sm:text-2xl flex items-center justify-center shrink-0 shadow-xs border-2 border-black/10 select-none">
              {getInitials(name)}
            </div>
          )}
          <div className="space-y-1 sm:space-y-1.5 min-w-0 flex-1 w-full overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 min-w-0">
              <h1 className="text-lg sm:text-2xl md:text-3xl font-black text-black tracking-tight break-words [overflow-wrap:anywhere] min-w-0 leading-snug">
                {name}
              </h1>
              <span className="inline-flex items-center gap-1 px-2.5 sm:px-3 py-0.5 rounded-full bg-[#FFDD00] text-black text-[11px] sm:text-xs font-bold border border-black/10 shadow-2xs shrink-0 self-start sm:self-auto">
                <ShieldCheck className="w-3.5 h-3.5 text-black" aria-hidden="true" />
                <span>{t("Akun Pelamar", "Job Seeker Account")}</span>
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 font-medium break-all [overflow-wrap:anywhere]" title={email}>{email}</p>
            {headline && (
              <p className="text-xs sm:text-sm font-semibold text-slate-800 pt-0.5 break-words [overflow-wrap:anywhere] leading-snug">
                {headline}
              </p>
            )}
            {domicileString && (
              <div className="flex items-start sm:items-center gap-1.5 text-xs text-slate-500 font-medium pt-0.5 min-w-0">
                <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5 sm:mt-0" aria-hidden="true" />
                <span className="break-words [overflow-wrap:anywhere] leading-snug">{domicileString}</span>
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0 w-full sm:w-auto">
          {!isEditing && (
            <Link
              href="/profil/cetak-cv"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-full bg-white hover:bg-slate-50 text-navy-950 font-bold text-xs transition border border-black/10 shadow-2xs min-h-[44px]"
              title={t("Cetak lembar CV profil siap pakai", "Print ready-to-use profile CV")}
            >
              <Printer className="w-4 h-4 text-navy-800" aria-hidden="true" />
              <span>{t("Cetak CV (PDF)", "Print CV (PDF)")}</span>
            </Link>
          )}

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

