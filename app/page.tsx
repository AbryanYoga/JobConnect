import type { Metadata } from "next";
import { HeroSection } from "@/components/beranda/HeroSection";

export const metadata: Metadata = {
  title: "JobConnect - Portal Lowongan Kerja Terverifikasi 38 Provinsi",
  description:
    "Cari dan lamar lowongan kerja terverifikasi di 38 provinsi dan 514 kota se-Indonesia. Bebas penipuan, bebas ghosting, dengan transparansi alur lamaran.",
};

export default function HomePage() {
  return (
    <main id="main-content" className="min-h-screen bg-slate-50">
      <HeroSection />
    </main>
  );
}
