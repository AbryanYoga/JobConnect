"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useLanguage } from "@/lib/i18n";

interface LogoutButtonProps {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  className?: string;
  showIcon?: boolean;
  children?: React.ReactNode;
}

export function LogoutButton({
  variant = "ghost",
  size = "md",
  className = "",
  showIcon = true,
  children,
}: LogoutButtonProps) {
  const router = useRouter();
  const { t } = useLanguage();
  const [isLoading, setIsLoading] = useState(false);

  const defaultLabel = t("Keluar", "Log Out");
  const displayLabel = children ?? defaultLabel;

  const handleLogout = async () => {
    try {
      setIsLoading(true);
      const supabase = createClient();
      await supabase.auth.signOut();
      router.refresh();
      router.push("/login");
    } catch {
      router.push("/login");
    } finally {
      setIsLoading(false);
    }
  };

  const sizeClasses =
    size === "sm"
      ? "min-h-[44px] px-3 py-1.5 text-xs"
      : size === "lg"
      ? "min-h-[48px] px-5 py-3 text-base"
      : "min-h-[44px] px-4 py-2 text-sm";

  const variantClasses =
    variant === "danger"
      ? "text-red-600 hover:bg-red-50 active:bg-red-100"
      : variant === "outline"
      ? "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 hover:text-navy-700 hover:border-slate-400"
      : variant === "primary"
      ? "bg-navy-700 text-white hover:bg-navy-800"
      : "text-slate-600 hover:bg-slate-100 hover:text-navy-700 active:bg-slate-200";

  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={isLoading}
      aria-label={t("Keluar dari akun", "Log out from account")}
      className={`inline-flex items-center gap-2 font-medium rounded-control transition-colors select-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy-600 disabled:opacity-50 disabled:cursor-not-allowed ${sizeClasses} ${variantClasses} ${className}`.trim()}
    >
      {showIcon && <LogOut className="w-4 h-4 shrink-0" aria-hidden="true" />}
      <span>{isLoading ? t("Keluar...", "Logging out...") : displayLabel}</span>
    </button>
  );
}
