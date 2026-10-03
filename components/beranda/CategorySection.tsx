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
  ArrowRight,
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
      return <Laptop className="w-5 h-5 text-navy-700" aria-hidden="true" />;
    case "teknik-dan-konstruksi":
      return <Wrench className="w-5 h-5 text-navy-700" aria-hidden="true" />;
    case "manufaktur-dan-pabrik":
      return <Factory className="w-5 h-5 text-navy-700" aria-hidden="true" />;
    case "logistik-dan-transportasi":
      return <Truck className="w-5 h-5 text-navy-700" aria-hidden="true" />;
    case "penjualan-dan-pemasaran":
      return <TrendingUp className="w-5 h-5 text-navy-700" aria-hidden="true" />;
    case "keuangan-dan-akuntansi":
      return <Receipt className="w-5 h-5 text-navy-700" aria-hidden="true" />;
    case "administrasi-dan-layanan":
      return <FileSpreadsheet className="w-5 h-5 text-navy-700" aria-hidden="true" />;
    case "kesehatan-dan-medis":
      return <HeartPulse className="w-5 h-5 text-navy-700" aria-hidden="true" />;
    case "pendidikan-dan-pelatihan":
      return <GraduationCap className="w-5 h-5 text-navy-700" aria-hidden="true" />;
    case "perhotelan-dan-pariwisata":
      return <Coffee className="w-5 h-5 text-navy-700" aria-hidden="true" />;
    case "desain-dan-kreatif":
      return <Palette className="w-5 h-5 text-navy-700" aria-hidden="true" />;
    case "pelayanan-pelanggan":
      return <Headphones className="w-5 h-5 text-navy-700" aria-hidden="true" />;
    default:
      return <Briefcase className="w-5 h-5 text-navy-700" aria-hidden="true" />;
  }
}

export function CategorySection({ categories }: CategorySectionProps) {
  if (!categories || categories.length === 0) {
    return null;
  }

  return (
    <section
      aria-labelledby="categories-heading"
      className="py-14 sm:py-20 bg-slate-50 border-b border-slate-200"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header Section Kategori */}
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 mb-8 sm:mb-12">
          <div className="space-y-1.5 max-w-xl">
            <span className="text-xs font-bold text-amber-700 uppercase tracking-wider bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200 inline-block">
              Bidang Pekerjaan
            </span>
            <h2
              id="categories-heading"
              className="text-2xl sm:text-3xl font-extrabold text-navy-950 tracking-tight"
            >
              Jelajah Kategori Pekerjaan
            </h2>
            <p className="text-sm text-slate-600">
              Pilih bidang keahlian yang sesuai dengan kualifikasi dan minat karier Anda.
            </p>
          </div>

          <Link
            href="/lowongan"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-navy-700 hover:text-navy-900 transition-colors shrink-0 group focus-visible:outline-2 focus-visible:outline-navy-600 rounded-xs"
          >
            <span>Lihat Semua Kategori</span>
            <ArrowRight
              className="w-4 h-4 transition-transform group-hover:translate-x-1"
              aria-hidden="true"
            />
          </Link>
        </div>

        {/* Grid Kartu Kategori */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/lowongan?kategori=${category.slug}`}
              className="group p-5 rounded-card bg-white border border-slate-200/90 shadow-2xs hover:shadow-sm hover:border-navy-300 transition-all flex flex-col justify-between focus-visible:outline-2 focus-visible:outline-navy-600"
            >
              <div className="flex items-start justify-between gap-3 mb-4">
                <div className="w-11 h-11 rounded-control bg-navy-50 group-hover:bg-navy-100 flex items-center justify-center transition-colors">
                  {getCategoryIcon(category.slug)}
                </div>
                <span className="text-xs font-medium text-slate-700 bg-slate-100 px-2.5 py-1 rounded-full border border-slate-200 shrink-0">
                  {category.jobCount} lowongan
                </span>
              </div>

              <div>
                <h3 className="text-base font-bold text-navy-950 group-hover:text-navy-800 transition-colors">
                  {category.name}
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Eksplorasi posisi kerja aktif di bidang ini
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
