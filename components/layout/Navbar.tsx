import Link from "next/link";
import { Briefcase } from "lucide-react";
import {
  NAV_ACTIONS_BY_ROLE,
  NAV_LINKS_BY_ROLE,
  Role,
} from "@/lib/navigation";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { LogoutButton } from "@/components/auth/LogoutButton";
import { createClient } from "@/lib/supabase/server";
import { NavLink } from "./NavLink";
import { MobileMenu } from "./MobileMenu";

function getUserInitials(name: string): string {
  if (!name) return "?";
  const words = name.trim().split(/\s+/);
  if (words.length >= 2) {
    return (words[0][0] + words[1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

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
    <header className="sticky top-0 z-40 w-full h-16 bg-white/85 backdrop-blur-sm border-b border-slate-200">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between">
        {/* Sisi Kiri: Logo dan Brand */}
        <div className="flex items-center gap-8">
          <Link
            href="/"
            className="flex items-center gap-2.5 rounded-control focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy-600"
            aria-label="JobConnect Beranda"
          >
            <div className="w-9 h-9 rounded-control bg-navy-700 flex items-center justify-center text-white shrink-0 shadow-xs">
              <Briefcase className="w-5 h-5" aria-hidden="true" />
            </div>
            <span className="font-semibold text-lg text-navy-900 tracking-tight">
              JobConnect
            </span>
          </Link>

          {/* Navigasi Utama Desktop */}
          <nav
            aria-label="Navigasi Utama"
            className="hidden md:flex items-center gap-1"
          >
            {links.map((link) => (
              <NavLink key={link.href} href={link.href}>
                {link.label}
              </NavLink>
            ))}
          </nav>
        </div>

        {/* Sisi Kanan Desktop: Identitas Pengguna dan Tombol Aksi */}
        <div className="hidden md:flex items-center gap-3">
          {userRole !== "tamu" && userName && (
            <Link
              href={userRole === "perusahaan" ? "/mitra/profil-perusahaan" : "/profil"}
              className="flex items-center gap-2 rounded-control px-2 py-1.5 hover:bg-slate-100 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy-600 min-h-[44px]"
            >
              <span
                className="w-8 h-8 rounded-sm bg-navy-700 text-white text-xs font-bold flex items-center justify-center shrink-0"
                aria-hidden="true"
              >
                {getUserInitials(userName)}
              </span>
              <span className="text-sm font-medium text-navy-950 max-w-[120px] truncate">
                {userName}
              </span>
            </Link>
          )}

          {actions.map((action) => {
            if (action.variant === "primary") {
              return (
                <ButtonLink
                  key={action.href}
                  href={action.href}
                  variant="primary"
                  size="md"
                >
                  {action.label}
                </ButtonLink>
              );
            }

            if (action.variant === "outline") {
              return (
                <ButtonLink
                  key={action.href}
                  href={action.href}
                  variant="outline"
                  size="md"
                >
                  {action.label}
                </ButtonLink>
              );
            }

            return (
              <ButtonLink
                key={action.href}
                href={action.href}
                variant="ghost"
                size="md"
              >
                {action.label}
              </ButtonLink>
            );
          })}

          {userRole !== "tamu" && <LogoutButton variant="ghost" size="md" />}
        </div>

        {/* Menu Navigasi Layar Kecil (Mobile) */}
        <MobileMenu links={links} actions={actions} role={userRole} userName={userName} />
      </div>
    </header>
  );
}
