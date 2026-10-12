import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { MapPin, Building2, ChevronRight, Briefcase } from "lucide-react";
import { Breadcrumb } from "@/components/ui/Breadcrumb";

interface ProvincePageProps {
  params: Promise<{ provinsi: string }>;
}

export async function generateMetadata({
  params,
}: ProvincePageProps): Promise<Metadata> {
  const { provinsi: provinceSlug } = await params;

  if (provinceSlug === "remote") {
    return {
      title: "Lowongan Kerja Remote (Bebas Lokasi) - JobConnect",
      description:
        "Temukan peluang kerja jarak jauh terverifikasi dari mana saja di seluruh Indonesia.",
    };
  }

  const supabase = await createClient();
  const { data: province } = await supabase
    .from("provinces")
    .select("name")
    .eq("slug", provinceSlug)
    .maybeSingle();

  if (!province) {
    return {
      title: "Provinsi Tidak Ditemukan - JobConnect",
    };
  }

  return {
    title: `Lowongan Kerja di ${province.name} - JobConnect`,
    description: `Temukan peluang kerja resmi terverifikasi di berbagai kota dan kabupaten di ${province.name}.`,
  };
}

export default async function ProvinceDetailPage({ params }: ProvincePageProps) {
  const { provinsi: provinceSlug } = await params;

  if (provinceSlug === "remote") {
    redirect("/wilayah/remote");
  }

  const supabase = await createClient();

  // 1. Ambil data provinsi berdasarkan slug
  const { data: province } = await supabase
    .from("provinces")
    .select("id, name, slug")
    .eq("slug", provinceSlug)
    .maybeSingle();

  if (!province) {
    notFound();
  }

  // 2. Ambil seluruh kota dan kabupaten di provinsi ini
  const { data: citiesData } = await supabase
    .from("cities")
    .select("id, name, slug, type")
    .eq("province_id", province.id)
    .order("name", { ascending: true });

  const allCities = citiesData || [];

  // 3. Ambil lowongan berstatus open di provinsi ini
  let jobsQuery = supabase
    .from("jobs")
    .select("id, city_id, status")
    .eq("status", "open");

  if (process.env.NEXT_PUBLIC_SHOW_DEMO !== "true") {
    jobsQuery = jobsQuery.eq("is_demo", false);
  }

  const { data: openJobs } = await jobsQuery;

  // Hitung jumlah lowongan per kota
  const countsMap = new Map<number, number>();
  let totalJobsInProvince = 0;

  if (openJobs && allCities.length > 0) {
    const cityIdSet = new Set(allCities.map((c) => c.id));

    for (const job of openJobs) {
      if (job.city_id && cityIdSet.has(job.city_id)) {
        countsMap.set(job.city_id, (countsMap.get(job.city_id) || 0) + 1);
        totalJobsInProvince += 1;
      }
    }
  }

  // Pisahkan kota yang memiliki lowongan tayang (urut jumlah terbanyak)
  const citiesWithJobs = allCities
    .map((city) => ({
      ...city,
      jobCount: countsMap.get(city.id) || 0,
    }))
    .filter((city) => city.jobCount > 0)
    .sort((a, b) => b.jobCount - a.jobCount || a.name.localeCompare(b.name, "id"));

  return (
    <div className="min-h-screen bg-[#FAF8F0]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
        {/* Breadcrumb Navigasi */}
        <Breadcrumb
          items={[
            { label: "Beranda", href: "/" },
            { label: "Wilayah", href: "/wilayah" },
            { label: province.name },
          ]}
        />

        {/* Header Provinsi */}
        <div className="space-y-3 pb-2">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#FFDD00] text-black border border-black/10 text-xs font-bold shadow-2xs">
            <MapPin className="w-3.5 h-3.5 text-black" aria-hidden="true" />
            <span>Provinsi</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-black tracking-tight">
            Lowongan Kerja di {province.name}
          </h1>
          <p className="text-sm sm:text-base text-slate-700 max-w-2xl leading-relaxed font-medium">
            Daftar kota dan kabupaten yang memiliki lowongan kerja aktif dan terverifikasi.
            Terdapat {totalJobsInProvince} lowongan yang tersedia di {citiesWithJobs.length} daerah.
          </p>
        </div>

        {/* Daftar Kota/Kabupaten Berlowongan Aktif */}
        {citiesWithJobs.length === 0 ? (
          <div className="rounded-[28px] border border-dashed border-black/15 p-8 sm:p-12 text-center bg-white shadow-2xs space-y-3">
            <Building2 className="w-10 h-10 text-slate-400 mx-auto" aria-hidden="true" />
            <h2 className="text-lg font-bold text-black">
              Belum ada lowongan aktif di {province.name}
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
              Saat ini belum ada perusahaan yang membuka lowongan baru di wilayah ini.
              Anda dapat menjelajahi lowongan di provinsi lain atau melamar lowongan kerja jarak jauh (remote).
            </p>
            <div className="pt-3 flex items-center justify-center gap-3 flex-wrap">
              <Link
                href="/wilayah"
                className="inline-flex items-center justify-center px-5 py-2.5 rounded-full bg-slate-100 hover:bg-slate-200 text-black text-xs sm:text-sm font-bold transition-all min-h-[44px]"
              >
                Pilih Provinsi Lain
              </Link>
              <Link
                href="/wilayah/remote"
                className="inline-flex items-center justify-center px-6 py-2.5 rounded-full bg-[#FFDD00] hover:bg-[#F5D500] text-black text-xs sm:text-sm font-bold transition-all shadow-2xs min-h-[44px]"
              >
                Lihat Lowongan Remote
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Kota dan Kabupaten dengan Lowongan Tayang
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4">
              {citiesWithJobs.map((city) => (
                <Link
                  key={city.id}
                  href={`/wilayah/${province.slug}/${city.slug}`}
                  className="p-4 sm:p-5 rounded-[22px] bg-white border border-black/[0.08] hover:border-black/20 hover:shadow-card hover:-translate-y-1 shadow-2xs transition-all duration-200 flex items-center justify-between gap-3 min-h-[68px] group focus-visible:outline-2 focus-visible:outline-black"
                >
                  <div className="min-w-0 space-y-1">
                    <h3 className="text-sm font-bold text-black group-hover:text-black truncate transition-colors">
                      {city.name}
                    </h3>
                    <div>
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-[#FAF8F0] text-black border border-black/[0.08]">
                        {city.jobCount} lowongan aktif
                      </span>
                    </div>
                  </div>

                  <div
                    className="w-8 h-8 rounded-full bg-[#FAF8F0] group-hover:bg-[#FFDD00] text-black flex items-center justify-center shrink-0 transition-transform group-hover:translate-x-1"
                    aria-hidden="true"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Tautan Alternatif */}
        <div className="pt-6 border-t border-black/[0.08] flex items-center justify-between gap-4 flex-wrap text-xs">
          <Link
            href="/wilayah"
            className="text-black font-bold hover:underline inline-flex items-center gap-1 min-h-[44px]"
          >
            Kembali ke Daftar 38 Provinsi
          </Link>
          <Link
            href="/lowongan"
            className="text-slate-600 hover:text-black font-medium inline-flex items-center gap-1 min-h-[44px]"
          >
            <Briefcase className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Lihat Seluruh Lowongan Indonesia</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
