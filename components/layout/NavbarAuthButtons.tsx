"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ChevronDown,
  LogOut,
  LayoutDashboard,
  FileCheck2,
  Building2,
  FolderTree,
  User,
  Briefcase,
  Bookmark,
  PlusCircle,
  FileText,
} from "lucide-react";
import { useSyncedAvatar } from "@/lib/avatar-sync";
import { NavAction, Role } from "@/lib/navigation";
import { useLanguage } from "@/lib/i18n";
import { NotificationBell } from "@/components/notifikasi/NotificationBell";
import { performClientLogout } from "@/lib/auth/logout";

function getUserInitials(name: string): string {
  if (!name) return "?";
  const words = name.trim().split(/\s+/);
  if (words.length >= 2) {
    return (words[0][0] + words[1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

interface NavbarAuthButtonsProps {
  userRole: Role;
  userName: string | null;
  userAvatar?: string | null;
  actions: NavAction[];
}

export function NavbarAuthButtons({
  userRole,
  userName,
  userAvatar,
  actions,
}: NavbarAuthButtonsProps) {
  const { t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const currentAvatar = useSyncedAvatar(userAvatar);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Tutup dropdown jika mengklik area luar
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await performClientLogout();
    } catch {
      if (typeof window !== "undefined") {
        // eslint-disable-next-line @next/next/no-location-assign-relative-destination
        window.location.href = "/login";
      }
    } finally {
      setIsLoggingOut(false);
      setIsOpen(false);
    }
  };

  if (userRole === "tamu") {
    return (
      <div className="flex items-center gap-1.5 lg:gap-2">
        <Link
          href="/login"
          className="inline-flex items-center justify-center px-3 lg:px-4 py-2 rounded-full font-bold text-xs lg:text-sm text-[#0D0C23] hover:bg-black/[0.05] transition min-h-[40px] lg:min-h-[44px]"
        >
          {t("Masuk", "Sign In")}
        </Link>
        <Link
          href="/register"
          className="inline-flex items-center justify-center px-3.5 lg:px-5 py-2 lg:py-2.5 rounded-full bg-[#FFDD00] hover:bg-[#F5D400] text-[#0D0C23] font-black text-xs lg:text-sm shadow-2xs hover:shadow-xs active:scale-95 transition min-h-[40px] lg:min-h-[44px]"
        >
          {t("Daftar Akun", "Register")}
        </Link>
      </div>
    );
  }

  // Tautan menu berdasarkan peran
  const menuLinks =
    userRole === "admin"
      ? [
          {
            labelId: "Dashboard Admin",
            labelEn: "Admin Dashboard",
            href: "/admin",
            icon: LayoutDashboard,
          },
          {
            labelId: "Antrean Review",
            labelEn: "Review Queue",
            href: "/admin/lowongan",
            icon: FileCheck2,
          },
          {
            labelId: "Perusahaan Mitra",
            labelEn: "Partner Companies",
            href: "/admin/perusahaan",
            icon: Building2,
          },
          {
            labelId: "Kelola Kategori",
            labelEn: "Manage Categories",
            href: "/admin/kategori",
            icon: FolderTree,
          },
        ]
      : userRole === "perusahaan"
      ? [
          {
            labelId: "Dashboard Mitra",
            labelEn: "Partner Dashboard",
            href: "/mitra",
            icon: LayoutDashboard,
          },
          {
            labelId: "Profil Perusahaan",
            labelEn: "Company Profile",
            href: "/mitra/profil-perusahaan",
            icon: Building2,
          },
          {
            labelId: "Kelola Lowongan",
            labelEn: "Manage Jobs",
            href: "/mitra/lowongan",
            icon: Briefcase,
          },
        ]
      : [
          {
            labelId: "Profil Saya",
            labelEn: "My Profile",
            href: "/profil",
            icon: User,
          },
          {
            labelId: "Lamaran Saya",
            labelEn: "My Applications",
            href: "/lamaran-saya",
            icon: FileText,
          },
          {
            labelId: "Lowongan Tersimpan",
            labelEn: "Saved Jobs",
            href: "/tersimpan",
            icon: Bookmark,
          },
        ];

  const roleLabel =
    userRole === "admin"
      ? t("Admin Moderator", "Admin Moderator")
      : userRole === "perusahaan"
      ? t("Mitra Perusahaan", "Partner Company")
      : t("Pencari Kerja", "Job Seeker");

  return (
    <div className="flex items-center gap-2.5">
      {/* Notifikasi Lonceng */}
      <NotificationBell />

      {/* Tombol Aksi Tambahan untuk Mitra (misal: Pasang Lowongan) */}
      {actions.map((action) => (
        <Link
          key={action.href}
          href={action.href}
          className="hidden lg:inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#FFDD00] hover:bg-[#F5D400] text-[#0D0C23] font-bold text-xs transition shadow-2xs min-h-[44px]"
        >
          <PlusCircle className="w-3.5 h-3.5 text-[#0D0C23]" />
          <span>{t(action.label)}</span>
        </Link>
      ))}

      {/* Satu Tombol Terpadu: Foto/Inisial + Nama + Dropdown Menu Akun & Keluar */}
      <div ref={dropdownRef} className="relative">
        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          aria-expanded={isOpen}
          aria-haspopup="true"
          className={`flex items-center gap-2 rounded-full pl-1.5 pr-3 py-1 border transition-all min-h-[44px] cursor-pointer ${
            isOpen
              ? "bg-slate-100 border-[#0D0C23]/30 shadow-xs"
              : "bg-white hover:bg-slate-50 border-black/[0.08] shadow-2xs hover:shadow"
          }`}
          title={t("Menu Akun", "Account Menu")}
          aria-label={`${t("Menu Akun", "Account Menu")}: ${userName || "User"}`}
        >
          {currentAvatar ? (
            <Image
              src={currentAvatar}
              alt={`Foto profil ${userName || "User"}`}
              width={30}
              height={30}
              className="w-[30px] h-[30px] rounded-full object-cover shrink-0 shadow-2xs"
              unoptimized
            />
          ) : (
            <span
              className={`w-[30px] h-[30px] rounded-full text-xs font-black flex items-center justify-center shrink-0 select-none shadow-2xs ${
                userRole === "admin"
                  ? "bg-slate-900 text-[#FFDD00]"
                  : userRole === "perusahaan"
                  ? "bg-emerald-800 text-white"
                  : "bg-[#0D0C23] text-white"
              }`}
              aria-hidden="true"
            >
              {getUserInitials(userName || (userRole === "admin" ? "Admin" : "Pengguna"))}
            </span>
          )}

          <div className="flex items-center gap-1.5 max-w-[130px] sm:max-w-[150px]">
            <span className="text-xs font-bold text-slate-800 truncate">
              {userName || (userRole === "admin" ? "Admin JobConnect" : "Pengguna")}
            </span>
            <ChevronDown
              className={`w-3.5 h-3.5 text-slate-500 transition-transform duration-200 shrink-0 ${
                isOpen ? "rotate-180 text-black" : ""
              }`}
              aria-hidden="true"
            />
          </div>
        </button>

        {/* Dropdown Menu Mengapung */}
        {isOpen && (
          <div
            role="menu"
            aria-label={t("Menu Akun", "Account Menu")}
            className="absolute right-0 mt-2 w-64 rounded-2xl bg-white border border-black/[0.08] shadow-xl py-2 z-50 animate-in fade-in zoom-in-95 duration-150"
          >
            {/* Header Informasi Pengguna */}
            <div className="px-4 py-2.5 border-b border-black/[0.06] space-y-1">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-black text-slate-900 truncate block">
                  {userName || (userRole === "admin" ? "Admin JobConnect" : "Pengguna")}
                </span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider shrink-0 ${
                    userRole === "admin"
                      ? "bg-slate-900 text-[#FFDD00]"
                      : userRole === "perusahaan"
                      ? "bg-emerald-100 text-emerald-800"
                      : "bg-[#FAF8F0] text-slate-700 border border-black/[0.06]"
                  }`}
                >
                  {roleLabel}
                </span>
              </div>
            </div>

            {/* Menu Navigasi Berdasarkan Peran */}
            <div className="py-1">
              {menuLinks.map((item) => {
                const IconComp = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2.5 text-xs font-bold text-slate-700 hover:text-black hover:bg-slate-50 transition min-h-[40px]"
                  >
                    <IconComp className="w-4 h-4 text-slate-400 shrink-0" />
                    <span>{t(item.labelId, item.labelEn)}</span>
                  </Link>
                );
              })}
            </div>

            <div className="h-px bg-black/[0.06] my-1" />

            {/* Tombol Keluar dari Akun */}
            <div className="px-2 pt-1">
              <button
                type="button"
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-rose-600 hover:text-rose-700 hover:bg-rose-50 transition min-h-[40px] cursor-pointer"
              >
                <LogOut className="w-4 h-4 text-rose-500 shrink-0" />
                <span>
                  {isLoggingOut
                    ? t("Keluar...", "Logging out...")
                    : t("Keluar dari Akun", "Sign Out")}
                </span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
