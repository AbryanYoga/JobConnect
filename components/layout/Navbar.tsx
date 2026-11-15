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
import { FontSizeToggle } from "@/components/ui/FontSizeToggle";
import { NotificationBell } from "@/components/notifikasi/NotificationBell";
import { NavbarAuthButtons } from "./NavbarAuthButtons";

interface NavbarProps {
  role?: Role;
}

export async function Navbar({ role }: NavbarProps = {}) {
  let userRole: Role = role || "tamu";
  let userName: string | null = null;
  let userAvatar: string | null = null;

  if (!role) {
    try {
      const supabase = await createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("role, name, avatar_url")
          .eq("id", user.id)
          .single();

        userName = profile?.name || null;
        userAvatar = profile?.avatar_url || null;

        if (profile?.role === "admin") {
          userRole = "admin";
        } else if (profile?.role === "company") {
          userRole = "perusahaan";

          const { data: company } = await supabase
            .from("companies")
            .select("name, logo_path")
            .eq("owner_id", user.id)
            .maybeSingle();

          if (company) {
            if (company.name) {
              userName = company.name;
            }
            if (company.logo_path) {
              const { data: publicLogo } = supabase.storage
                .from("company-logos")
                .getPublicUrl(company.logo_path);
              userAvatar = publicLogo.publicUrl;
            }
          }
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
  const homeHref =
    userRole === "perusahaan"
      ? "/mitra"
      : userRole === "admin"
      ? "/admin"
      : "/";

  return (
    <NavbarHeader>
      <div className="mx-auto max-w-[1600px] px-4 sm:px-6 lg:px-8 xl:px-10 h-full flex items-center justify-between">
        {/* Sisi Kiri: Navigasi Menu Desktop (Sesuai BMC: Links di sisi kiri) */}
        <div className="flex items-center gap-2">
          {/* Logo Mobile (Hanya tampil di ponsel) */}
          <Link
            href={homeHref}
            className="md:hidden flex items-center rounded-full transition hover:opacity-90 py-1"
            aria-label="JobConnect Beranda"
          >
            <Image
              src="/logos/concept-2-lockup-light.svg"
              alt="JobConnect"
              width={160}
              height={32}
              className="h-6 sm:h-7 w-auto max-w-[130px] xs:max-w-[160px] object-contain"
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
        <div className="hidden md:flex items-center justify-center shrink-0">
          <Link
            href={homeHref}
            className="flex items-center rounded-full transition hover:opacity-90 px-2 lg:px-3 py-1"
            aria-label="JobConnect Beranda"
          >
            <Image
              src="/logos/concept-2-lockup-light.svg"
              alt="JobConnect"
              width={175}
              height={35}
              className="h-7 lg:h-8 w-auto shrink-0"
              priority
            />
          </Link>
        </div>

        {/* Sisi Kanan: Button Ganti Bahasa & Masuk / Daftar Akun */}
        <div className="hidden md:flex items-center gap-1.5 lg:gap-2.5 shrink-0">
          {/* Pengatur Ukuran Font Aksesibilitas */}
          <FontSizeToggle />

          {/* Button Ganti Bahasa (Menggantikan Quick Search Pill) */}
          <LanguageSwitcher />

          {/* Tombol Aksi Autentikasi / Profil */}
          <NavbarAuthButtons
            userRole={userRole}
            userName={userName}
            userAvatar={userAvatar}
            actions={actions}
          />
        </div>

        {/* Menu Navigasi Layar Kecil (Mobile) */}
        <div className="flex md:hidden items-center gap-1">
          {userRole !== "tamu" && <NotificationBell />}
          <MobileMenu
            links={links}
            actions={actions}
            role={userRole}
            userName={userName}
          />
        </div>
      </div>
    </NavbarHeader>
  );
}
