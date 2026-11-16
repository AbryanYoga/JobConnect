"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Building2,
  Globe,
  Briefcase,
  MapPin,
  Check,
  AlertCircle,
} from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import { COMPANY_SIZE_OPTIONS, type CompanySize } from "@/lib/labels";
import {
  profilPerusahaanSchema,
  NAME_MIN,
  NAME_MAX,
  WEBSITE_MAX,
  INDUSTRY_MAX,
  ADDRESS_NOTE_MAX,
  DESCRIPTION_MAX,
} from "@/lib/validation/profil";
import { fieldErrors } from "@/lib/validation/helpers";

export interface ProvinceOption {
  id: number;
  name: string;
}

export interface CityOption {
  id: number;
  province_id: number;
  name: string;
  type: string;
}

export interface ProfilPerusahaanData {
  name: string;
  website: string | null;
  industry: string | null;
  size: CompanySize | null;
  provinceId: number | null;
  cityId: number | null;
  addressNote: string | null;
  description: string | null;
  logoPath?: string | null;
}

interface ProfilPerusahaanFormProps {
  initialData: ProfilPerusahaanData;
  provinces: ProvinceOption[];
  cities: CityOption[];
  onSave?: (
    data: ProfilPerusahaanData
  ) => Promise<{ success: boolean; error?: string }>;
  logoUploadComponent?: React.ReactNode;
}

export function ProfilPerusahaanForm({
  initialData,
  provinces,
  cities,
  onSave,
  logoUploadComponent,
}: ProfilPerusahaanFormProps) {
  const router = useRouter();
  const [name, setName] = useState(initialData.name);
  const [website, setWebsite] = useState(initialData.website || "");
  const [industry, setIndustry] = useState(initialData.industry || "");
  const [size, setSize] = useState<CompanySize | "">(
    initialData.size || ""
  );
  const [provinceId, setProvinceId] = useState<string>(
    initialData.provinceId ? String(initialData.provinceId) : ""
  );
  const [cityId, setCityId] = useState<string>(
    initialData.cityId ? String(initialData.cityId) : ""
  );
  const [addressNote, setAddressNote] = useState(
    initialData.addressNote || ""
  );
  const [description, setDescription] = useState(
    initialData.description || ""
  );

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Filter kota berdasarkan provinsi terpilih
  const filteredCities = useMemo(() => {
    if (!provinceId) return [];
    const provIdNum = Number(provinceId);
    return cities.filter((c) => c.province_id === provIdNum);
  }, [cities, provinceId]);

  const handleProvinceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newProvId = e.target.value;
    setProvinceId(newProvId);
    setCityId(""); // Reset pilihan kota saat provinsi berubah
    if (errors.provinceId) {
      setErrors((prev) => ({ ...prev, provinceId: "" }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!name.trim() || name.trim().length < NAME_MIN) {
      newErrors.name = `Nama perusahaan wajib diisi minimal ${NAME_MIN} karakter`;
    }
    if (!website.trim()) {
      newErrors.website = "Website resmi perusahaan wajib diisi sebagai bukti keberadaan operasional nyata";
    }
    if (!industry.trim()) {
      newErrors.industry = "Bidang industri perusahaan wajib diisi";
    }
    if (!size) {
      newErrors.size = "Ukuran tim perusahaan wajib dipilih";
    }
    if (!provinceId) {
      newErrors.provinceId = "Provinsi domisili operasional wajib dipilih";
    }
    if (!cityId) {
      newErrors.cityId = "Kota atau kabupaten domisili wajib dipilih";
    }
    if (!addressNote.trim() || addressNote.trim().length < 5) {
      newErrors.addressNote = "Alamat fisik kantor operasional wajib diisi minimal 5 karakter";
    }
    if (!description.trim() || description.trim().length < 40) {
      newErrors.description = "Deskripsi profil bisnis perusahaan wajib diisi minimal 40 karakter";
    }

    const fieldIdMap: Record<string, string> = {
      name: "company-name",
      website: "company-website",
      industry: "company-industry",
      size: "company-size",
      provinceId: "company-province",
      cityId: "company-city",
      addressNote: "company-address-note",
      description: "company-description",
    };

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      const firstKey = Object.keys(newErrors)[0];
      const targetId = fieldIdMap[firstKey];
      if (targetId) {
        setTimeout(() => {
          const el = document.getElementById(targetId);
          if (el) {
            el.scrollIntoView({ behavior: "smooth", block: "center" });
            try {
              el.focus({ preventScroll: true });
            } catch {}
          }
        }, 50);
      }
      return;
    }

    const validationResult = profilPerusahaanSchema.safeParse({
      name,
      website: website || null,
      industry: industry || null,
      size: size || null,
      provinceId: provinceId ? Number(provinceId) : null,
      cityId: cityId ? Number(cityId) : null,
      addressNote: addressNote || null,
      description: description || null,
    });

    if (!validationResult.success) {
      const errs = fieldErrors(validationResult.error);
      setErrors(errs);
      const firstKey = Object.keys(errs)[0];
      const targetId = fieldIdMap[firstKey];
      if (targetId) {
        setTimeout(() => {
          const el = document.getElementById(targetId);
          if (el) {
            el.scrollIntoView({ behavior: "smooth", block: "center" });
            try {
              el.focus({ preventScroll: true });
            } catch {}
          }
        }, 50);
      }
      return;
    }

    setErrors({});

    if (onSave) {
      setIsSubmitting(true);
      const res = await onSave(validationResult.data as ProfilPerusahaanData);
      setIsSubmitting(false);

      if (res.success) {
        setSuccessMessage("Profil dan data verifikasi perusahaan berhasil disimpan.");
        router.refresh();
      } else if (res.error) {
        setErrors({ general: res.error });
      }
    }
  };

  const sizeOptions = Object.entries(COMPANY_SIZE_OPTIONS).map(
    ([val, label]) => ({
      value: val,
      label,
    })
  );

  const provinceOptions = provinces.map((p) => ({
    value: String(p.id),
    label: p.name,
  }));

  const cityOptions = filteredCities.map((c) => {
    const cleanName = c.name
      .replace(/^(kabupaten|kota|kab\.)\s*/gi, "")
      .replace(/^(kabupaten|kota|kab\.)\s*/gi, "")
      .trim();
    return {
      value: String(c.id),
      label: `${c.type === "kota" ? "Kota" : "Kabupaten"} ${cleanName}`,
    };
  });

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-6">
      {successMessage && (
        <div
          role="status"
          className="p-4 rounded-control bg-green-50 border border-green-200 text-green-900 text-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
        >
          <div className="flex items-center gap-2.5">
            <Check className="w-5 h-5 shrink-0 text-green-600" aria-hidden="true" />
            <span>{successMessage}</span>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <Link
              href="/mitra"
              className="text-xs font-bold text-green-800 underline underline-offset-2 hover:text-green-950"
            >
              Ke Dashboard
            </Link>
            <Link
              href="/mitra/lowongan/tambah"
              className="text-xs font-bold px-3 py-1.5 rounded-full bg-green-700 text-white hover:bg-green-800 transition shadow-2xs"
            >
              Pasang Lowongan
            </Link>
          </div>
        </div>
      )}

      {errors.general && (
        <div
          role="alert"
          className="p-4 rounded-control bg-red-50 border border-red-200 text-red-700 text-sm"
        >
          {errors.general}
        </div>
      )}

      {/* Bagian Logo Perusahaan jika disediakan */}
      {logoUploadComponent}

      {/* Kartu Identitas Perusahaan */}
      <div className="bg-white rounded-card border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
        <div>
          <h2 className="text-lg font-bold text-navy-950 tracking-tight">
            Identitas Perusahaan
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Informasi dasar ini wajib diisi untuk membuktikan keaslian profil usaha Anda kepada pelamar kerja.
          </p>
        </div>

        {/* Nama Perusahaan */}
        <Input
          id="company-name"
          label="Nama Resmi Perusahaan"
          required
          type="text"
          placeholder="Contoh: PT Teknologi Nusantara"
          leftIcon={<Building2 className="w-4 h-4" />}
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            if (errors.name) setErrors((prev) => ({ ...prev, name: "" }));
          }}
          helperText={`Panjang nama antara ${NAME_MIN} sampai ${NAME_MAX} karakter.`}
          error={errors.name}
        />

        {/* Website Perusahaan */}
        <Input
          id="company-website"
          label="Website Resmi Perusahaan"
          required
          type="url"
          placeholder="Contoh: https://perusahaan.co.id"
          leftIcon={<Globe className="w-4 h-4" />}
          value={website}
          onChange={(e) => {
            setWebsite(e.target.value);
            if (errors.website) setErrors((prev) => ({ ...prev, website: "" }));
          }}
          helperText={`URL website resmi perusahaan sebagai bukti eksistensi publik (maksimal ${WEBSITE_MAX} karakter).`}
          error={errors.website}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          {/* Bidang Industri */}
          <Input
            id="company-industry"
            label="Bidang Industri"
            required
            type="text"
            placeholder="Contoh: Teknologi Informasi"
            leftIcon={<Briefcase className="w-4 h-4" />}
            value={industry}
            onChange={(e) => {
              setIndustry(e.target.value);
              if (errors.industry)
                setErrors((prev) => ({ ...prev, industry: "" }));
            }}
            helperText={`Maksimal ${INDUSTRY_MAX} karakter.`}
            error={errors.industry}
          />

          {/* Ukuran Perusahaan */}
          <Select
            id="company-size"
            label="Ukuran Perusahaan"
            required
            placeholder="Pilih jumlah karyawan"
            options={sizeOptions}
            value={size}
            onChange={(e) => {
              setSize(e.target.value as CompanySize | "");
              if (errors.size) setErrors((prev) => ({ ...prev, size: "" }));
            }}
            error={errors.size}
            helperText="Estimasi total tenaga kerja aktif."
          />
        </div>
      </div>

      {/* Kartu Lokasi Kantor */}
      <div className="bg-white rounded-card border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
        <div>
          <h2 className="text-lg font-bold text-navy-950 tracking-tight">
            Lokasi Kantor & Alamat
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Tentukan domisili kantor pusat atau cabang operasional perusahaan Anda.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          {/* Pilihan Provinsi */}
          <Select
            id="company-province"
            label="Provinsi Domisili"
            required
            placeholder="Pilih Provinsi"
            options={provinceOptions}
            value={provinceId}
            onChange={handleProvinceChange}
            error={errors.provinceId}
          />

          {/* Pilihan Kota/Kabupaten */}
          <Select
            id="company-city"
            label="Kota / Kabupaten"
            required
            placeholder={
              provinceId ? "Pilih Kota / Kabupaten" : "Pilih provinsi terlebih dahulu"
            }
            options={cityOptions}
            value={cityId}
            disabled={!provinceId}
            onChange={(e) => {
              setCityId(e.target.value);
              if (errors.cityId) setErrors((prev) => ({ ...prev, cityId: "" }));
            }}
            error={errors.cityId}
          />
        </div>

        {/* Catatan Area / Alamat Singkat */}
        <Input
          id="company-address-note"
          label="Alamat Fisik Kantor Operasional"
          required
          type="text"
          placeholder="Contoh: Gedung Artha Graha Lt. 12, Jl. Jend. Sudirman Kav 52-53"
          leftIcon={<MapPin className="w-4 h-4" />}
          value={addressNote}
          onChange={(e) => {
            setAddressNote(e.target.value);
            if (errors.addressNote)
              setErrors((prev) => ({ ...prev, addressNote: "" }));
          }}
          helperText={`Alamat lengkap atau patokan gedung kantor (maksimal ${ADDRESS_NOTE_MAX} karakter).`}
          error={errors.addressNote}
        />
      </div>

      {/* Kartu Tentang Perusahaan */}
      <div className="bg-white rounded-card border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
        <div>
          <h2 className="text-lg font-bold text-navy-950 tracking-tight">
            Tentang Perusahaan
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Ceritakan profil, budaya kerja, atau visi perusahaan untuk menarik pelamar terbaik.
          </p>
        </div>

        <Textarea
          id="company-description"
          label="Deskripsi Profil Perusahaan"
          required
          placeholder="Tuliskan latar belakang, produk atau layanan, serta nilai budaya kerja di perusahaan Anda (minimal 40 karakter)..."
          rows={5}
          showCount
          maxLength={DESCRIPTION_MAX}
          value={description}
          onChange={(e) => {
            setDescription(e.target.value);
            if (errors.description)
              setErrors((prev) => ({ ...prev, description: "" }));
          }}
          helperText={`Jelaskan secara ringkas dan informatif, minimal 40 karakter (maksimal ${DESCRIPTION_MAX} karakter).`}
          error={errors.description}
        />
      </div>

      {/* Peringatan error tepat di atas tombol submit agar user langsung tahu */}
      {Object.keys(errors).length > 0 && (
        <div
          role="alert"
          className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-800 text-xs sm:text-sm font-medium flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in fade-in slide-in-from-bottom-2 shadow-2xs"
        >
          <div className="flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" aria-hidden="true" />
            <span>
              <strong className="font-bold">Periksa isian:</strong>{" "}
              {errors.general || Object.values(errors)[0]}
            </span>
          </div>
          <button
            type="button"
            onClick={() => {
              const fieldIdMap: Record<string, string> = {
                name: "company-name",
                website: "company-website",
                industry: "company-industry",
                size: "company-size",
                provinceId: "company-province",
                cityId: "company-city",
                addressNote: "company-address-note",
                description: "company-description",
              };
              const firstKey = Object.keys(errors)[0];
              const targetId = fieldIdMap[firstKey];
              if (targetId) {
                const el = document.getElementById(targetId);
                if (el) {
                  el.scrollIntoView({ behavior: "smooth", block: "center" });
                  try {
                    el.focus({ preventScroll: true });
                  } catch {}
                }
              } else {
                window.scrollTo({ top: 120, behavior: "smooth" });
              }
            }}
            className="text-xs font-bold text-red-700 underline shrink-0 hover:text-red-900 cursor-pointer text-left sm:text-right"
          >
            Lihat Kolom yang Kurang
          </button>
        </div>
      )}

      {/* Tombol Simpan */}
      <div className="flex items-center justify-end gap-3 pt-2">
        <Button
          type="submit"
          variant="primary"
          size="md"
          isLoading={isSubmitting}
          className="px-6"
        >
          Simpan Profil Perusahaan
        </Button>
      </div>
    </form>
  );
}
