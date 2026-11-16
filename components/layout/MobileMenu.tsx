"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Menu,
  X,
  FileText,
  Building2,
  FolderTree,
  BarChart3,
  User,
  Bell,
  PlusCircle,
  LogIn,
  UserPlus,
} from "lucide-react";
import { useSyncedAvatar } from "@/lib/avatar-sync";
import { NavAction, NavItem, Role } from "@/lib/navigation";
import { LogoutButton } from "@/components/auth/LogoutButton";
import { NavLink } from "./NavLink";
import { useLanguage } from "@/lib/i18n";
import { LanguageSwitcher } from "@/components/ui/LanguageSwitcher";
import { FontSizeToggle } from "@/components/ui/FontSizeToggle";

interface MobileMenuProps {
  links: NavItem[];
  actions?: NavAction[];
  role?: Role;
  userName?: string | null;
  userAvatar?: string | null;
}

const ROLE_LABEL: Record<Role, { id: string; en: string }> = {
  tamu: { id: "Tamu", en: "Guest" },
  pelamar: { id: "Pencari Kerja", en: "Job Seeker" },
  perusahaan: { id: "Mitra Perusahaan", en: "Partner Company" },
  admin: { id: "Admin Moderator", en: "Admin Moderator" },
};

const ROLE_BADGE_CLASS: Record<Role, string> = {
  tamu: "bg-slate-100 text-slate-700",
  pelamar: "bg-navy-50 text-navy-900 border border-navy-200",
  perusahaan: "bg-emerald-50 text-emerald-900 border border-emerald-200",
  admin: "bg-amber-100 text-amber-950 border border-amber-300 font-bold",
};

const ROLE_EXTRA_LINKS: Record<
  Role,
  { labelId: string; labelEn: string; href: string; icon: React.ComponentType<{ className?: string }> }[]
> = {
  tamu: [],
  pelamar: [
    { labelId: "Profil Akun", labelEn: "Account Profile", href: "/profil", icon: User },
    { labelId: "Notifikasi", labelEn: "Notifications", href: "/notifikasi", icon: Bell },
  ],
  perusahaan: [
    { labelId: "Profil Perusahaan", labelEn: "Company Profile", href: "/mitra/profil-perusahaan", icon: Building2 },
    { labelId: "Laporan Rekap", labelEn: "Summary Report", href: "/mitra/laporan", icon: BarChart3 },
  ],
  admin: [
    { labelId: "Antrean Review", labelEn: "Review Queue", href: "/admin/lowongan", icon: FileText },
    { labelId: "Perusahaan Mitra", labelEn: "Partner Companies", href: "/admin/perusahaan", icon: Building2 },
    { labelId: "Kelola Kategori", labelEn: "Manage Categories", href: "/admin/kategori", icon: FolderTree },
    { labelId: "Rekapitulasi Platform", labelEn: "Platform Summary", href: "/admin/laporan", icon: BarChart3 },
  ],
};

function getUserInitials(name: string): string {
  if (!name) return "?";
  const words = name.trim().split(/\s+/);
  if (words.length >= 2) {
    return (words[0][0] + words[1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

export function MobileMenu({
  links,
  role = "tamu",
  userName,
  userAvatar,
}: MobileMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const currentAvatar = useSyncedAvatar(userAvatar);
  const menuRef = useRef<HTMLDivElement>(null);
  const { t, language } = useLanguage();

  // Kunci scroll halaman utama ketika menu mobile terbuka
  useEffect(() => {
    if (isOpen) {
      const originalStyle = window.getComputedStyle(document.body).overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = originalStyle;
      };
    }
  }, [isOpen]);

  // Tutup panel dengan tombol Escape
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  // Tutup panel jika ukuran layar melebar ke desktop
  useEffect(() => {
    function handleResize() {
      if (window.innerWidth >= 768) {
        setIsOpen(false);
      }
    }

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Tutup panel saat klik di luar area menu
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        isOpen &&
        menuRef.current &&
        !menuRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const closeMenu = () => setIsOpen(false);

  // Kumpulkan tautan tambahan spesifik peran yang belum ada di tautan utama
  const existingHrefs = new Set(links.map((l) => l.href));
  const extraLinks = (ROLE_EXTRA_LINKS[role] || []).filter(
    (item) => !existingHrefs.has(item.href)
  );

  return (
    <div ref={menuRef} className="md:hidden">
      {/* Tombol Hamburger dengan ukuran sentuh minimal 44x44px */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
        aria-controls="mobile-nav-panel"
        aria-label={
          isOpen
            ? t("Tutup menu navigasi", "Close navigation menu")
            : t("Buka menu navigasi", "Open navigation menu")
        }
        className="min-w-[44px] min-h-[44px] w-11 h-11 inline-flex items-center justify-center rounded-full text-slate-800 hover:text-navy-950 hover:bg-black/[0.05] active:scale-95 transition-all focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy-600"
      >
        {isOpen ? (
          <X className="w-6 h-6 stroke-[2.2]" aria-hidden="true" />
        ) : (
          <Menu className="w-6 h-6 stroke-[2.2]" aria-hidden="true" />
        )}
      </button>

      {isOpen && (
        <>
          {/* Latar redup (backdrop) untuk menutup menu saat diklik di luar */}
          <div
            className="fixed inset-0 top-20 bg-slate-900/40 backdrop-blur-xs z-30 transition-opacity animate-in fade-in duration-200"
            onClick={closeMenu}
            aria-hidden="true"
          />

          {/* Panel drawer menu navigasi mobile */}
          <nav
            id="mobile-nav-panel"
            aria-label={t("Navigasi Ponsel", "Mobile Navigation")}
            className="fixed top-20 left-0 right-0 bg-[#FAF8F0] border-b border-[#222222]/15 shadow-xl z-40 px-4 sm:px-6 py-5 max-h-[calc(100dvh-5rem)] overflow-y-auto space-y-4 animate-in slide-in-from-top-2 duration-200"
          >
            {/* 1. Profil Pengguna yang Sedang Masuk */}
            {role !== "tamu" && userName && (
              <Link
                href={
                  role === "perusahaan"
                    ? "/mitra/profil-perusahaan"
                    : role === "admin"
                    ? "/admin"
                    : "/profil"
                }
                onClick={closeMenu}
                className="flex items-center gap-3 p-3 bg-white hover:bg-slate-50 transition rounded-2xl border border-black/[0.08] shadow-2xs group"
                title={t("Buka profil akun", "Open profile account")}
              >
                {currentAvatar ? (
                  <Image
                    src={currentAvatar}
                    alt={`Foto profil ${userName}`}
                    width={44}
                    height={44}
                    className="w-11 h-11 rounded-full object-cover shrink-0 border border-black/10 shadow-2xs"
                    unoptimized
                  />
                ) : (
                  <span
                    className="w-11 h-11 rounded-full bg-navy-900 text-white text-sm font-bold flex items-center justify-center shrink-0 shadow-2xs"
                    aria-hidden="true"
                  >
                    {getUserInitials(userName)}
                  </span>
                )}
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-black text-navy-950 truncate group-hover:text-navy-700 transition-colors">
                    {userName}
                  </p>
                  <span
                    className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold mt-0.5 ${ROLE_BADGE_CLASS[role]}`}
                  >
                    {language === "en"
                      ? ROLE_LABEL[role].en
                      : ROLE_LABEL[role].id}
                  </span>
                </div>
              </Link>
            )}

            {/* 2. Switcher Bahasa & Ukuran Teks Aksesibilitas */}
            <div className="pb-3 border-b border-black/[0.06] space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-slate-500">
                <span>{t("Pilihan Bahasa & Teks", "Language & Font")}</span>
                <FontSizeToggle />
              </div>
              <LanguageSwitcher variant="mobile" />
            </div>

            {/* 3. Menu Navigasi Utama */}
            <div className="space-y-1">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider px-2 block">
                {t("Menu Utama", "Main Menu")}
              </span>
              <div className="flex flex-col gap-1">
                {links.map((link) => (
                  <NavLink
                    key={link.href}
                    href={link.href}
                    onClick={closeMenu}
                    className="w-full text-base font-semibold px-3 py-2.5 rounded-xl justify-start"
                  >
                    {link.label}
                  </NavLink>
                ))}
              </div>
            </div>

            {/* 4. Menu Cepat Spesifik Peran (Pelamar, Mitra, Admin) */}
            {extraLinks.length > 0 && (
              <div className="pt-2 border-t border-black/[0.06] space-y-1">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider px-2 block">
                  {role === "admin"
                    ? t("Akses Moderator", "Moderator Access")
                    : role === "perusahaan"
                    ? t("Akses Perusahaan", "Company Access")
                    : t("Akses Akun", "Account Access")}
                </span>
                <div className="flex flex-col gap-1">
                  {extraLinks.map((item) => {
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={closeMenu}
                        className="flex items-center gap-2.5 px-3 py-2.5 text-sm font-semibold text-slate-800 hover:text-navy-950 hover:bg-black/[0.04] rounded-xl transition min-h-[44px]"
                      >
                        <Icon className="w-4 h-4 text-slate-600 shrink-0" />
                        <span>{t(item.labelId, item.labelEn)}</span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 5. Bagian Tombol Aksi (Masuk, Daftar, Pasang Lowongan, Keluar) */}
            <div className="pt-3 border-t border-black/[0.06] space-y-2.5">
              {role === "tamu" ? (
                <>
                  <Link
                    href="/login"
                    onClick={closeMenu}
                    className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full bg-white hover:bg-slate-100 text-navy-950 font-bold text-sm border border-black/10 transition shadow-2xs min-h-[44px]"
                  >
                    <LogIn className="w-4 h-4 text-slate-700" aria-hidden="true" />
                    <span>{t("Masuk ke Akun", "Sign In")}</span>
                  </Link>

                  <Link
                    href="/register"
                    onClick={closeMenu}
                    className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full bg-[#FFDD00] hover:bg-[#F5D400] text-black font-black text-sm border border-black/10 transition shadow-2xs active:scale-95 min-h-[44px]"
                  >
                    <UserPlus className="w-4 h-4 text-black" aria-hidden="true" />
                    <span>{t("Daftar Akun Baru", "Register New Account")}</span>
                  </Link>

                  <Link
                    href="/register?peran=perusahaan"
                    onClick={closeMenu}
                    className="w-full inline-flex items-center justify-center gap-1.5 pt-1 text-xs font-bold text-slate-600 hover:text-navy-950 hover:underline min-h-[44px]"
                  >
                    <Building2 className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>{t("Pasang Lowongan Sebagai Perusahaan")}</span>
                  </Link>
                </>
              ) : (
                <>
                  {role === "perusahaan" && (
                    <Link
                      href="/mitra/lowongan/tambah"
                      onClick={closeMenu}
                      className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full bg-[#FFDD00] hover:bg-[#F5D400] text-black font-black text-sm border border-black/10 transition shadow-2xs min-h-[44px]"
                    >
                      <PlusCircle className="w-4 h-4" aria-hidden="true" />
                      <span>{t("Pasang Lowongan Baru", "Post New Job")}</span>
                    </Link>
                  )}

                  <LogoutButton
                    variant="outline"
                    size="md"
                    className="w-full justify-center rounded-full bg-white hover:bg-rose-50 hover:text-rose-700 hover:border-rose-200 min-h-[44px]"
                  />
                </>
              )}
            </div>
          </nav>
        </>
      )}
    </div>
  );
}
