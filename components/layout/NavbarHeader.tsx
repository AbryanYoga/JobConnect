"use client";

import { useState, useEffect, useRef } from "react";

interface NavbarHeaderProps {
  children: React.ReactNode;
}

export function NavbarHeader({ children }: NavbarHeaderProps) {
  const [isVisible, setIsVisible] = useState(true);
  const lastScrollY = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      // Selalu tampil jika di posisi paling atas
      if (currentScrollY <= 20) {
        setIsVisible(true);
        lastScrollY.current = currentScrollY;
        return;
      }

      // Scroll ke bawah: sembunyikan navbar
      if (currentScrollY > lastScrollY.current + 5 && currentScrollY > 70) {
        setIsVisible(false);
      }
      // Scroll ke atas: tampilkan navbar
      else if (currentScrollY < lastScrollY.current - 5) {
        setIsVisible(true);
      }

      lastScrollY.current = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 w-full h-20 bg-[#FAF8F0]/95 backdrop-blur-md border-b border-[#222222]/10 transition-transform duration-300 ease-in-out ${
          isVisible ? "translate-y-0" : "-translate-y-full"
        }`}
      >
        {children}
      </header>
      {/* Spacer setinggi navbar agar konten tidak tertabrak header fixed */}
      <div className="h-20 shrink-0 pointer-events-none" aria-hidden="true" />
    </>
  );
}
