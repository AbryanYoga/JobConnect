"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FileCheck2,
  FolderTree,
  Building2,
  BarChart3,
  ExternalLink,
  Shield,
} from "lucide-react";

interface AdminSidebarProps {
  adminName: string;
  adminEmail: string;
  pendingJobsCount?: number;
}

const MENU_ITEMS = [
  {
    label: "Ringkasan",
    href: "/admin",
    icon: LayoutDashboard,
    exact: true,
  },
  {
    label: "Antrean Review",
    href: "/admin/lowongan",
    icon: FileCheck2,
    exact: false,
    hasBadge: true,
  },
  {
    label: "Kelola Kategori",
    href: "/admin/kategori",
    icon: FolderTree,
    exact: true,
  },
  {
    label: "Perusahaan Mitra",
    href: "/admin/perusahaan",
    icon: Building2,
    exact: true,
  },
  {
    label: "Rekapitulasi Platform",
    href: "/admin/laporan",
    icon: BarChart3,
    exact: true,
  },
];

export function AdminSidebar({
  adminName,
  adminEmail,
  pendingJobsCount = 0,
}: AdminSidebarProps) {
  const pathname = usePathname();

  const isItemActive = (item: (typeof MENU_ITEMS)[number]) => {
    if (item.exact) {
      return pathname === item.href;
    }
    return pathname.startsWith(item.href);
  };

  return (
    <aside aria-label="Navigasi Admin Moderator" className="w-full lg:w-72 shrink-0">
      {/* Versi Mobile: Tab Bar Horizontal */}
      <div className="lg:hidden bg-white rounded-2xl border border-black/[0.08] shadow-2xs p-3 mb-6">
        <div className="flex items-center gap-3 pb-3 mb-3 border-b border-black/[0.06]">
          <div className="w-10 h-10 rounded-xl bg-slate-900 border border-black/[0.08] flex items-center justify-center text-white shrink-0">
            <Shield className="w-5 h-5 text-[#FFDD00]" aria-hidden="true" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm text-black truncate block">
                {adminName || "Admin Moderator"}
              </span>
              <span className="px-2 py-0.5 rounded-full bg-slate-900 text-[#FFDD00] text-[10px] font-black uppercase tracking-wider shrink-0">
                Admin
              </span>
            </div>
            <p className="text-xs text-slate-500 truncate">{adminEmail}</p>
          </div>
        </div>

        <nav className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none" aria-label="Menu navigasi admin mobile">
          {MENU_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = isItemActive(item);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition min-h-[44px] ${
                  active
                    ? "bg-slate-900 text-white shadow-2xs"
                    : "text-slate-600 hover:text-black hover:bg-black/[0.04]"
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" aria-hidden="true" />
                <span>{item.label}</span>
                {item.hasBadge && pendingJobsCount > 0 && (
                  <span className="px-1.5 py-0.5 text-[10px] font-black rounded-full bg-[#FFDD00] text-black">
                    {pendingJobsCount}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Versi Desktop: Sticky Card */}
      <div className="hidden lg:block sticky top-24 space-y-4">
        {/* Identitas Admin */}
        <div className="bg-white rounded-3xl border border-black/[0.08] p-6 shadow-card space-y-5">
          <div className="flex items-start gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-black/[0.08] flex items-center justify-center text-white shrink-0 shadow-2xs">
              <Shield className="w-6 h-6 text-[#FFDD00]" aria-hidden="true" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <span className="px-2 py-0.5 rounded-full bg-slate-900 text-[#FFDD00] text-[10px] font-black uppercase tracking-wider">
                  Moderator
                </span>
              </div>
              <h2 className="font-black text-base text-black tracking-tight truncate mt-1">
                {adminName || "Administrator"}
              </h2>
              <p className="text-xs text-slate-500 truncate font-medium">
                {adminEmail}
              </p>
            </div>
          </div>

          <div className="h-px bg-black/[0.06]" />

          {/* Navigasi Utama */}
          <nav className="space-y-1.5" aria-label="Menu navigasi admin desktop">
            {MENU_ITEMS.map((item) => {
              const Icon = item.icon;
              const active = isItemActive(item);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center justify-between px-4 py-3 rounded-2xl text-xs font-bold transition group min-h-[44px] ${
                    active
                      ? "bg-slate-900 text-white shadow-2xs"
                      : "text-slate-600 hover:text-black hover:bg-[#FAF8F0]"
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Icon
                      className={`w-4 h-4 shrink-0 transition ${
                        active
                          ? "text-[#FFDD00]"
                          : "text-slate-500 group-hover:text-black"
                      }`}
                      aria-hidden="true"
                    />
                    <span className="truncate">{item.label}</span>
                  </div>

                  {item.hasBadge && pendingJobsCount > 0 && (
                    <span
                      className={`px-2 py-0.5 text-[11px] font-black rounded-full transition ${
                        active
                          ? "bg-[#FFDD00] text-black"
                          : "bg-amber-100 text-amber-900"
                      }`}
                    >
                      {pendingJobsCount}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          <div className="h-px bg-black/[0.06]" />

          {/* Tautan Kembali ke Situs Publik */}
          <Link
            href="/"
            className="flex items-center justify-between px-4 py-2.5 rounded-xl text-xs font-medium text-slate-500 hover:text-black hover:bg-[#FAF8F0] transition min-h-[44px]"
          >
            <span>Kunjungi Situs Publik</span>
            <ExternalLink className="w-3.5 h-3.5 text-slate-400" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </aside>
  );
}
