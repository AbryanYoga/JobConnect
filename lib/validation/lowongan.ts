import { z } from "zod";
import {
  type EducationMin,
  type JobType,
  type WorkMode,
} from "../labels";

/**
 * Batas kriteria lowongan terstruktur JobConnect (PRD 3.7 & database/functions.sql).
 */
export const JOB_LIMITS = {
  title: { min: 5, max: 80 },
  summary: { min: 50, max: 280 },
  skills: { min: 1, max: 8, itemMax: 30 },
  responsibilities: { min: 3, max: 6, itemMax: 120 },
  niceToHave: { max: 5, itemMax: 120 },
  benefits: { max: 6, itemMax: 60 },
  experienceMinYears: { min: 0, max: 20 },
  locationDetail: { max: 100 },
} as const;

export const TITLE_MIN = JOB_LIMITS.title.min;
export const TITLE_MAX = JOB_LIMITS.title.max;
export const SUMMARY_MIN = JOB_LIMITS.summary.min;
export const SUMMARY_MAX = JOB_LIMITS.summary.max;
export const SKILLS_MIN = JOB_LIMITS.skills.min;
export const SKILLS_MAX = JOB_LIMITS.skills.max;
export const SKILL_ITEM_MAX = JOB_LIMITS.skills.itemMax;
export const RESPONSIBILITIES_MIN = JOB_LIMITS.responsibilities.min;
export const RESPONSIBILITIES_MAX = JOB_LIMITS.responsibilities.max;
export const RESPONSIBILITY_ITEM_MAX = JOB_LIMITS.responsibilities.itemMax;
export const NICE_TO_HAVE_MAX = JOB_LIMITS.niceToHave.max;
export const NICE_TO_HAVE_ITEM_MAX = JOB_LIMITS.niceToHave.itemMax;
export const BENEFITS_MAX = JOB_LIMITS.benefits.max;
export const BENEFIT_ITEM_MAX = JOB_LIMITS.benefits.itemMax;
export const EXPERIENCE_MIN_YEARS_MIN = JOB_LIMITS.experienceMinYears.min;
export const EXPERIENCE_MIN_YEARS_MAX = JOB_LIMITS.experienceMinYears.max;
export const LOCATION_DETAIL_MAX = JOB_LIMITS.locationDetail.max;

export const WORK_MODE_VALUES = [
  "onsite",
  "hybrid",
  "remote",
] as const satisfies readonly WorkMode[];

export const JOB_TYPE_VALUES = [
  "full_time",
  "part_time",
  "magang",
  "kontrak",
  "freelance",
] as const satisfies readonly JobType[];

export const EDUCATION_MIN_VALUES = [
  "tanpa_syarat",
  "sma_smk",
  "d3",
  "s1",
  "s2",
] as const satisfies readonly EducationMin[];

export const workModeEnum = z.enum(WORK_MODE_VALUES, {
  error: "Mode kerja harus salah satu dari: onsite, hybrid, atau remote",
});

export const jobTypeEnum = z.enum(JOB_TYPE_VALUES, {
  error: "Tipe pekerjaan tidak valid",
});

export const educationMinEnum = z.enum(EDUCATION_MIN_VALUES, {
  error: "Pendidikan minimal tidak valid",
});

/**
 * Mengambil tanggal hari ini format YYYY-MM-DD berdasarkan zona waktu Asia/Jakarta.
 */
export function getTodayJakarta(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Jakarta",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

/**
 * Memvalidasi apakah string merupakan format tanggal kalender yang valid (YYYY-MM-DD).
 */
export function isValidDateString(val: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(val)) return false;
  const [yearStr, monthStr, dayStr] = val.split("-");
  const year = Number(yearStr);
  const month = Number(monthStr);
  const day = Number(dayStr);
  const date = new Date(year, month - 1, day);
  return (
    date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day
  );
}

const skillItemSchema = z
  .string({ error: "Item keahlian harus berupa teks" })
  .trim()
  .min(1, "Setiap keahlian tidak boleh kosong")
  .max(
    JOB_LIMITS.skills.itemMax,
    `Setiap keahlian maksimal ${JOB_LIMITS.skills.itemMax} karakter`
  );

const responsibilityItemSchema = z
  .string({ error: "Item tanggung jawab harus berupa teks" })
  .trim()
  .min(1, "Setiap tanggung jawab tidak boleh kosong")
  .max(
    JOB_LIMITS.responsibilities.itemMax,
    `Setiap tanggung jawab maksimal ${JOB_LIMITS.responsibilities.itemMax} karakter`
  );

const niceToHaveItemSchema = z
  .string({ error: "Item nilai tambah harus berupa teks" })
  .trim()
  .min(1, "Setiap nilai tambah tidak boleh kosong")
  .max(
    JOB_LIMITS.niceToHave.itemMax,
    `Setiap nilai tambah maksimal ${JOB_LIMITS.niceToHave.itemMax} karakter`
  );

const benefitItemSchema = z
  .string({ error: "Item benefit harus berupa teks" })
  .trim()
  .min(1, "Setiap benefit tidak boleh kosong")
  .max(
    JOB_LIMITS.benefits.itemMax,
    `Setiap benefit maksimal ${JOB_LIMITS.benefits.itemMax} karakter`
  );

function validateUniqueSkills(items: string[]): boolean {
  const lowers = items.map((item) => item.toLowerCase());
  return new Set(lowers).size === lowers.length;
}

/**
 * Skema penyimpanan draft lowongan (hanya judul yang wajib, semua batas atas berlaku).
 * Selaras dengan batasan relasional dan CHECK di schema.sql.
 */
export const jobDraftSchema = z
  .object({
    title: z
      .string({ error: "Judul lowongan wajib diisi" })
      .trim()
      .min(1, "Judul lowongan wajib diisi")
      .max(
        JOB_LIMITS.title.max,
        `Judul lowongan maksimal ${JOB_LIMITS.title.max} karakter`
      ),
    categoryId: z
      .number({ error: "Kategori pekerjaan harus berupa angka" })
      .int("Kategori pekerjaan tidak valid")
      .positive("Kategori pekerjaan tidak valid")
      .nullish()
      .transform((val) => val ?? null),
    provinceId: z
      .number({ error: "Provinsi harus berupa angka" })
      .int("Provinsi tidak valid")
      .positive("Provinsi tidak valid")
      .nullish()
      .transform((val) => val ?? null),
    cityId: z
      .number({ error: "Kota harus berupa angka" })
      .int("Kota tidak valid")
      .positive("Kota tidak valid")
      .nullish()
      .transform((val) => val ?? null),
    locationDetail: z
      .string()
      .nullish()
      .transform((val) => {
        if (!val) return null;
        const trimmed = val.trim();
        return trimmed || null;
      })
      .refine(
        (val) => !val || val.length <= JOB_LIMITS.locationDetail.max,
        `Area atau alamat singkat maksimal ${JOB_LIMITS.locationDetail.max} karakter`
      ),
    workMode: workModeEnum.default("onsite"),
    jobType: jobTypeEnum.default("full_time"),
    educationMin: educationMinEnum.default("tanpa_syarat"),
    experienceMinYears: z
      .number({ error: "Pengalaman minimal harus berupa angka" })
      .int("Pengalaman minimal harus berupa bilangan bulat")
      .nullish()
      .transform((val) => (val === null || val === undefined ? 0 : val))
      .refine(
        (val) =>
          val >= JOB_LIMITS.experienceMinYears.min &&
          val <= JOB_LIMITS.experienceMinYears.max,
        `Pengalaman minimal harus antara ${JOB_LIMITS.experienceMinYears.min} sampai ${JOB_LIMITS.experienceMinYears.max} tahun`
      ),
    skills: z
      .array(skillItemSchema)
      .nullish()
      .transform((val) => val ?? [])
      .refine(
        (items) => items.length <= JOB_LIMITS.skills.max,
        `Keahlian maksimal ${JOB_LIMITS.skills.max} item`
      )
      .refine(validateUniqueSkills, {
        message: "Keahlian tidak boleh ganda (duplikat)",
      }),
    summary: z
      .string({ error: "Ringkasan harus berupa teks" })
      .nullish()
      .transform((val) => {
        if (!val) return null;
        const trimmed = val.trim();
        return trimmed || null;
      })
      .refine(
        (val) => !val || val.length <= JOB_LIMITS.summary.max,
        `Ringkasan maksimal ${JOB_LIMITS.summary.max} karakter`
      ),
    responsibilities: z
      .array(responsibilityItemSchema)
      .nullish()
      .transform((val) => val ?? [])
      .refine(
        (items) => items.length <= JOB_LIMITS.responsibilities.max,
        `Tanggung jawab maksimal ${JOB_LIMITS.responsibilities.max} item`
      ),
    niceToHave: z
      .array(niceToHaveItemSchema)
      .nullish()
      .transform((val) => val ?? [])
      .refine(
        (items) => items.length <= JOB_LIMITS.niceToHave.max,
        `Nilai tambah maksimal ${JOB_LIMITS.niceToHave.max} item`
      ),
    benefits: z
      .array(benefitItemSchema)
      .nullish()
      .transform((val) => val ?? [])
      .refine(
        (items) => items.length <= JOB_LIMITS.benefits.max,
        `Benefit maksimal ${JOB_LIMITS.benefits.max} item`
      ),
    salaryMin: z
      .number({ error: "Gaji minimal harus berupa angka" })
      .int("Gaji minimal harus berupa bilangan bulat")
      .min(0, "Gaji minimal tidak boleh negatif")
      .nullish()
      .transform((val) => val ?? null),
    salaryMax: z
      .number({ error: "Gaji maksimal harus berupa angka" })
      .int("Gaji maksimal harus berupa bilangan bulat")
      .min(0, "Gaji maksimal tidak boleh negatif")
      .nullish()
      .transform((val) => val ?? null),
    deadline: z
      .string()
      .nullish()
      .transform((val) => {
        if (!val) return null;
        const trimmed = val.trim();
        return trimmed || null;
      })
      .refine(
        (val) => !val || isValidDateString(val),
        "Format batas waktu lamaran harus YYYY-MM-DD yang valid"
      ),
    aiScreening: z.boolean().default(true),
  })
  .refine(
    (data) => {
      if (data.salaryMin !== null && data.salaryMax !== null) {
        return data.salaryMax >= data.salaryMin;
      }
      return true;
    },
    {
      message: "Gaji maksimal tidak boleh lebih kecil dari gaji minimal",
      path: ["salaryMax"],
    }
  );

/**
 * Skema pengajuan lowongan pekerjaan (aturan lengkap submit_job di database/functions.sql & PRD 3.7).
 * Catatan PRD 3.7: Form tidak menyediakan kolom usia, jenis kelamin, agama, status pernikahan,
 * atau penampilan agar lowongan tidak diskriminatif.
 */
export const jobSubmitSchema = z
  .object({
    title: z
      .string({ error: "Judul lowongan wajib diisi" })
      .trim()
      .min(
        JOB_LIMITS.title.min,
        `Judul lowongan minimal ${JOB_LIMITS.title.min} karakter`
      )
      .max(
        JOB_LIMITS.title.max,
        `Judul lowongan maksimal ${JOB_LIMITS.title.max} karakter`
      ),
    categoryId: z
      .number({ error: "Kategori pekerjaan wajib dipilih" })
      .int("Kategori pekerjaan tidak valid")
      .positive("Kategori pekerjaan wajib dipilih"),
    provinceId: z
      .number({ error: "Provinsi harus berupa angka" })
      .int("Provinsi tidak valid")
      .positive("Provinsi tidak valid")
      .nullish()
      .transform((val) => val ?? null),
    cityId: z
      .number({ error: "Kota harus berupa angka" })
      .int("Kota tidak valid")
      .positive("Kota tidak valid")
      .nullish()
      .transform((val) => val ?? null),
    locationDetail: z
      .string()
      .nullish()
      .transform((val) => {
        if (!val) return null;
        const trimmed = val.trim();
        return trimmed || null;
      })
      .refine(
        (val) => !val || val.length <= JOB_LIMITS.locationDetail.max,
        `Area atau alamat singkat maksimal ${JOB_LIMITS.locationDetail.max} karakter`
      ),
    workMode: workModeEnum.default("onsite"),
    jobType: jobTypeEnum.default("full_time"),
    educationMin: educationMinEnum.default("tanpa_syarat"),
    experienceMinYears: z
      .number({ error: "Pengalaman minimal harus berupa angka" })
      .int("Pengalaman minimal harus berupa bilangan bulat")
      .optional()
      .transform((val) => (val === undefined ? 0 : val))
      .refine(
        (val) =>
          val >= JOB_LIMITS.experienceMinYears.min &&
          val <= JOB_LIMITS.experienceMinYears.max,
        `Pengalaman minimal harus antara ${JOB_LIMITS.experienceMinYears.min} sampai ${JOB_LIMITS.experienceMinYears.max} tahun`
      ),
    skills: z
      .array(skillItemSchema, {
        error: "Keahlian wajib diisi (minimal 1 keahlian)",
      })
      .min(
        JOB_LIMITS.skills.min,
        `Keahlian harus minimal ${JOB_LIMITS.skills.min} item`
      )
      .max(
        JOB_LIMITS.skills.max,
        `Keahlian maksimal ${JOB_LIMITS.skills.max} item`
      )
      .refine(validateUniqueSkills, {
        message: "Keahlian tidak boleh ganda (duplikat)",
      }),
    summary: z
      .string({ error: "Ringkasan pekerjaan wajib diisi" })
      .trim()
      .min(
        JOB_LIMITS.summary.min,
        `Ringkasan minimal ${JOB_LIMITS.summary.min} karakter`
      )
      .max(
        JOB_LIMITS.summary.max,
        `Ringkasan maksimal ${JOB_LIMITS.summary.max} karakter`
      ),
    responsibilities: z
      .array(responsibilityItemSchema, {
        error: "Tanggung jawab utama wajib diisi (minimal 3 item)",
      })
      .min(
        JOB_LIMITS.responsibilities.min,
        `Tanggung jawab harus ${JOB_LIMITS.responsibilities.min} sampai ${JOB_LIMITS.responsibilities.max} item`
      )
      .max(
        JOB_LIMITS.responsibilities.max,
        `Tanggung jawab harus ${JOB_LIMITS.responsibilities.min} sampai ${JOB_LIMITS.responsibilities.max} item`
      ),
    niceToHave: z
      .array(niceToHaveItemSchema)
      .nullish()
      .transform((val) => val ?? [])
      .refine(
        (items) => items.length <= JOB_LIMITS.niceToHave.max,
        `Nilai tambah maksimal ${JOB_LIMITS.niceToHave.max} item`
      ),
    benefits: z
      .array(benefitItemSchema)
      .nullish()
      .transform((val) => val ?? [])
      .refine(
        (items) => items.length <= JOB_LIMITS.benefits.max,
        `Benefit maksimal ${JOB_LIMITS.benefits.max} item`
      ),
    salaryMin: z
      .number({ error: "Gaji minimal harus berupa angka" })
      .int("Gaji minimal harus berupa bilangan bulat")
      .min(0, "Gaji minimal tidak boleh negatif")
      .nullish()
      .transform((val) => val ?? null),
    salaryMax: z
      .number({ error: "Gaji maksimal harus berupa angka" })
      .int("Gaji maksimal harus berupa bilangan bulat")
      .min(0, "Gaji maksimal tidak boleh negatif")
      .nullish()
      .transform((val) => val ?? null),
    deadline: z
      .string({ error: "Batas waktu lamaran (deadline) wajib diisi" })
      .trim()
      .refine(
        (val) => isValidDateString(val),
        "Format batas waktu lamaran harus YYYY-MM-DD yang valid"
      )
      .refine(
        (val) => val >= getTodayJakarta(),
        "Batas waktu lamaran tidak boleh di masa lalu (minimal hari ini)"
      ),
    aiScreening: z.boolean().default(true),
  })
  .refine(
    (data) => {
      if (data.salaryMin !== null && data.salaryMax !== null) {
        return data.salaryMax >= data.salaryMin;
      }
      return true;
    },
    {
      message: "Gaji maksimal tidak boleh lebih kecil dari gaji minimal",
      path: ["salaryMax"],
    }
  )
  .refine(
    (data) => {
      if (data.workMode !== "remote") {
        return typeof data.cityId === "number" && data.cityId > 0;
      }
      return true;
    },
    {
      message: "Kota penempatan wajib dipilih untuk mode kerja non-remote",
      path: ["cityId"],
    }
  );

export type JobDraftInput = z.infer<typeof jobDraftSchema>;
export type JobSubmitInput = z.infer<typeof jobSubmitSchema>;
