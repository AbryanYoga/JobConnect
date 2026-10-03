"use client";

import { useEffect, useRef, useState } from "react";
import { Menu, X } from "lucide-react";
import { NavAction, NavItem, Role } from "@/lib/navigation";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { LogoutButton } from "@/components/auth/LogoutButton";
import { NavLink } from "./NavLink";

interface MobileMenuProps {
  links: NavItem[];
  actions: NavAction[];
  role?: Role;
}

export function MobileMenu({ links, actions, role = "tamu" }: MobileMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

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

  return (
    <div ref={menuRef} className="md:hidden">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
        aria-controls="mobile-nav-panel"
        aria-label={isOpen ? "Tutup menu navigasi" : "Buka menu navigasi"}
        className="min-w-[44px] min-h-[44px] inline-flex items-center justify-center p-2 rounded-control text-slate-700 hover:text-navy-900 hover:bg-slate-100 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy-600"
      >
        {isOpen ? (
          <X className="w-6 h-6" aria-hidden="true" />
        ) : (
          <Menu className="w-6 h-6" aria-hidden="true" />
        )}
      </button>

      {isOpen && (
        <>
          {/* Latar redup untuk klik di luar */}
          <div
            className="fixed inset-0 top-16 bg-slate-900/20 backdrop-blur-xs z-30"
            onClick={closeMenu}
            aria-hidden="true"
          />

          {/* Panel navigasi mobile */}
          <nav
            id="mobile-nav-panel"
            aria-label="Navigasi Ponsel"
            className="absolute top-16 left-0 right-0 bg-white border-b border-slate-200 shadow-modal z-40 px-4 py-4 max-h-[calc(100dvh-4rem)] overflow-y-auto"
          >
            <div className="flex flex-col gap-1">
              {links.map((link) => (
                <NavLink
                  key={link.href}
                  href={link.href}
                  onClick={closeMenu}
                  className="w-full text-base font-medium px-3 py-2.5"
                >
                  {link.label}
                </NavLink>
              ))}
            </div>

            {actions.length > 0 && (
              <div className="mt-3 pt-3 border-t border-slate-200 flex flex-col gap-2">
                {actions.map((action) => {
                  if (action.variant === "primary") {
                    return (
                      <ButtonLink
                        key={action.href}
                        href={action.href}
                        onClick={closeMenu}
                        variant="primary"
                        size="md"
                        fullWidth
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
                        onClick={closeMenu}
                        variant="outline"
                        size="md"
                        fullWidth
                      >
                        {action.label}
                      </ButtonLink>
                    );
                  }

                  return (
                    <ButtonLink
                      key={action.href}
                      href={action.href}
                      onClick={closeMenu}
                      variant="ghost"
                      size="md"
                      fullWidth
                      className="justify-start px-3"
                    >
                      {action.label}
                    </ButtonLink>
                  );
                })}

                {role !== "tamu" && (
                  <LogoutButton
                    variant="outline"
                    size="md"
                    className="w-full justify-center mt-1"
                  />
                )}
              </div>
            )}

            {actions.length === 0 && role !== "tamu" && (
              <div className="mt-3 pt-3 border-t border-slate-200">
                <LogoutButton
                  variant="outline"
                  size="md"
                  className="w-full justify-center"
                />
              </div>
            )}
          </nav>
        </>
      )}
    </div>
  );
}
