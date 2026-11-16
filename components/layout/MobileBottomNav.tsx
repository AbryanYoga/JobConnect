"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Briefcase,
  MapPin,
  User,
  FileText,
  PlusCircle,
  Building2,
  LayoutDashboard,
  FileCheck2,
  BarChart3,
  LogIn,
} from "lucide-react";
import { Role } from "@/lib/navigation";
import { useLanguage } from "@/lib/i18n";

interface MobileBottomNavProps {
  role?: Role;
}

interface NavTab {
  labelId: string;
  labelEn: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

// Bilah navigasi bawah untuk kenyamanan akses jempol di perangkat ponsel
export function MobileBottomNav({ role = "tamu" }: MobileBottomNavProps) {
  const pathname = usePathname();
  const { t } = useLanguage();

  const tabs: NavTab[] =
    role === "admin"
      ? [
          { labelId: "Dasbor", labelEn: "Dashboard", href: "/admin", icon: LayoutDashboard },
          { labelId: "Review", labelEn: "Review", href: "/admin/lowongan", icon: FileCheck2 },
          { labelId: "Mitra", labelEn: "Partners", href: "/admin/perusahaan", icon: Building2 },
          { labelId: "Laporan", labelEn: "Reports", href: "/admin/laporan", icon: BarChart3 },
        ]
      : role === "perusahaan"
      ? [
          { labelId: "Dasbor", labelEn: "Dashboard", href: "/mitra", icon: LayoutDashboard },
          { labelId: "Lowongan", labelEn: "Jobs", href: "/mitra/lowongan", icon: Briefcase },
          { labelId: "Pasang", labelEn: "Post Job", href: "/mitra/lowongan/tambah", icon: PlusCircle },
          { labelId: "Profil", labelEn: "Profile", href: "/mitra/profil-perusahaan", icon: Building2 },
        ]
      : role === "pelamar"
      ? [
          { labelId: "Beranda", labelEn: "Home", href: "/", icon: Home },
          { labelId: "Lowongan", labelEn: "Jobs", href: "/lowongan", icon: Briefcase },
          { labelId: "Lamaran", labelEn: "Applied", href: "/lamaran-saya", icon: FileText },
          { labelId: "Profil", labelEn: "Profile", href: "/profil", icon: User },
        ]
      : [
          { labelId: "Beranda", labelEn: "Home", href: "/", icon: Home },
          { labelId: "Lowongan", labelEn: "Jobs", href: "/lowongan", icon: Briefcase },
          { labelId: "Wilayah", labelEn: "Regions", href: "/wilayah", icon: MapPin },
          { labelId: "Masuk", labelEn: "Sign In", href: "/login", icon: LogIn },
        ];

  return (
    <nav
      aria-label={t("Navigasi Bawah Ponsel", "Mobile Bottom Navigation")}
      className="fixed bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-t border-black/[0.08] shadow-[0_-4px_16px_rgba(0,0,0,0.04)] md:hidden pb-[env(safe-area-inset-bottom)] print:hidden"
    >
      <div className="grid grid-cols-4 h-15 max-w-lg mx-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isExact = tab.href === "/" || tab.href === "/mitra" || tab.href === "/admin";
          const isActive = isExact
            ? pathname === tab.href
            : pathname === tab.href || pathname.startsWith(tab.href + "/");

          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex flex-col items-center justify-center gap-1 transition-colors relative ${
                isActive
                  ? "text-black font-extrabold"
                  : "text-slate-600 hover:text-black font-medium"
              }`}
            >
              <div className="relative">
                <Icon
                  className={`w-5 h-5 transition-transform ${
                    isActive ? "scale-110 stroke-[2.4]" : "stroke-[1.8]"
                  }`}
                  aria-hidden="true"
                />
                {isActive && (
                  <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-[#FFDD00] ring-2 ring-white" />
                )}
              </div>
              <span className="text-[10px] tracking-tight truncate max-w-[70px]">
                {t(tab.labelId, tab.labelEn)}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
