import React from "react";
import Link from "next/link";
import {
  Laptop,
  Wrench,
  Factory,
  Truck,
  TrendingUp,
  Receipt,
  FileSpreadsheet,
  HeartPulse,
  GraduationCap,
  Coffee,
  Palette,
  Headphones,
  Briefcase,
} from "lucide-react";

export interface CategoryWithCount {
  id: number;
  name: string;
  slug: string;
  jobCount: number;
}

interface CategorySectionProps {
  categories: CategoryWithCount[];
}

function getCategoryIcon(slug: string) {
  switch (slug) {
    case "teknologi-informasi":
      return <Laptop className="w-5 h-5 text-navy-800" aria-hidden="true" />;
    case "teknik-dan-konstruksi":
      return <Wrench className="w-5 h-5 text-navy-800" aria-hidden="true" />;
    case "manufaktur-dan-pabrik":
    case "manufaktur-dan-produksi":
      return <Factory className="w-5 h-5 text-navy-800" aria-hidden="true" />;
    case "logistik-dan-transportasi":
      return <Truck className="w-5 h-5 text-navy-800" aria-hidden="true" />;
    case "penjualan-dan-pemasaran":
      return <TrendingUp className="w-5 h-5 text-navy-800" aria-hidden="true" />;
    case "keuangan-dan-akuntansi":
      return <Receipt className="w-5 h-5 text-navy-800" aria-hidden="true" />;
    case "administrasi-dan-perkantoran":
    case "administrasi-dan-layanan":
      return <FileSpreadsheet className="w-5 h-5 text-navy-800" aria-hidden="true" />;
    case "kesehatan":
    case "kesehatan-dan-medis":
      return <HeartPulse className="w-5 h-5 text-navy-800" aria-hidden="true" />;
    case "pendidikan-dan-pelatihan":
      return <GraduationCap className="w-5 h-5 text-navy-800" aria-hidden="true" />;
    case "perhotelan-dan-kuliner":
    case "perhotelan-dan-pariwisata":
      return <Coffee className="w-5 h-5 text-navy-800" aria-hidden="true" />;
    case "desain-dan-kreatif":
      return <Palette className="w-5 h-5 text-navy-800" aria-hidden="true" />;
    case "layanan-pelanggan":
    case "pelayanan-pelanggan":
      return <Headphones className="w-5 h-5 text-navy-800" aria-hidden="true" />;
    default:
      return <Briefcase className="w-5 h-5 text-navy-800" aria-hidden="true" />;
  }
}

export function CategorySection({ categories }: CategorySectionProps) {
  if (!categories || categories.length === 0) {
    return null;
  }

  return (
    <section
      aria-labelledby="categories-heading"
      className="py-12 sm:py-16 bg-slate-50 border-b border-slate-200"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header Section Kategori */}
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 mb-8">
          <div>
            <h2
              id="categories-heading"
              className="text-2xl sm:text-3xl font-extrabold text-navy-950 tracking-tight"
            >
              Kategori Bidang Pekerjaan
            </h2>
            <p className="text-sm text-slate-600 mt-1">
              Telusuri lowongan berdasarkan keahlian teknis dan spesialisasi industri.
            </p>
          </div>

          <Link
            href="/lowongan"
            className="text-sm font-semibold text-navy-800 hover:text-navy-950 underline underline-offset-4 transition-colors shrink-0 focus-visible:outline-2 focus-visible:outline-navy-700 rounded-xs"
          >
            Lihat Semua Lowongan
          </Link>
        </div>

        {/* Direktori Kategori yang Rapi dan Efisien (Bukan 12 Kartu Boilerplate Besar) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4">
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/lowongan?kategori=${category.slug}`}
              className="group p-4 rounded-card bg-white border border-slate-200 hover:border-navy-400 hover:bg-slate-50/50 shadow-2xs transition-colors flex items-center justify-between gap-3 min-h-[64px] focus-visible:outline-2 focus-visible:outline-navy-700"
            >
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="w-10 h-10 rounded-sm bg-navy-50 text-navy-800 border border-navy-100 flex items-center justify-center shrink-0 group-hover:bg-navy-100 transition-colors">
                  {getCategoryIcon(category.slug)}
                </div>
                <div className="min-w-0">
                  <h3 className="text-sm font-bold text-navy-950 group-hover:text-navy-800 transition-colors truncate">
                    {category.name}
                  </h3>
                  <span className="text-xs text-slate-500">
                    {category.jobCount > 0 ? (
                      <span className="text-navy-800 font-medium">
                        {category.jobCount} lowongan aktif
                      </span>
                    ) : (
                      "Belum ada lowongan"
                    )}
                  </span>
                </div>
              </div>

              <span className="text-xs font-medium text-slate-400 group-hover:text-navy-700 transition-colors shrink-0">
                Buka
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
