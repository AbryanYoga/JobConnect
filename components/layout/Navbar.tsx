import Link from "next/link";
import { Briefcase } from "lucide-react";
import {
  NAV_ACTIONS_BY_ROLE,
  NAV_LINKS_BY_ROLE,
  Role,
} from "@/lib/navigation";
import { NavLink } from "./NavLink";
import { MobileMenu } from "./MobileMenu";

interface NavbarProps {
  role?: Role;
}

export function Navbar({ role = "tamu" }: NavbarProps) {
  const links = NAV_LINKS_BY_ROLE[role] || NAV_LINKS_BY_ROLE.tamu;
  const actions = NAV_ACTIONS_BY_ROLE[role] || [];

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

        {/* Sisi Kanan Desktop: Tombol Aksi */}
        <div className="hidden md:flex items-center gap-3">
          {actions.map((action) => {
            if (action.variant === "primary") {
              return (
                <Link
                  key={action.href}
                  href={action.href}
                  className="min-h-[44px] px-4 py-2 rounded-control text-sm font-medium text-white bg-navy-700 hover:bg-navy-800 transition-colors shadow-xs inline-flex items-center justify-center focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy-600"
                >
                  {action.label}
                </Link>
              );
            }

            if (action.variant === "outline") {
              return (
                <Link
                  key={action.href}
                  href={action.href}
                  className="min-h-[44px] px-4 py-2 rounded-control text-sm font-medium text-navy-700 border border-navy-700 hover:bg-navy-50 transition-colors inline-flex items-center justify-center focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy-600"
                >
                  {action.label}
                </Link>
              );
            }

            return (
              <Link
                key={action.href}
                href={action.href}
                className="min-h-[44px] px-3 py-2 rounded-control text-sm font-medium text-slate-600 hover:text-navy-700 transition-colors inline-flex items-center justify-center focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy-600"
              >
                {action.label}
              </Link>
            );
          })}
        </div>

        {/* Menu Navigasi Layar Kecil (Mobile) */}
        <MobileMenu links={links} actions={actions} />
      </div>
    </header>
  );
}
