import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { MapPin, Building2, ChevronRight, Briefcase } from "lucide-react";

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
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
        {/* Breadcrumb Navigasi */}
        <nav aria-label="Breadcrumb" className="text-xs text-slate-500">
          <ol className="flex items-center gap-1.5 flex-wrap">
            <li>
              <Link
                href="/"
                className="hover:text-navy-900 transition-colors focus-visible:outline-2 focus-visible:outline-navy-700 rounded-xs"
              >
                Beranda
              </Link>
            </li>
            <li aria-hidden="true" className="text-slate-400">
              /
            </li>
            <li>
              <Link
                href="/wilayah"
                className="hover:text-navy-900 transition-colors focus-visible:outline-2 focus-visible:outline-navy-700 rounded-xs"
              >
                Wilayah
              </Link>
            </li>
            <li aria-hidden="true" className="text-slate-400">
              /
            </li>
            <li className="font-semibold text-slate-800" aria-current="page">
              {province.name}
            </li>
          </ol>
        </nav>

        {/* Header Provinsi */}
        <div className="space-y-2 border-b border-slate-200 pb-6">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-sm bg-navy-50 text-navy-800 border border-navy-100 text-xs font-semibold">
            <MapPin className="w-3.5 h-3.5 text-navy-700" aria-hidden="true" />
            <span>Provinsi</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black text-navy-950 tracking-tight">
            Lowongan Kerja di {province.name}
          </h1>
          <p className="text-sm sm:text-base text-slate-600 max-w-2xl leading-relaxed">
            Daftar kota dan kabupaten yang memiliki lowongan kerja aktif dan terverifikasi.
            Terdapat {totalJobsInProvince} lowongan yang tersedia di {citiesWithJobs.length} daerah.
          </p>
        </div>

        {/* Daftar Kota/Kabupaten Berlowongan Aktif */}
        {citiesWithJobs.length === 0 ? (
          <div className="rounded-card border border-dashed border-slate-300 p-8 sm:p-12 text-center bg-white space-y-3">
            <Building2 className="w-10 h-10 text-slate-400 mx-auto" aria-hidden="true" />
            <h2 className="text-base font-bold text-navy-950">
              Belum ada lowongan aktif di {province.name}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto leading-relaxed">
              Saat ini belum ada perusahaan yang membuka lowongan baru di wilayah ini.
              Anda dapat menjelajahi lowongan di provinsi lain atau melamar lowongan kerja jarak jauh (remote).
            </p>
            <div className="pt-3 flex items-center justify-center gap-3 flex-wrap">
              <Link
                href="/wilayah"
                className="inline-flex items-center justify-center px-4 py-2.5 rounded-control bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs sm:text-sm font-semibold transition-colors min-h-[44px]"
              >
                Pilih Provinsi Lain
              </Link>
              <Link
                href="/wilayah/remote"
                className="inline-flex items-center justify-center px-4 py-2.5 rounded-control bg-navy-800 hover:bg-navy-900 text-white text-xs sm:text-sm font-semibold transition-colors min-h-[44px]"
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
                  className="p-4 rounded-card bg-white border border-slate-200 hover:border-navy-400 hover:bg-slate-50/50 shadow-2xs transition-all flex items-center justify-between gap-3 min-h-[64px] group focus-visible:outline-2 focus-visible:outline-navy-700"
                >
                  <div className="min-w-0 space-y-0.5">
                    <h3 className="text-sm font-bold text-navy-950 group-hover:text-navy-800 truncate transition-colors">
                      {city.name}
                    </h3>
                    <p className="text-xs text-navy-800 font-medium">
                      {city.jobCount} lowongan aktif
                    </p>
                  </div>

                  <ChevronRight
                    className="w-4 h-4 text-navy-700 shrink-0 transition-transform group-hover:translate-x-0.5"
                    aria-hidden="true"
                  />
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Tautan Alternatif */}
        <div className="pt-6 border-t border-slate-200 flex items-center justify-between gap-4 flex-wrap text-xs">
          <Link
            href="/wilayah"
            className="text-navy-800 font-semibold hover:underline inline-flex items-center gap-1 min-h-[44px]"
          >
            Kembali ke Daftar 38 Provinsi
          </Link>
          <Link
            href="/lowongan"
            className="text-slate-600 hover:text-navy-900 inline-flex items-center gap-1 min-h-[44px]"
          >
            <Briefcase className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Lihat Seluruh Lowongan Indonesia</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
