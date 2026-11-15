"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";
import { useLanguage } from "@/lib/i18n";

interface NavLinkProps {
  href: string;
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export function NavLink({ href, children, className = "", onClick }: NavLinkProps) {
  const pathname = usePathname();
  const { t } = useLanguage();
  const isExactOnly = href === "/" || href === "/mitra" || href === "/admin";
  const isActive = isExactOnly
    ? pathname === href
    : pathname === href || pathname.startsWith(href + "/");

  const baseStyles =
    "inline-flex items-center text-xs lg:text-sm transition-colors rounded-full min-h-[40px] lg:min-h-[44px] px-2.5 lg:px-4 py-1.5 lg:py-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy-600";

  const activeStyles = isActive
    ? "text-[#0D0C23] font-bold bg-black/[0.06]"
    : "text-slate-700 font-medium hover:text-[#0D0C23] hover:bg-black/[0.04]";

  const content = typeof children === "string" ? t(children) : children;

  return (
    <Link
      href={href}
      onClick={onClick}
      aria-current={isActive ? "page" : undefined}
      className={`${baseStyles} ${activeStyles} ${className}`.trim()}
    >
      {content}
    </Link>
  );
}
