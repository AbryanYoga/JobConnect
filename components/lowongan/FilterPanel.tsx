"use client";

import { useState, useTransition } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Filter, X, ChevronDown, ChevronUp, MapPin, Briefcase, Laptop, Layers } from "lucide-react";
import { JOB_TYPE_LABEL, WORK_MODE_LABEL, type JobType, type WorkMode } from "@/lib/labels";

interface CategoryOption {
  id: number;
  name: string;
  slug: string;
}

interface ProvinceOption {
  id: number;
  name: string;
  slug: string;
}

interface CityOption {
  id: number;
  name: string;
  slug: string;
}

interface FilterPanelProps {
  categories: CategoryOption[];
  provinces: ProvinceOption[];
  cities: CityOption[];
  selectedCategory?: string;
  selectedJobType?: string;
  selectedWorkMode?: string;
  selectedProvince?: string;
  selectedCity?: string;
}

export function FilterPanel({
  categories,
  provinces,
  cities,
  selectedCategory = "",
  selectedJobType = "",
  selectedWorkMode = "",
  selectedProvince = "",
  selectedCity = "",
}: FilterPanelProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  // State untuk toggle accordion mobile
  const [isOpenMobile, setIsOpenMobile] = useState(false);

  // Hitung jumlah filter yang aktif
  const activeCount = [
    selectedCategory,
    selectedJobType,
    selectedWorkMode,
    selectedProvince,
    selectedCity,
  ].filter(Boolean).length;

  const updateParam = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("page"); // Reset ke halaman 1 saat filter berubah

    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }

    // Jika provinsi berubah, reset pilihan kota
    if (key === "wilayah") {
      params.delete("kota");
    }

    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  };

  const resetAllFilters = () => {
    const params = new URLSearchParams(searchParams.toString());
    const query = params.get("q");
    params.delete("kategori");
    params.delete("tipe");
    params.delete("mode");
    params.delete("wilayah");
    params.delete("kota");
    params.delete("page");
    if (query) {
      params.set("q", query);
    }

    startTransition(() => {
      const qs = params.toString();
      router.push(qs ? `${pathname}?${qs}` : pathname);
    });
  };

  return (
    <aside className="w-full bg-white rounded-card border border-slate-200 shadow-2xs overflow-hidden">
      {/* Header Panel (di mobile berfungsi sebagai tombol buka/tutup) */}
      <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-navy-800" aria-hidden="true" />
          <h2 className="text-sm font-bold text-navy-950 uppercase tracking-wider">
            Filter Lowongan
          </h2>
          {activeCount > 0 && (
            <span className="inline-flex items-center justify-center px-2 py-0.5 text-xs font-bold rounded-full bg-navy-100 text-navy-900">
              {activeCount}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {activeCount > 0 && (
            <button
              type="button"
              onClick={resetAllFilters}
              disabled={isPending}
              className="text-xs font-semibold text-rose-600 hover:text-rose-700 underline underline-offset-2 px-2 py-1 min-h-[36px] flex items-center"
            >
              Reset
            </button>
          )}

          {/* Tombol buka/tutup di mobile */}
          <button
            type="button"
            onClick={() => setIsOpenMobile(!isOpenMobile)}
            className="lg:hidden inline-flex items-center gap-1 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 px-3 py-2 rounded-md min-h-[44px]"
            aria-expanded={isOpenMobile}
            aria-controls="filter-content-panel"
          >
            <span>{isOpenMobile ? "Tutup" : "Buka"}</span>
            {isOpenMobile ? (
              <ChevronUp className="w-4 h-4" aria-hidden="true" />
            ) : (
              <ChevronDown className="w-4 h-4" aria-hidden="true" />
            )}
          </button>
        </div>
      </div>

      {/* Konten Filter (selalu tampil di layar besar, di mobile tergantung toggle) */}
      <div
        id="filter-content-panel"
        className={`p-4 sm:p-5 space-y-6 ${
          isOpenMobile ? "block" : "hidden lg:block"
        }`}
      >
        {/* Indikator Loading Transisi */}
        {isPending && (
          <div className="text-xs text-navy-700 bg-navy-50 border border-navy-100 rounded p-2 text-center animate-pulse">
            Memperbarui data lowongan...
          </div>
        )}

        {/* 1. Filter Kategori Pekerjaan */}
        <div className="space-y-2">
          <label
            htmlFor="filter-kategori-select"
            className="flex items-center gap-1.5 text-xs font-bold text-slate-800 uppercase tracking-wide"
          >
            <Layers className="w-3.5 h-3.5 text-navy-700" aria-hidden="true" />
            <span>Kategori Bidang</span>
          </label>
          <div className="relative">
            <select
              id="filter-kategori-select"
              value={selectedCategory}
              onChange={(e) => updateParam("kategori", e.target.value)}
              disabled={isPending}
              className="w-full text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-md py-2.5 px-3 text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-navy-600 focus:border-navy-600 transition min-h-[44px]"
            >
              <option value="">Semua Kategori</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.slug}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* 2. Filter Tipe Pekerjaan */}
        <div className="space-y-2">
          <span className="flex items-center gap-1.5 text-xs font-bold text-slate-800 uppercase tracking-wide">
            <Briefcase className="w-3.5 h-3.5 text-navy-700" aria-hidden="true" />
            <span>Tipe Kontrak</span>
          </span>
          <div className="flex flex-wrap gap-1.5">
            <button
              type="button"
              onClick={() => updateParam("tipe", "")}
              disabled={isPending}
              className={`text-xs px-2.5 py-1.5 rounded border transition font-medium min-h-[38px] flex items-center ${
                !selectedJobType
                  ? "bg-navy-900 text-white border-navy-900"
                  : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
              }`}
            >
              Semua
            </button>
            {(Object.keys(JOB_TYPE_LABEL) as JobType[]).map((typeKey) => {
              const isActive = selectedJobType === typeKey;
              return (
                <button
                  key={typeKey}
                  type="button"
                  onClick={() => updateParam("tipe", isActive ? "" : typeKey)}
                  disabled={isPending}
                  className={`text-xs px-2.5 py-1.5 rounded border transition font-medium min-h-[38px] flex items-center ${
                    isActive
                      ? "bg-navy-900 text-white border-navy-900 shadow-2xs"
                      : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                  }`}
                >
                  {JOB_TYPE_LABEL[typeKey]}
                </button>
              );
            })}
          </div>
        </div>

        {/* 3. Filter Mode Kerja (Onsite, Hybrid, Remote) */}
        <div className="space-y-2">
          <span className="flex items-center gap-1.5 text-xs font-bold text-slate-800 uppercase tracking-wide">
            <Laptop className="w-3.5 h-3.5 text-navy-700" aria-hidden="true" />
            <span>Mode Kerja</span>
          </span>
          <div className="grid grid-cols-3 gap-1 bg-slate-100 p-1 rounded-md">
            {(Object.keys(WORK_MODE_LABEL) as WorkMode[]).map((modeKey) => {
              const isActive = selectedWorkMode === modeKey;
              return (
                <button
                  key={modeKey}
                  type="button"
                  onClick={() => updateParam("mode", isActive ? "" : modeKey)}
                  disabled={isPending}
                  className={`text-xs py-2 px-1 rounded font-semibold transition text-center min-h-[40px] flex items-center justify-center ${
                    isActive
                      ? "bg-white text-navy-950 shadow-2xs border border-slate-200"
                      : "text-slate-600 hover:text-navy-900"
                  }`}
                >
                  {WORK_MODE_LABEL[modeKey]}
                </button>
              );
            })}
          </div>
        </div>

        {/* 4. Filter Wilayah Hierarkis (Provinsi & Kota) */}
        <div className="space-y-3 pt-2 border-t border-slate-100">
          <span className="flex items-center gap-1.5 text-xs font-bold text-slate-800 uppercase tracking-wide">
            <MapPin className="w-3.5 h-3.5 text-navy-700" aria-hidden="true" />
            <span>Lokasi Penempatan</span>
          </span>

          {/* Dropdown Provinsi */}
          <div className="space-y-1">
            <label
              htmlFor="filter-provinsi-select"
              className="block text-[11px] font-semibold text-slate-600"
            >
              Provinsi
            </label>
            <select
              id="filter-provinsi-select"
              value={selectedProvince}
              onChange={(e) => updateParam("wilayah", e.target.value)}
              disabled={isPending}
              className="w-full text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-md py-2.5 px-3 text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-navy-600 focus:border-navy-600 transition min-h-[44px]"
            >
              <option value="">Seluruh Indonesia</option>
              {provinces.map((prov) => (
                <option key={prov.id} value={prov.slug}>
                  {prov.name}
                </option>
              ))}
            </select>
          </div>

          {/* Dropdown Kota/Kabupaten */}
          <div className="space-y-1">
            <label
              htmlFor="filter-kota-select"
              className="block text-[11px] font-semibold text-slate-600"
            >
              Kota atau Kabupaten
            </label>
            <select
              id="filter-kota-select"
              value={selectedCity}
              onChange={(e) => updateParam("kota", e.target.value)}
              disabled={isPending || !selectedProvince || cities.length === 0}
              className={`w-full text-xs sm:text-sm border rounded-md py-2.5 px-3 transition min-h-[44px] ${
                !selectedProvince
                  ? "bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed"
                  : "bg-slate-50 text-slate-800 border-slate-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-navy-600 focus:border-navy-600"
              }`}
            >
              <option value="">
                {!selectedProvince
                  ? "Pilih provinsi terlebih dahulu"
                  : "Semua Kota di Provinsi Ini"}
              </option>
              {cities.map((city) => (
                <option key={city.id} value={city.slug}>
                  {city.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Active Filters Badges */}
        {activeCount > 0 && (
          <div className="pt-3 border-t border-slate-100 space-y-2">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
              Filter Terpasang
            </span>
            <div className="flex flex-wrap gap-1.5">
              {selectedCategory && (
                <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-slate-100 text-slate-800 text-xs font-medium">
                  Kat: {categories.find((c) => c.slug === selectedCategory)?.name || selectedCategory}
                  <button
                    type="button"
                    onClick={() => updateParam("kategori", "")}
                    className="text-slate-500 hover:text-rose-600 p-0.5"
                    aria-label="Hapus filter kategori"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {selectedJobType && (
                <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-slate-100 text-slate-800 text-xs font-medium">
                  {JOB_TYPE_LABEL[selectedJobType as JobType] || selectedJobType}
                  <button
                    type="button"
                    onClick={() => updateParam("tipe", "")}
                    className="text-slate-500 hover:text-rose-600 p-0.5"
                    aria-label="Hapus filter tipe kerja"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {selectedWorkMode && (
                <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-slate-100 text-slate-800 text-xs font-medium">
                  {WORK_MODE_LABEL[selectedWorkMode as WorkMode] || selectedWorkMode}
                  <button
                    type="button"
                    onClick={() => updateParam("mode", "")}
                    className="text-slate-500 hover:text-rose-600 p-0.5"
                    aria-label="Hapus filter mode kerja"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {selectedProvince && (
                <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-slate-100 text-slate-800 text-xs font-medium">
                  {provinces.find((p) => p.slug === selectedProvince)?.name || selectedProvince}
                  <button
                    type="button"
                    onClick={() => updateParam("wilayah", "")}
                    className="text-slate-500 hover:text-rose-600 p-0.5"
                    aria-label="Hapus filter provinsi"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {selectedCity && (
                <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-slate-100 text-slate-800 text-xs font-medium">
                  {cities.find((c) => c.slug === selectedCity)?.name || selectedCity}
                  <button
                    type="button"
                    onClick={() => updateParam("kota", "")}
                    className="text-slate-500 hover:text-rose-600 p-0.5"
                    aria-label="Hapus filter kota"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
