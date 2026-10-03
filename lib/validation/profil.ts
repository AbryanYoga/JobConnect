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
