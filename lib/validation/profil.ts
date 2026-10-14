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
  {
    error: "Ukuran perusahaan tidak valid",
  }
);

/**
 * Normalisasi dan validasi nomor telepon Indonesia.
 * Menerima format 08xx, +628xx, atau 628xx dengan panjang 9 sampai 14 digit.
 * Spasi dan tanda hubung dibersihkan, output dinormalisasi ke 08xx.
 */
export const phoneSchema = z
  .union([z.string(), z.null(), z.undefined()])
  .transform((val) => {
    if (!val) return "";
    return val.replace(/[\s-]/g, "").trim();
  })
  .refine(
    (val) => {
      if (!val) return true;
      let normalized = val;
      if (normalized.startsWith("+628")) {
        normalized = "08" + normalized.slice(4);
      } else if (normalized.startsWith("628")) {
        normalized = "08" + normalized.slice(3);
      }
      return /^08\d{7,12}$/.test(normalized);
    },
    {
      message:
        "Nomor telepon tidak valid. Gunakan format Indonesia, contoh: 08123456789",
    }
  )
  .transform((val) => {
    if (!val) return null;
    let normalized = val;
    if (normalized.startsWith("+628")) {
      normalized = "08" + normalized.slice(4);
    } else if (normalized.startsWith("628")) {
      normalized = "08" + normalized.slice(3);
    }
    return normalized;
  });

/**
 * Normalisasi dan validasi URL website perusahaan.
 * Menambahkan https:// bila pengguna menulis tanpa protokol.
 */
export const websiteSchema = z
  .union([z.string(), z.null(), z.undefined()])
  .transform((val) => {
    if (!val) return "";
    return val.trim();
  })
  .refine(
    (val) => {
      if (!val) return true;
      let urlStr = val;
      const lower = urlStr.toLowerCase();
      if (!lower.startsWith("http://") && !lower.startsWith("https://")) {
        urlStr = "https://" + urlStr;
      }
      if (urlStr.length > WEBSITE_MAX) return false;
      try {
        const parsed = new URL(urlStr);
        return (
          (parsed.protocol === "http:" || parsed.protocol === "https:") &&
          parsed.hostname.includes(".")
        );
      } catch {
        return false;
      }
    },
    {
      message:
        "Website harus berupa URL yang valid (maksimal 200 karakter). Contoh: https://perusahaan.com",
    }
  )
  .transform((val) => {
    if (!val) return null;
    let urlStr = val;
    const lower = urlStr.toLowerCase();
    if (!lower.startsWith("http://") && !lower.startsWith("https://")) {
      urlStr = "https://" + urlStr;
    }
    return urlStr;
  });

export const profilPelamarSchema = z.object({
  name: z
    .string()
    .trim()
    .min(NAME_MIN, `Nama minimal ${NAME_MIN} karakter`)
    .max(NAME_MAX, `Nama maksimal ${NAME_MAX} karakter`),
  phone: phoneSchema,
  headline: z
    .union([z.string(), z.null(), z.undefined()])
    .transform((val) => {
      if (!val) return null;
      const trimmed = val.trim();
      return trimmed || null;
    })
    .refine(
      (val) => !val || val.length <= HEADLINE_MAX,
      `Headline maksimal ${HEADLINE_MAX} karakter`
    ),
  emailNotifications: z.boolean().default(true),
});

export type ProfilPelamarInput = z.infer<typeof profilPelamarSchema>;

export const profilPerusahaanSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(NAME_MIN, `Nama minimal ${NAME_MIN} karakter`)
      .max(NAME_MAX, `Nama maksimal ${NAME_MAX} karakter`),
    website: websiteSchema,
    industry: z
      .union([z.string(), z.null(), z.undefined()])
      .transform((val) => {
        if (!val) return null;
        const trimmed = val.trim();
        return trimmed || null;
      })
      .refine(
        (val) => !val || val.length <= INDUSTRY_MAX,
        `Industri maksimal ${INDUSTRY_MAX} karakter`
      ),
    size: z
      .union([companySizeEnum, z.literal(""), z.null(), z.undefined()])
      .transform((val) => (val ? (val as CompanySize) : null)),
    provinceId: z
      .union([z.number(), z.string(), z.null(), z.undefined()])
      .transform((val) => {
        if (val === null || val === undefined || val === "") return null;
        const n = Number(val);
        return isNaN(n) ? null : n;
      }),
    cityId: z
      .union([z.number(), z.string(), z.null(), z.undefined()])
      .transform((val) => {
        if (val === null || val === undefined || val === "") return null;
        const n = Number(val);
        return isNaN(n) ? null : n;
      }),
    addressNote: z
      .union([z.string(), z.null(), z.undefined()])
      .transform((val) => {
        if (!val) return null;
        const trimmed = val.trim();
        return trimmed || null;
      })
      .refine(
        (val) => !val || val.length <= ADDRESS_NOTE_MAX,
        `Catatan alamat maksimal ${ADDRESS_NOTE_MAX} karakter`
      ),
    description: z
      .union([z.string(), z.null(), z.undefined()])
      .transform((val) => {
        if (!val) return null;
        const trimmed = val.trim();
        return trimmed || null;
      })
      .refine(
        (val) => !val || val.length <= DESCRIPTION_MAX,
        `Deskripsi maksimal ${DESCRIPTION_MAX} karakter`
      ),
  })
  .refine(
    (data) => {
      if (data.cityId !== null && data.cityId !== undefined) {
        return data.provinceId !== null && data.provinceId !== undefined;
      }
      return true;
    },
    {
      message: "Provinsi wajib dipilih jika kota/kabupaten dipilih",
      path: ["provinceId"],
    }
  );

export type ProfilPerusahaanInput = z.infer<typeof profilPerusahaanSchema>;

export const LOGO_MAX_BYTES = 2 * 1024 * 1024;
export const LOGO_BUCKET = "company-logos";
export const LOGO_ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;
export const LOGO_ERROR_MESSAGE =
  "Logo harus berformat PNG, JPG, atau WEBP dan maksimal 2 MB";

export type LogoExtension = "jpg" | "png" | "webp";

/**
 * Validasi berkas logo perusahaan.
 * Memeriksa tipe MIME, batas ukuran (maksimal 2 MB), dan magic bytes berkas.
 */
export async function validateLogoFile(
  file: File
): Promise<
  { ok: true; extension: LogoExtension } | { ok: false; message: string }
> {
  if (!file || typeof file.slice !== "function") {
    return { ok: false, message: LOGO_ERROR_MESSAGE };
  }

  if (
    !LOGO_ALLOWED_TYPES.includes(
      file.type as (typeof LOGO_ALLOWED_TYPES)[number]
    )
  ) {
    return { ok: false, message: LOGO_ERROR_MESSAGE };
  }

  if (file.size <= 0 || file.size > LOGO_MAX_BYTES) {
    return { ok: false, message: LOGO_ERROR_MESSAGE };
  }

  try {
    const slice = file.slice(0, 12);
    const buffer = await slice.arrayBuffer();
    const bytes = new Uint8Array(buffer);

    if (file.type === "image/png") {
      if (
        bytes.length >= 8 &&
        bytes[0] === 0x89 &&
        bytes[1] === 0x50 &&
        bytes[2] === 0x4e &&
        bytes[3] === 0x47
      ) {
        return { ok: true, extension: "png" };
      }
    } else if (file.type === "image/jpeg") {
      if (
        bytes.length >= 3 &&
        bytes[0] === 0xff &&
        bytes[1] === 0xd8 &&
        bytes[2] === 0xff
      ) {
        return { ok: true, extension: "jpg" };
      }
    } else if (file.type === "image/webp") {
      if (
        bytes.length >= 12 &&
        bytes[0] === 0x52 &&
        bytes[1] === 0x49 &&
        bytes[2] === 0x46 &&
        bytes[3] === 0x46 &&
        bytes[8] === 0x57 &&
        bytes[9] === 0x45 &&
        bytes[10] === 0x42 &&
        bytes[11] === 0x50
      ) {
        return { ok: true, extension: "webp" };
      }
    }
  } catch {
    return { ok: false, message: LOGO_ERROR_MESSAGE };
  }

  return { ok: false, message: LOGO_ERROR_MESSAGE };
}

/**
 * Menghasilkan jalur penyimpanan logo di bucket 'company-logos'.
 * Format: "${companyId}/logo-${timestamp}.${extension}" selaras dengan
 * fungsi database owns_logo_folder() yang memeriksa folder level pertama.
 */
export function buildLogoPath(
  companyId: number | string,
  extension: LogoExtension
): string {
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
  if (!company) {
    const missing = [
      "Nama resmi perusahaan",
      "Website resmi (bukti keberadaan publik)",
      "Bidang industri",
      "Ukuran tim perusahaan",
      "Domisili kota operasional",
      "Alamat fisik kantor operasional",
      "Deskripsi profil bisnis",
      "Logo resmi perusahaan",
    ];
    return {
      hasName: false,
      hasWebsite: false,
      hasIndustry: false,
      hasSize: false,
      hasLocation: false,
      hasAddressNote: false,
      hasDescription: false,
      hasLogo: false,
      isComplete: false,
      completedCount: 0,
      totalRequired: missing.length,
      missingFields: missing,
    };
  }

  const hasName = Boolean(company.name && company.name.trim().length >= 3);
  const hasWebsite = Boolean(company.website && company.website.trim().length > 0);
  const hasIndustry = Boolean(company.industry && company.industry.trim().length > 0);
  const hasSize = Boolean(company.size && company.size.trim().length > 0);
  const city = company.city_id ?? company.cityId;
  const hasLocation = Boolean(city !== null && city !== undefined);
  const address = company.address_note ?? company.addressNote;
  const hasAddressNote = Boolean(address && address.trim().length >= 5);
  const hasDescription = Boolean(company.description && company.description.trim().length >= 40);
  const hasLogo = Boolean(
    (company.logo_path && company.logo_path.trim().length > 0) ||
    (company.logoPath && company.logoPath.trim().length > 0) ||
    (company.logoUrl && company.logoUrl.trim().length > 0)
  );

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

  const completedCount = checks.filter((c) => c.ok).length;
  const missingFields = checks.filter((c) => !c.ok).map((c) => c.key);
  const isComplete = completedCount === checks.length;

  return {
    hasName,
    hasWebsite,
    hasIndustry,
    hasSize,
    hasLocation,
    hasAddressNote,
    hasDescription,
    hasLogo,
    isComplete,
    completedCount,
    totalRequired: checks.length,
    missingFields,
  };
}

