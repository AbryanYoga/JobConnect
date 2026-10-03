"use client";

import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Building2,
  Globe,
  Briefcase,
  MapPin,
  Check,
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
    setSuccessMessage(null);

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
      setErrors(fieldErrors(validationResult.error));
      return;
    }

    setErrors({});

    if (onSave) {
      setIsSubmitting(true);
      const res = await onSave(validationResult.data as ProfilPerusahaanData);
      setIsSubmitting(false);

      if (res.success) {
        setSuccessMessage("Profil perusahaan berhasil diperbarui.");
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

  const cityOptions = filteredCities.map((c) => ({
    value: String(c.id),
    label: `${c.type === "kota" ? "Kota" : "Kabupaten"} ${c.name}`,
  }));

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-6">
      {successMessage && (
        <div
          role="status"
          className="p-4 rounded-control bg-green-50 border border-green-200 text-green-800 text-sm flex items-center gap-2.5"
        >
          <Check className="w-4 h-4 shrink-0 text-green-600" aria-hidden="true" />
          <span>{successMessage}</span>
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
            Informasi dasar ini akan ditampilkan pada setiap lowongan yang Anda pasang.
          </p>
        </div>

        {/* Nama Perusahaan */}
        <Input
          id="company-name"
          label="Nama Perusahaan"
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
          type="url"
          placeholder="Contoh: https://perusahaan.co.id"
          leftIcon={<Globe className="w-4 h-4" />}
          value={website}
          onChange={(e) => {
            setWebsite(e.target.value);
            if (errors.website) setErrors((prev) => ({ ...prev, website: "" }));
          }}
          helperText={`URL website resmi perusahaan (maksimal ${WEBSITE_MAX} karakter).`}
          error={errors.website}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          {/* Bidang Industri */}
          <Input
            id="company-industry"
            label="Bidang Industri"
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
            label="Provinsi"
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
          label="Area atau Alamat Singkat"
          type="text"
          placeholder="Contoh: Kawasan Mega Kuningan, Jakarta Selatan"
          leftIcon={<MapPin className="w-4 h-4" />}
          value={addressNote}
          onChange={(e) => {
            setAddressNote(e.target.value);
            if (errors.addressNote)
              setErrors((prev) => ({ ...prev, addressNote: "" }));
          }}
          helperText={`Patokan atau area singkat (maksimal ${ADDRESS_NOTE_MAX} karakter).`}
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
          placeholder="Tuliskan latar belakang, produk atau layanan, serta nilai budaya kerja di perusahaan Anda..."
          rows={5}
          showCount
          maxLength={DESCRIPTION_MAX}
          value={description}
          onChange={(e) => {
            setDescription(e.target.value);
            if (errors.description)
              setErrors((prev) => ({ ...prev, description: "" }));
          }}
          helperText={`Jelaskan secara ringkas dan informatif (maksimal ${DESCRIPTION_MAX} karakter).`}
          error={errors.description}
        />
      </div>

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
