import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { HeroSection } from "@/components/beranda/HeroSection";
import { ProvinceChipsBar } from "@/components/beranda/ProvinceChipsBar";

export const metadata: Metadata = {
  title: "JobConnect - Portal Lowongan Kerja Terverifikasi 38 Provinsi",
  description:
    "Cari dan lamar lowongan kerja terverifikasi di 38 provinsi dan 514 kota se-Indonesia. Bebas penipuan, bebas ghosting, dengan transparansi alur lamaran.",
};

export default async function HomePage() {
  let provinces: { id: number; name: string; slug: string }[] = [];

  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("provinces")
      .select("id, name, slug")
      .order("name");

    if (data) {
      provinces = data;
    }
  } catch {
    // Graceful fallback bila database belum terhubung
  }

  return (
    <main id="main-content" className="min-h-screen bg-slate-50">
      <HeroSection />
      <ProvinceChipsBar provinces={provinces} />
    </main>
  );
}
