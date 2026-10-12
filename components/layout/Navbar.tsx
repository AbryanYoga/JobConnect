  import Link from "next/link";
import Image from "next/image";
import {
  NAV_ACTIONS_BY_ROLE,
  NAV_LINKS_BY_ROLE,
  Role,
} from "@/lib/navigation";
import { createClient } from "@/lib/supabase/server";
import { NavLink } from "./NavLink";
import { MobileMenu } from "./MobileMenu";
import { NavbarHeader } from "./NavbarHeader";
import { LanguageSwitcher } from "@/components/ui/LanguageSwitcher";
import { NavbarAuthButtons } from "./NavbarAuthButtons";

interface NavbarProps {
  role?: Role;
}

export async function Navbar({ role }: NavbarProps = {}) {
  let userRole: Role = role || "tamu";
  let userName: string | null = null;

  if (!role) {
    try {
      const supabase = await createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("role, name")
          .eq("id", user.id)
          .single();

        userName = profile?.name || null;

        if (profile?.role === "admin") {
          userRole = "admin";
        } else if (profile?.role === "company") {
          userRole = "perusahaan";
        } else {
          userRole = "pelamar";
        }
      }
    } catch {
      userRole = "tamu";
    }
  }

  const links = NAV_LINKS_BY_ROLE[userRole] || NAV_LINKS_BY_ROLE.tamu;
  const actions = NAV_ACTIONS_BY_ROLE[userRole] || [];

  return (
    <NavbarHeader>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between">
        {/* Sisi Kiri: Navigasi Menu Desktop (Sesuai BMC: Links di sisi kiri) */}
        <div className="flex items-center gap-2">
          {/* Logo Mobile (Hanya tampil di ponsel) */}
          <Link
            href="/"
            className="md:hidden flex items-center rounded-full transition hover:opacity-90"
            aria-label="JobConnect Beranda"
          >
            <Image
              src="/logos/concept-2-lockup-light.svg"
              alt="JobConnect"
              width={160}
              height={32}
              className="h-7 w-auto"
              priority
            />
          </Link>

          {/* Menu Navigasi Desktop Kiri */}
          <nav
            aria-label="Navigasi Utama"
            className="hidden md:flex items-center gap-1 lg:gap-1.5"
          >
            {links.map((link) => (
              <NavLink key={link.href} href={link.href}>
                {link.label}
              </NavLink>
            ))}
          </nav>
        </div>

        {/* Tengah: Logo Brand JobConnect (Persis Buy Me a Coffee di tengah) */}
        <div className="hidden md:flex items-center justify-center">
          <Link
            href="/"
            className="flex items-center rounded-full transition hover:opacity-90 px-3 py-1"
            aria-label="JobConnect Beranda"
          >
            <Image
              src="/logos/concept-2-lockup-light.svg"
              alt="JobConnect"
              width={175}
              height={35}
              className="h-8 w-auto"
              priority
            />
          </Link>
        </div>

        {/* Sisi Kanan: Button Ganti Bahasa & Masuk / Daftar Akun */}
        <div className="hidden md:flex items-center gap-2.5 lg:gap-3">
          {/* Button Ganti Bahasa (Menggantikan Quick Search Pill) */}
          <LanguageSwitcher />

          {/* Tombol Aksi Autentikasi / Profil */}
          <NavbarAuthButtons
            userRole={userRole}
            userName={userName}
            actions={actions}
          />
        </div>

        {/* Menu Navigasi Layar Kecil (Mobile) */}
        <MobileMenu
          links={links}
          actions={actions}
          role={userRole}
          userName={userName}
        />
      </div>
    </NavbarHeader>
  );
}
