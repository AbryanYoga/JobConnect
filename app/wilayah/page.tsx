import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import {
  ProvinceIndexView,
  type ProvinceWithCount,
} from "@/components/wilayah/ProvinceIndexView";

export const metadata: Metadata = {
  title: "Jelajah Lowongan Kerja 38 Provinsi di Indonesia - JobConnect",
  description:
    "Cari dan temukan lowongan kerja resmi terverifikasi di 38 provinsi di Indonesia serta peluang kerja remote dari perusahaan terpercaya.",
};

export default async function WilayahIndexPage() {
  let provinces: ProvinceWithCount[] = [];
  let remoteCount = 0;
  let totalOpenJobs = 0;

  try {
    const supabase = await createClient();

    // 1. Ambil seluruh data 38 provinsi
    const { data: provincesData } = await supabase
      .from("provinces")
      .select("id, name, slug")
      .order("name", { ascending: true });

    // 2. Ambil lowongan berstatus open untuk menghitung jumlah per wilayah
    let jobsQuery = supabase
      .from("jobs")
      .select(
        `
        id,
        work_mode,
        status,
        city:cities(
          id,
          province_id
        )
      `
      )
      .eq("status", "open");

    if (process.env.NEXT_PUBLIC_SHOW_DEMO !== "true") {
      jobsQuery = jobsQuery.eq("is_demo", false);
    }

    const { data: openJobs } = await jobsQuery;

    if (provincesData) {
      const countsMap = new Map<number, number>();

      if (openJobs) {
        totalOpenJobs = openJobs.length;

        for (const job of openJobs) {
          if (job.work_mode === "remote") {
            remoteCount += 1;
          }

          const cityData = Array.isArray(job.city) ? job.city[0] : job.city;
          if (cityData?.province_id) {
            countsMap.set(
              cityData.province_id,
              (countsMap.get(cityData.province_id) || 0) + 1
            );
          }
        }
      }

      provinces = provincesData.map((prov) => ({
        id: prov.id,
        name: prov.name,
        slug: prov.slug,
        jobCount: countsMap.get(prov.id) || 0,
      }));

      // Urutkan provinsi: provinsi dengan lowongan aktif terlebih dahulu (jumlah terbanyak), lalu alfabetis
      provinces.sort((a, b) => {
        if (b.jobCount !== a.jobCount) {
          return b.jobCount - a.jobCount;
        }
        return a.name.localeCompare(b.name, "id");
      });
    }
  } catch {
    // Graceful fallback bila database belum terhubung
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <ProvinceIndexView
          provinces={provinces}
          remoteCount={remoteCount}
          totalOpenJobs={totalOpenJobs}
        />
      </div>
    </div>
  );
}
