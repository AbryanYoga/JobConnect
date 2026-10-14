"use client";

import { useState, useTransition } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Filter, X, ChevronDown, ChevronUp, MapPin, Briefcase, Laptop, Layers, RotateCcw } from "lucide-react";
import { JOB_TYPE_LABEL, WORK_MODE_LABEL, type JobType, type WorkMode } from "@/lib/labels";
import { CustomSelect } from "@/components/ui/CustomSelect";
import { useLanguage } from "@/lib/i18n";

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
  const { t } = useLanguage();

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
    <aside className="w-full bg-white rounded-[28px] border border-black/[0.08] shadow-card relative z-20">
      {/* Header Panel (di mobile berfungsi sebagai tombol buka/tutup) */}
      <div className="p-5 border-b border-black/[0.06] flex items-center justify-between rounded-t-[28px]">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-black" aria-hidden="true" />
          <h2 className="text-sm font-bold text-black uppercase tracking-wider">
            {t("Filter Lowongan")}
          </h2>
          {activeCount > 0 && (
            <span className="inline-flex items-center justify-center px-2.5 py-0.5 text-xs font-bold rounded-full bg-[#FFDD00] text-black">
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
              className="text-xs font-bold text-rose-600 hover:text-rose-700 underline underline-offset-2 px-2 py-1 min-h-[44px] flex items-center"
            >
              {t("Reset")}
            </button>
          )}

          {/* Tombol buka/tutup di mobile */}
          <button
            type="button"
            onClick={() => setIsOpenMobile(!isOpenMobile)}
            className="lg:hidden inline-flex items-center gap-1 text-xs font-bold text-black bg-[#FAF8F0] hover:bg-black/5 px-3.5 py-2 rounded-full min-h-[44px] border border-black/[0.08]"
            aria-expanded={isOpenMobile}
            aria-controls="filter-content-panel"
          >
            <span>{isOpenMobile ? t("Tutup") : t("Buka")}</span>
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
        className={`p-5 sm:p-6 space-y-6 pb-7 sm:pb-8 ${
          isOpenMobile ? "block" : "hidden lg:block"
        }`}
      >
        {/* Indikator Loading Transisi */}
        {isPending && (
          <div className="text-xs font-bold text-black bg-[#FFDD00]/30 border border-[#FFDD00] rounded-xl p-2 text-center animate-pulse">
            {t("Memperbarui data lowongan...")}
          </div>
        )}

        {/* 1. Filter Kategori Pekerjaan */}
        <div className="space-y-2">
          <span className="flex items-center gap-1.5 text-xs font-bold text-black uppercase tracking-wide">
            <Layers className="w-3.5 h-3.5 text-black" aria-hidden="true" />
            <span>{t("Kategori Bidang")}</span>
          </span>
          <CustomSelect
            options={[
              { value: "", label: t("Semua Kategori") },
              ...categories.map((cat) => ({
                value: cat.slug,
                label: cat.name,
              })),
            ]}
            value={selectedCategory}
            onChange={(val) => updateParam("kategori", val)}
            placeholder={t("Semua Kategori")}
            disabled={isPending}
            searchable={categories.length > 8}
            searchPlaceholder={t("Cari kategori...")}
          />
        </div>

        {/* 2. Filter Tipe Pekerjaan */}
        <div className="space-y-2">
          <span className="flex items-center gap-1.5 text-xs font-bold text-black uppercase tracking-wide">
            <Briefcase className="w-3.5 h-3.5 text-black" aria-hidden="true" />
            <span>{t("Tipe Kontrak")}</span>
          </span>
          <div className="flex flex-wrap gap-1.5">
            <button
              type="button"
              onClick={() => updateParam("tipe", "")}
              disabled={isPending}
              className={`text-xs px-3.5 py-2 rounded-full border transition-all font-bold min-h-[44px] flex items-center ${
                !selectedJobType
                  ? "bg-black text-white border-black shadow-2xs"
                  : "bg-[#FAF8F0] text-slate-700 border-black/[0.08] hover:bg-black/5"
              }`}
            >
              {t("Semua")}
            </button>
            {(Object.keys(JOB_TYPE_LABEL) as JobType[]).map((typeKey) => {
              const isActive = selectedJobType === typeKey;
              return (
                <button
                  key={typeKey}
                  type="button"
                  onClick={() => updateParam("tipe", isActive ? "" : typeKey)}
                  disabled={isPending}
                  className={`text-xs px-3.5 py-2 rounded-full border transition-all font-bold min-h-[44px] flex items-center ${
                    isActive
                      ? "bg-black text-white border-black shadow-2xs"
                      : "bg-[#FAF8F0] text-slate-700 border-black/[0.08] hover:bg-black/5"
                  }`}
                >
                  {t(JOB_TYPE_LABEL[typeKey])}
                </button>
              );
            })}
          </div>
        </div>

        {/* 3. Filter Mode Kerja (Onsite, Hybrid, Remote) */}
        <div className="space-y-2">
          <span className="flex items-center gap-1.5 text-xs font-bold text-black uppercase tracking-wide">
            <Laptop className="w-3.5 h-3.5 text-black" aria-hidden="true" />
            <span>{t("Mode Kerja")}</span>
          </span>
          <div className="grid grid-cols-3 gap-1 bg-[#FAF8F0] p-1.5 rounded-2xl border border-black/[0.06]">
            {(Object.keys(WORK_MODE_LABEL) as WorkMode[]).map((modeKey) => {
              const isActive = selectedWorkMode === modeKey;
              return (
                <button
                  key={modeKey}
                  type="button"
                  onClick={() => updateParam("mode", isActive ? "" : modeKey)}
                  disabled={isPending}
                  className={`text-xs py-2 px-1 rounded-xl font-bold transition text-center min-h-[44px] flex items-center justify-center ${
                    isActive
                      ? "bg-white text-black shadow-2xs border border-black/[0.08]"
                      : "text-slate-600 hover:text-black"
                  }`}
                >
                  {t(WORK_MODE_LABEL[modeKey])}
                </button>
              );
            })}
          </div>
        </div>

        {/* 4. Filter Wilayah Hierarkis (Provinsi & Kota) */}
        <div className="space-y-3.5 pt-2 border-t border-black/[0.06]">
          <span className="flex items-center gap-1.5 text-xs font-bold text-black uppercase tracking-wide">
            <MapPin className="w-3.5 h-3.5 text-black" aria-hidden="true" />
            <span>{t("Lokasi Penempatan")}</span>
          </span>

          {/* Dropdown Provinsi */}
          <div className="space-y-1">
            <span className="block text-[11px] font-bold text-slate-700">
              {t("Provinsi")}
            </span>
            <CustomSelect
              options={[
                { value: "", label: t("Seluruh Indonesia") },
                ...provinces.map((prov) => ({
                  value: prov.slug,
                  label: prov.name,
                })),
              ]}
              value={selectedProvince}
              onChange={(val) => updateParam("wilayah", val)}
              placeholder={t("Seluruh Indonesia")}
              disabled={isPending}
              searchable={true}
              searchPlaceholder={t("Cari nama provinsi...")}
            />
          </div>

          {/* Dropdown Kota/Kabupaten */}
          <div className="space-y-1">
            <span className="block text-[11px] font-bold text-slate-700">
              {t("Kota atau Kabupaten")}
            </span>
            <CustomSelect
              options={[
                {
                  value: "",
                  label: !selectedProvince
                    ? t("Pilih provinsi terlebih dahulu")
                    : t("Semua Kota di Provinsi Ini"),
                },
                ...cities.map((city) => ({
                  value: city.slug,
                  label: city.name,
                })),
              ]}
              value={selectedCity}
              onChange={(val) => updateParam("kota", val)}
              placeholder={
                !selectedProvince
                  ? t("Pilih provinsi terlebih dahulu")
                  : t("Semua Kota di Provinsi Ini")
              }
              disabled={isPending || !selectedProvince || cities.length === 0}
              searchable={cities.length > 5}
              searchPlaceholder={t("Cari nama kota...")}
            />
          </div>
        </div>

        {/* Active Filters Badges */}
        {activeCount > 0 && (
          <div className="pt-3 border-t border-black/[0.06] space-y-2">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
              {t("Filter Terpasang")}
            </span>
            <div className="flex flex-wrap gap-1.5">
              {selectedCategory && (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#FAF8F0] text-black border border-black/[0.08] text-xs font-bold">
                  {t("Kategori Bidang")}: {categories.find((c) => c.slug === selectedCategory)?.name || selectedCategory}
                  <button
                    type="button"
                    onClick={() => updateParam("kategori", "")}
                    className="text-slate-500 hover:text-rose-600 p-0.5"
                    aria-label={t("Hapus filter kategori")}
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {selectedJobType && (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#FAF8F0] text-black border border-black/[0.08] text-xs font-bold">
                  {t(JOB_TYPE_LABEL[selectedJobType as JobType] || selectedJobType)}
                  <button
                    type="button"
                    onClick={() => updateParam("tipe", "")}
                    className="text-slate-500 hover:text-rose-600 p-0.5"
                    aria-label={t("Hapus filter tipe kerja")}
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {selectedWorkMode && (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#FAF8F0] text-black border border-black/[0.08] text-xs font-bold">
                  {t(WORK_MODE_LABEL[selectedWorkMode as WorkMode] || selectedWorkMode)}
                  <button
                    type="button"
                    onClick={() => updateParam("mode", "")}
                    className="text-slate-500 hover:text-rose-600 p-0.5"
                    aria-label={t("Hapus filter mode kerja")}
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {selectedProvince && (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#FAF8F0] text-black border border-black/[0.08] text-xs font-bold">
                  {provinces.find((p) => p.slug === selectedProvince)?.name || selectedProvince}
                  <button
                    type="button"
                    onClick={() => updateParam("wilayah", "")}
                    className="text-slate-500 hover:text-rose-600 p-0.5"
                    aria-label={t("Hapus filter provinsi")}
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {selectedCity && (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#FAF8F0] text-black border border-black/[0.08] text-xs font-bold">
                  {cities.find((c) => c.slug === selectedCity)?.name || selectedCity}
                  <button
                    type="button"
                    onClick={() => updateParam("kota", "")}
                    className="text-slate-500 hover:text-rose-600 p-0.5"
                    aria-label={t("Hapus filter kota")}
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
            </div>
          </div>
        )}

        {/* Informasi Ringkas Panduan Penempatan & Tombol Reset Cepat */}
        <div className="pt-4 border-t border-black/[0.06] space-y-3">
          <div className="bg-[#FAF8F0] p-4 rounded-2xl border border-black/[0.06] space-y-1.5">
            <span className="text-[11px] font-bold text-slate-900 uppercase tracking-wider block">
              {t("Panduan Penempatan")}
            </span>
            <p className="text-xs text-slate-600 leading-relaxed font-normal">
              {t(
                "Pilih provinsi untuk menampilkan lowongan spesifik di wilayah tersebut dan membuka pilihan kota.",
                "Select a province to filter jobs in that region and enable city selection."
              )}
            </p>
          </div>

          {activeCount > 0 && (
            <button
              type="button"
              onClick={resetAllFilters}
              disabled={isPending}
              className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition duration-150 min-h-[44px]"
            >
              <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
              <span>{t("Reset Semua Filter")} ({activeCount})</span>
            </button>
          )}
        </div>
      </div>
    </aside>
  );
}
