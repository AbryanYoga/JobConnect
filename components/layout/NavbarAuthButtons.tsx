"use client";

import React from "react";
import Link from "next/link";
import { NavAction, Role } from "@/lib/navigation";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { LogoutButton } from "@/components/auth/LogoutButton";
import { useLanguage } from "@/lib/i18n";

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
  actions: NavAction[];
}

export function NavbarAuthButtons({
  userRole,
  userName,
  actions,
}: NavbarAuthButtonsProps) {
  const { t } = useLanguage();

  if (userRole === "tamu") {
    return (
      <div className="flex items-center gap-2">
        <Link
          href="/login"
          className="inline-flex items-center justify-center px-4 py-2 rounded-full font-bold text-sm text-[#0D0C23] hover:bg-black/[0.05] transition min-h-[44px]"
        >
          {t("Masuk", "Sign In")}
        </Link>
        <Link
          href="/register"
          className="inline-flex items-center justify-center px-5 py-2.5 rounded-full bg-[#FFDD00] hover:bg-[#F5D400] text-[#0D0C23] font-black text-sm shadow-2xs hover:shadow-xs active:scale-95 transition min-h-[44px]"
        >
          {t("Daftar Akun", "Register")}
        </Link>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      {userName && (
        <Link
          href={
            userRole === "perusahaan" ? "/mitra/profil-perusahaan" : "/profil"
          }
          className="flex items-center gap-2 rounded-full px-3 py-1.5 hover:bg-black/[0.04] transition-colors min-h-[44px]"
        >
          <span
            className="w-8 h-8 rounded-full bg-navy-900 text-white text-xs font-bold flex items-center justify-center shrink-0"
            aria-hidden="true"
          >
            {getUserInitials(userName)}
          </span>
          <span className="text-sm font-semibold text-navy-950 max-w-[120px] truncate">
            {userName}
          </span>
        </Link>
      )}

      {actions.map((action) => (
        <ButtonLink
          key={action.href}
          href={action.href}
          variant={action.variant === "text" ? "ghost" : action.variant}
          size="md"
          className="rounded-full"
        >
          {t(action.label)}
        </ButtonLink>
      ))}

      <LogoutButton variant="ghost" size="md" className="rounded-full" />
    </div>
  );
}
