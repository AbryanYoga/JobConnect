import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { HeroSection } from "@/components/beranda/HeroSection";
import { ProvinceChipsBar } from "@/components/beranda/ProvinceChipsBar";
import {
  CategorySection,
  type CategoryWithCount,
} from "@/components/beranda/CategorySection";

export const metadata: Metadata = {
  title: "JobConnect - Portal Lowongan Kerja Terverifikasi 38 Provinsi",
  description:
    "Cari dan lamar lowongan kerja terverifikasi di 38 provinsi dan 514 kota se-Indonesia. Bebas penipuan, bebas ghosting, dengan transparansi alur lamaran.",
};

export default async function HomePage() {
  let provinces: { id: number; name: string; slug: string }[] = [];
  let categoriesWithCount: CategoryWithCount[] = [];

  try {
    const supabase = await createClient();

    // Ambil daftar provinsi untuk bar chip
    const { data: provincesData } = await supabase
      .from("provinces")
      .select("id, name, slug")
      .order("name");

    if (provincesData) {
      provinces = provincesData;
    }

    // Ambil daftar kategori dan hitung jumlah lowongan berstatus open dari database
    const { data: categoriesData } = await supabase
      .from("categories")
      .select("id, name, slug")
      .order("name");

    const { data: openJobsData } = await supabase
      .from("jobs")
      .select("category_id")
      .eq("status", "open");

    if (categoriesData) {
      const countsMap = new Map<number, number>();
      if (openJobsData) {
        for (const job of openJobsData) {
          if (job.category_id !== null && job.category_id !== undefined) {
            countsMap.set(
              job.category_id,
              (countsMap.get(job.category_id) || 0) + 1
            );
          }
        }
      }

      categoriesWithCount = categoriesData.map((cat) => ({
        id: cat.id,
        name: cat.name,
        slug: cat.slug,
        jobCount: countsMap.get(cat.id) || 0,
      }));
    }
  } catch {
    // Graceful fallback bila database belum terhubung
  }

  return (
    <main id="main-content" className="min-h-screen bg-slate-50">
      <HeroSection />
      <ProvinceChipsBar provinces={provinces} />
      <CategorySection categories={categoriesWithCount} />
    </main>
  );
}
