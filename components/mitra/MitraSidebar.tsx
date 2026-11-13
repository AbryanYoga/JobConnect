"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Briefcase,
  PlusCircle,
  Building2,
  BarChart3,
  ExternalLink,
  ShieldCheck,
} from "lucide-react";
import { useLanguage } from "@/lib/i18n";

interface MitraSidebarProps {
  companyName: string;
  companyLogoUrl?: string | null;
  isVerified?: boolean;
}

const MENU_ITEMS = [
  {
    label: "Ringkasan",
    href: "/mitra",
    icon: LayoutDashboard,
    exact: true,
  },
  {
    label: "Kelola Lowongan",
    href: "/mitra/lowongan",
    icon: Briefcase,
    exact: false,
    exclude: "/mitra/lowongan/tambah",
  },
  {
    label: "Pasang Lowongan",
    href: "/mitra/lowongan/tambah",
    icon: PlusCircle,
    exact: true,
  },
  {
    label: "Profil Perusahaan",
    href: "/mitra/profil-perusahaan",
    icon: Building2,
    exact: true,
  },
  {
    label: "Laporan Rekap",
    href: "/mitra/laporan",
    icon: BarChart3,
    exact: true,
  },
];

function getInitials(name: string): string {
  if (!name) return "CO";
  const words = name
    .trim()
    .split(/\s+/)
    .filter((w) => !["pt", "cv", "tbk", "ud"].includes(w.toLowerCase()));
  if (words.length >= 2) {
    return (words[0][0] + words[1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

export function MitraSidebar({
  companyName,
  companyLogoUrl,
  isVerified = true,
}: MitraSidebarProps) {
  const pathname = usePathname();
  const { t } = useLanguage();

  const isItemActive = (item: (typeof MENU_ITEMS)[number]) => {
    if (item.exact) {
      return pathname === item.href;
    }
    if (item.exclude && pathname.startsWith(item.exclude)) {
      return false;
    }
    return pathname.startsWith(item.href);
  };

  return (
    <aside aria-label="Navigasi Mitra Perusahaan" className="w-full lg:w-72 shrink-0">
      {/* Versi Mobile: Tab Bar Horizontal dengan Scroll Halus */}
      <div className="lg:hidden bg-white rounded-2xl border border-black/[0.08] shadow-2xs p-3 mb-6">
        <div className="flex items-center gap-3 pb-3 mb-3 border-b border-black/[0.06]">
          <div className="w-10 h-10 rounded-xl bg-[#FAF8F0] border border-black/[0.08] flex items-center justify-center overflow-hidden shrink-0">
            {companyLogoUrl ? (
              <Image
                src={companyLogoUrl}
                alt={companyName}
                width={36}
                height={36}
                className="w-full h-full object-contain p-1"
                unoptimized
              />
            ) : (
              <span className="font-black text-sm text-black">
                {getInitials(companyName)}
              </span>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <h2 className="text-sm font-bold text-black truncate">
                {companyName}
              </h2>
              {isVerified && (
                <ShieldCheck
                  className="w-4 h-4 text-emerald-600 shrink-0"
                  aria-label="Mitra Terverifikasi"
                />
              )}
            </div>
            <p className="text-xs text-slate-500 font-medium">{t("Dashboard Mitra", "Partner Dashboard")}</p>
          </div>
        </div>

        {/* Scroll Bar Tab Mobile */}
        <nav
          aria-label="Menu navigasi cepat mitra"
          className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none"
        >
          {MENU_ITEMS.map((item) => {
            const active = isItemActive(item);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-full text-xs font-bold whitespace-nowrap transition min-h-[44px] ${
                  active
                    ? "bg-[#FFDD00] text-black shadow-2xs border border-black/10"
                    : "text-slate-700 hover:text-black hover:bg-black/[0.04]"
                }`}
                aria-current={active ? "page" : undefined}
              >
                <Icon className="w-4 h-4 shrink-0" aria-hidden="true" />
                <span>{t(item.label)}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Versi Desktop: Kartu Sidebar Menetap (Sticky Sidebar) */}
      <div className="hidden lg:block sticky top-24 space-y-4">
        {/* Identitas Perusahaan */}
        <div className="bg-white rounded-3xl border border-black/[0.08] shadow-card p-5">
          <div className="flex items-center gap-3.5 pb-4 border-b border-black/[0.06]">
            <div className="w-12 h-12 rounded-2xl bg-[#FAF8F0] border border-black/[0.08] flex items-center justify-center overflow-hidden shrink-0 shadow-2xs">
              {companyLogoUrl ? (
                <Image
                  src={companyLogoUrl}
                  alt={companyName}
                  width={44}
                  height={44}
                  className="w-full h-full object-contain p-1.5"
                  unoptimized
                />
              ) : (
                <span className="font-black text-base text-black">
                  {getInitials(companyName)}
                </span>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <h2 className="text-base font-black text-black truncate">
                  {companyName}
                </h2>
                {isVerified && (
                  <ShieldCheck
                    className="w-4 h-4 text-emerald-600 shrink-0"
                    aria-label="Mitra Terverifikasi"
                  />
                )}
              </div>
              <span className="inline-flex items-center gap-1 mt-0.5 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-[11px] font-bold border border-emerald-200">
                {t("Mitra Resmi", "Official Partner")}
              </span>
            </div>
          </div>

          {/* Navigasi Utama */}
          <nav aria-label="Menu navigasi mitra" className="pt-4 space-y-1.5">
            {MENU_ITEMS.map((item) => {
              const active = isItemActive(item);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition min-h-[44px] ${
                    active
                      ? "bg-[#FFDD00] text-black shadow-2xs border border-black/10"
                      : "text-slate-700 hover:text-black hover:bg-black/[0.04]"
                  }`}
                  aria-current={active ? "page" : undefined}
                >
                  <Icon
                    className={`w-4 h-4 shrink-0 stroke-[2.2] ${
                      active ? "text-black" : "text-slate-500"
                    }`}
                    aria-hidden="true"
                  />
                  <span>{t(item.label)}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Pintasan Eksternal: Lihat Portal Publik */}
        <div className="bg-white rounded-3xl border border-black/[0.08] shadow-card p-5 space-y-3">
          <p className="text-xs font-semibold text-slate-500 leading-relaxed">
            {t(
              "Ingin melihat tampilan lowongan dari sudut pandang pencari kerja?",
              "Want to see how jobs look from a job seeker's perspective?"
            )}
          </p>
          <Link
            href="/lowongan"
            className="flex items-center justify-between w-full px-4 py-2.5 rounded-full bg-[#FAF8F0] hover:bg-[#F3EEDD] text-black text-xs font-bold border border-black/[0.08] transition min-h-[44px]"
          >
            <span>{t("Katalog Publik Lowongan", "Public Job Catalog")}</span>
            <ExternalLink className="w-3.5 h-3.5 text-slate-600" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </aside>
  );
}
