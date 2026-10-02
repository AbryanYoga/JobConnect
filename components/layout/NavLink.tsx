"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";

interface NavLinkProps {
  href: string;
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export function NavLink({ href, children, className = "", onClick }: NavLinkProps) {
  const pathname = usePathname();
  const isActive =
    pathname === href || (href !== "/" && pathname.startsWith(href + "/"));

  const baseStyles =
    "inline-flex items-center text-sm transition-colors rounded-control min-h-[44px] px-3 py-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy-600";

  const activeStyles = isActive
    ? "text-navy-700 font-semibold bg-navy-50"
    : "text-slate-600 font-medium hover:text-navy-700 hover:bg-slate-100/70";

  return (
    <Link
      href={href}
      onClick={onClick}
      aria-current={isActive ? "page" : undefined}
      className={`${baseStyles} ${activeStyles} ${className}`.trim()}
    >
      {children}
    </Link>
  );
}
