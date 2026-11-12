import { z } from "zod";
import { CompanySize } from "../labels";
import { NAME_MAX, NAME_MIN } from "./auth";

export const HEADLINE_MAX = 120;
export const WEBSITE_MAX = 200;
export const INDUSTRY_MAX = 60;
export const ADDRESS_NOTE_MAX = 150;
export const DESCRIPTION_MAX = 1500;

export { NAME_MAX, NAME_MIN };

export const companySizeEnum = z.enum(
  ["1-10", "11-50", "51-200", "201-500", "501+"] as const,
  { error: "Ukuran perusahaan tidak valid" }
);

const trimmedOptional = (max: number, msg: string) =>
  z.union([z.string(), z.null(), z.undefined()])
    .transform((val) => (val ? val.trim() || null : null))
    .refine((val) => !val || val.length <= max, msg);

const optionalId = () =>
  z.union([z.number(), z.string(), z.null(), z.undefined()])
    .transform((val) => (val === null || val === undefined || val === "" || isNaN(Number(val)) ? null : Number(val)));

function parseIndonesianPhone(val: unknown): { raw: string; normalized: string; isValid: boolean } {
  if (!val || typeof val !== "string") return { raw: "", normalized: "", isValid: true };
  const clean = val.replace(/[\s-]/g, "").trim();
  if (!clean) return { raw: "", normalized: "", isValid: true };
  const norm = clean.startsWith("+628") ? "08" + clean.slice(4) : clean.startsWith("628") ? "08" + clean.slice(3) : clean;
  return { raw: clean, normalized: norm, isValid: /^08\d{7,12}$/.test(norm) };
}

export const phoneSchema = z
  .union([z.string(), z.null(), z.undefined()])
  .refine((val) => parseIndonesianPhone(val).isValid, {
    message: "Nomor telepon tidak valid. Gunakan format Indonesia, contoh: 08123456789",
  })
  .transform((val) => parseIndonesianPhone(val).normalized || null);

export const websiteSchema = z
  .union([z.string(), z.null(), z.undefined()])
  .transform((val) => {
    if (!val || typeof val !== "string") return "";
    const trimmed = val.trim();
    if (!trimmed) return "";
    return !/^https?:\/\//i.test(trimmed) ? `https://${trimmed}` : trimmed;
  })
  .refine((val) => {
    if (!val) return true;
    if (val.length > WEBSITE_MAX) return false;
    try {
      const parsed = new URL(val);
      return (parsed.protocol === "http:" || parsed.protocol === "https:") && parsed.hostname.includes(".");
    } catch {
      return false;
    }
  }, {
    message: "Website harus berupa URL yang valid (maksimal 200 karakter). Contoh: https://perusahaan.com",
  })
  .transform((val) => val || null);

export interface PortfolioItem {
  id: string;
  title: string;
  description: string;
  url?: string | null;
  skills?: string[] | null;
  year?: string | null;
}

export const portfolioItemSchema = z.object({
  id: z.string().default(() => Math.random().toString(36).substring(2, 9)),
  title: z
    .string()
    .trim()
    .min(2, "Judul portofolio minimal 2 karakter")
    .max(120, "Judul portofolio maksimal 120 karakter"),
  description: z
    .string()
    .trim()
    .max(500, "Deskripsi portofolio maksimal 500 karakter")
    .default(""),
  url: websiteSchema,
  skills: z.array(z.string().trim()).default([]),
  year: z.union([z.string(), z.null(), z.undefined()]).transform((val) => (val ? val.trim() : null)),
});

export const EDUCATION_LEVEL_OPTIONS = [
  { value: "sma_smk", label: "SMA / SMK Sederajat" },
  { value: "d3", label: "Diploma (D3 / D4)" },
  { value: "s1", label: "Sarjana (S1)" },
  { value: "s2", label: "Magister (S2)" },
  { value: "s3", label: "Doktor (S3)" },
  { value: "lainnya", label: "Pendidikan Non-formal / Lainnya" },
] as const;

export function calculateAge(birthDateString: string | null | undefined): number | null {
  if (!birthDateString) return null;
  const birth = new Date(birthDateString);
  if (isNaN(birth.getTime())) return null;
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age >= 0 && age <= 120 ? age : null;
}

export const profilPelamarSchema = z.object({
  name: z
    .string()
    .trim()
    .min(NAME_MIN, `Nama minimal ${NAME_MIN} karakter`)
    .max(NAME_MAX, `Nama maksimal ${NAME_MAX} karakter`),
  phone: phoneSchema,
  headline: trimmedOptional(HEADLINE_MAX, `Headline maksimal ${HEADLINE_MAX} karakter`),
  provinceId: optionalId(),
  cityId: optionalId(),
  birthDate: z
    .union([z.string(), z.null(), z.undefined()])
    .transform((val) => (val && val.trim() ? val.trim() : null))
    .refine((val) => {
      if (!val) return true;
      const d = new Date(val);
      if (isNaN(d.getTime())) return false;
      const age = calculateAge(val);
      return age !== null && age >= 15 && age <= 90;
    }, "Tanggal lahir tidak valid (usia minimal 15 tahun dan maksimal 90 tahun)"),
  educationLevel: z
    .union([z.string(), z.null(), z.undefined()])
    .transform((val) => (val && val.trim() ? val.trim() : null)),
  educationInstitution: trimmedOptional(150, "Institusi pendidikan maksimal 150 karakter"),
  bio: trimmedOptional(1500, "Bio profil maksimal 1500 karakter"),
  linkedinUrl: websiteSchema,
  portfolioUrl: websiteSchema,
  portfolios: z.array(portfolioItemSchema).default([]),
  emailNotifications: z.boolean().default(true),
  avatarUrl: z.union([z.string(), z.null(), z.undefined()]).optional(),
});

export type ProfilPelamarInput = z.infer<typeof profilPelamarSchema>;

export const profilPerusahaanSchema = z
  .object({
    name: z.string().trim().min(NAME_MIN, `Nama minimal ${NAME_MIN} karakter`).max(NAME_MAX, `Nama maksimal ${NAME_MAX} karakter`),
    website: websiteSchema,
    industry: trimmedOptional(INDUSTRY_MAX, `Industri maksimal ${INDUSTRY_MAX} karakter`),
    size: z.union([companySizeEnum, z.literal(""), z.null(), z.undefined()]).transform((val) => (val ? (val as CompanySize) : null)),
    provinceId: optionalId(),
    cityId: optionalId(),
    addressNote: trimmedOptional(ADDRESS_NOTE_MAX, `Catatan alamat maksimal ${ADDRESS_NOTE_MAX} karakter`),
    description: trimmedOptional(DESCRIPTION_MAX, `Deskripsi maksimal ${DESCRIPTION_MAX} karakter`),
  })
  .refine(
    (data) => (data.cityId !== null && data.cityId !== undefined ? data.provinceId !== null && data.provinceId !== undefined : true),
    { message: "Provinsi wajib dipilih jika kota/kabupaten dipilih", path: ["provinceId"] }
  );

export type ProfilPerusahaanInput = z.infer<typeof profilPerusahaanSchema>;

export const LOGO_MAX_BYTES = 2 * 1024 * 1024;
export const LOGO_BUCKET = "company-logos";
export const LOGO_ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;
export const LOGO_ERROR_MESSAGE = "Logo harus berformat PNG, JPG, atau WEBP dan maksimal 2 MB";
export type LogoExtension = "jpg" | "png" | "webp";

export const AVATAR_MAX_BYTES = 2 * 1024 * 1024;
export const AVATAR_BUCKET = "avatars";
export const AVATAR_ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;
export const AVATAR_ERROR_MESSAGE = "Foto profil harus berformat PNG, JPG, atau WEBP dan maksimal 2 MB";
export type AvatarExtension = "jpg" | "png" | "webp";

export async function validateAvatarFile(
  file: File
): Promise<{ ok: true; extension: AvatarExtension } | { ok: false; message: string }> {
  if (!file || typeof file.slice !== "function" || !AVATAR_ALLOWED_TYPES.includes(file.type as (typeof AVATAR_ALLOWED_TYPES)[number]) || file.size <= 0 || file.size > AVATAR_MAX_BYTES) {
    return { ok: false, message: AVATAR_ERROR_MESSAGE };
  }

  try {
    const bytes = new Uint8Array(await file.slice(0, 12).arrayBuffer());
    if (file.type === "image/png" && bytes.length >= 8 && bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47) {
      return { ok: true, extension: "png" };
    }
    if (file.type === "image/jpeg" && bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
      return { ok: true, extension: "jpg" };
    }
    if (file.type === "image/webp" && bytes.length >= 12 && bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x46 && bytes[8] === 0x57 && bytes[9] === 0x45 && bytes[10] === 0x42 && bytes[11] === 0x50) {
      return { ok: true, extension: "webp" };
    }
  } catch {
    return { ok: false, message: AVATAR_ERROR_MESSAGE };
  }
  return { ok: false, message: AVATAR_ERROR_MESSAGE };
}

export async function validateLogoFile(
  file: File
): Promise<{ ok: true; extension: LogoExtension } | { ok: false; message: string }> {
  if (!file || typeof file.slice !== "function" || !LOGO_ALLOWED_TYPES.includes(file.type as (typeof LOGO_ALLOWED_TYPES)[number]) || file.size <= 0 || file.size > LOGO_MAX_BYTES) {
    return { ok: false, message: LOGO_ERROR_MESSAGE };
  }

  try {
    const bytes = new Uint8Array(await file.slice(0, 12).arrayBuffer());
    if (file.type === "image/png" && bytes.length >= 8 && bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47) {
      return { ok: true, extension: "png" };
    }
    if (file.type === "image/jpeg" && bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
      return { ok: true, extension: "jpg" };
    }
    if (file.type === "image/webp" && bytes.length >= 12 && bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x46 && bytes[8] === 0x57 && bytes[9] === 0x45 && bytes[10] === 0x42 && bytes[11] === 0x50) {
      return { ok: true, extension: "webp" };
    }
  } catch {
    return { ok: false, message: LOGO_ERROR_MESSAGE };
  }
  return { ok: false, message: LOGO_ERROR_MESSAGE };
}

export function buildLogoPath(companyId: number | string, extension: LogoExtension): string {
  return `${companyId}/logo-${Date.now()}.${extension}`;
}

export interface CompanyVerificationStatus {
  hasName: boolean;
  hasWebsite: boolean;
  hasIndustry: boolean;
  hasSize: boolean;
  hasLocation: boolean;
  hasAddressNote: boolean;
  hasDescription: boolean;
  hasLogo: boolean;
  isComplete: boolean;
  completedCount: number;
  totalRequired: number;
  missingFields: string[];
}

export function checkCompanyVerification(company?: {
  name?: string | null;
  website?: string | null;
  industry?: string | null;
  size?: string | null;
  city_id?: number | null;
  cityId?: number | null;
  address_note?: string | null;
  addressNote?: string | null;
  description?: string | null;
  logo_path?: string | null;
  logoPath?: string | null;
  logoUrl?: string | null;
} | null): CompanyVerificationStatus {
  const c = company || {};
  const hasName = Boolean(c.name && c.name.trim().length >= 3);
  const hasWebsite = Boolean(c.website && c.website.trim().length > 0);
  const hasIndustry = Boolean(c.industry && c.industry.trim().length > 0);
  const hasSize = Boolean(c.size && c.size.trim().length > 0);
  const city = c.city_id ?? c.cityId;
  const hasLocation = city !== null && city !== undefined;
  const address = c.address_note ?? c.addressNote;
  const hasAddressNote = Boolean(address && address.trim().length >= 5);
  const hasDescription = Boolean(c.description && c.description.trim().length >= 40);
  const hasLogo = Boolean((c.logo_path && c.logo_path.trim()) || (c.logoPath && c.logoPath.trim()) || (c.logoUrl && c.logoUrl.trim()));

  const checks = [
    { key: "Nama resmi perusahaan", ok: hasName },
    { key: "Website resmi (bukti keberadaan publik)", ok: hasWebsite },
    { key: "Bidang industri", ok: hasIndustry },
    { key: "Ukuran tim perusahaan", ok: hasSize },
    { key: "Kota domisili operasional", ok: hasLocation },
    { key: "Alamat fisik kantor operasional", ok: hasAddressNote },
    { key: "Deskripsi profil bisnis (minimal 40 karakter)", ok: hasDescription },
    { key: "Logo resmi perusahaan", ok: hasLogo },
  ];

  const completedCount = checks.filter((item) => item.ok).length;
  return {
    hasName,
    hasWebsite,
    hasIndustry,
    hasSize,
    hasLocation,
    hasAddressNote,
    hasDescription,
    hasLogo,
    isComplete: completedCount === checks.length,
    completedCount,
    totalRequired: checks.length,
    missingFields: checks.filter((item) => !item.ok).map((item) => item.key),
  };
}

