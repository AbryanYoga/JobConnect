import { z } from "zod";
import { type EducationMin, type JobType, type WorkMode } from "../labels";

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

export const WORK_MODE_VALUES = ["onsite", "hybrid", "remote"] as const satisfies readonly WorkMode[];
export const JOB_TYPE_VALUES = ["full_time", "part_time", "magang", "kontrak", "freelance"] as const satisfies readonly JobType[];
export const EDUCATION_MIN_VALUES = ["tanpa_syarat", "sma_smk", "d3", "s1", "s2"] as const satisfies readonly EducationMin[];

export const workModeEnum = z.enum(WORK_MODE_VALUES, { error: "Mode kerja harus salah satu dari: onsite, hybrid, atau remote" });
export const jobTypeEnum = z.enum(JOB_TYPE_VALUES, { error: "Tipe pekerjaan tidak valid" });
export const educationMinEnum = z.enum(EDUCATION_MIN_VALUES, { error: "Pendidikan minimal tidak valid" });

export function getTodayJakarta(): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Jakarta", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());
}

export function isValidDateString(val: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(val)) return false;
  const [y, m, d] = val.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  return date.getFullYear() === y && date.getMonth() === m - 1 && date.getDate() === d;
}

const itemSchema = (label: string, max: number) =>
  z.string({ error: `Item ${label} harus berupa teks` }).trim().min(1, `Setiap ${label} tidak boleh kosong`).max(max, `Setiap ${label} maksimal ${max} karakter`);

const skillItemSchema = itemSchema("keahlian", JOB_LIMITS.skills.itemMax);
const responsibilityItemSchema = itemSchema("tanggung jawab", JOB_LIMITS.responsibilities.itemMax);
const niceToHaveItemSchema = itemSchema("nilai tambah", JOB_LIMITS.niceToHave.itemMax);
const benefitItemSchema = itemSchema("benefit", JOB_LIMITS.benefits.itemMax);

const validateUniqueSkills = (items: string[]) => new Set(items.map((i) => i.toLowerCase())).size === items.length;

const nullishId = (err: string) => z.number({ error: err }).int(err).positive(err).nullish().transform((v) => v ?? null);
const nullishTrim = (max: number, msg: string) => z.string().nullish().transform((v) => (v ? v.trim() || null : null)).refine((v) => !v || v.length <= max, msg);
const nullishSalary = (label: string) => z.number({ error: `${label} harus berupa angka` }).int(`${label} harus berupa bilangan bulat`).min(0, `${label} tidak boleh negatif`).nullish().transform((v) => v ?? null);

const commonJobFields = {
  provinceId: nullishId("Provinsi tidak valid"),
  cityId: nullishId("Kota tidak valid"),
  locationDetail: nullishTrim(JOB_LIMITS.locationDetail.max, `Area atau alamat singkat maksimal ${JOB_LIMITS.locationDetail.max} karakter`),
  workMode: workModeEnum.default("onsite"),
  jobType: jobTypeEnum.default("full_time"),
  educationMin: educationMinEnum.default("tanpa_syarat"),
  niceToHave: z.array(niceToHaveItemSchema).nullish().transform((v) => v ?? []).refine((items) => items.length <= JOB_LIMITS.niceToHave.max, `Nilai tambah maksimal ${JOB_LIMITS.niceToHave.max} item`),
  benefits: z.array(benefitItemSchema).nullish().transform((v) => v ?? []).refine((items) => items.length <= JOB_LIMITS.benefits.max, `Benefit maksimal ${JOB_LIMITS.benefits.max} item`),
  salaryMin: nullishSalary("Gaji minimal"),
  salaryMax: nullishSalary("Gaji maksimal"),
  aiScreening: z.boolean().default(false),
};

const salaryRefine = <T extends { salaryMin: number | null; salaryMax: number | null }>(schema: z.ZodType<T>) =>
  schema.refine((d) => (d.salaryMin !== null && d.salaryMax !== null ? d.salaryMax >= d.salaryMin : true), {
    message: "Gaji maksimal tidak boleh lebih kecil dari gaji minimal",
    path: ["salaryMax"],
  });

export const jobDraftSchema = salaryRefine(
  z.object({
    title: z.string({ error: "Judul lowongan wajib diisi" }).trim().min(1, "Judul lowongan wajib diisi").max(JOB_LIMITS.title.max, `Judul lowongan maksimal ${JOB_LIMITS.title.max} karakter`),
    categoryId: nullishId("Kategori pekerjaan tidak valid"),
    ...commonJobFields,
    experienceMinYears: z.number({ error: "Pengalaman minimal harus berupa angka" }).int().nullish().transform((v) => (v === null || v === undefined ? 0 : v)).refine((v) => v >= JOB_LIMITS.experienceMinYears.min && v <= JOB_LIMITS.experienceMinYears.max, `Pengalaman minimal harus antara ${JOB_LIMITS.experienceMinYears.min} sampai ${JOB_LIMITS.experienceMinYears.max} tahun`),
    skills: z.array(skillItemSchema).nullish().transform((v) => v ?? []).refine((items) => items.length <= JOB_LIMITS.skills.max, `Keahlian maksimal ${JOB_LIMITS.skills.max} item`).refine(validateUniqueSkills, { message: "Keahlian tidak boleh ganda (duplikat)" }),
    summary: nullishTrim(JOB_LIMITS.summary.max, `Ringkasan maksimal ${JOB_LIMITS.summary.max} karakter`),
    responsibilities: z.array(responsibilityItemSchema).nullish().transform((v) => v ?? []).refine((items) => items.length <= JOB_LIMITS.responsibilities.max, `Tanggung jawab maksimal ${JOB_LIMITS.responsibilities.max} item`),
    deadline: z.string().nullish().transform((v) => (v ? v.trim() || null : null)).refine((v) => !v || isValidDateString(v), "Format batas waktu lamaran harus YYYY-MM-DD yang valid"),
  })
);

export const jobSubmitSchema = salaryRefine(
  z.object({
    title: z.string({ error: "Judul lowongan wajib diisi" }).trim().min(JOB_LIMITS.title.min, `Judul lowongan minimal ${JOB_LIMITS.title.min} karakter`).max(JOB_LIMITS.title.max, `Judul lowongan maksimal ${JOB_LIMITS.title.max} karakter`),
    categoryId: z.number({ error: "Kategori pekerjaan wajib dipilih" }).int("Kategori pekerjaan tidak valid").positive("Kategori pekerjaan wajib dipilih"),
    ...commonJobFields,
    experienceMinYears: z.number({ error: "Pengalaman minimal harus berupa angka" }).int("Pengalaman minimal harus berupa bilangan bulat").optional().transform((v) => (v === undefined ? 0 : v)).refine((v) => v >= JOB_LIMITS.experienceMinYears.min && v <= JOB_LIMITS.experienceMinYears.max, `Pengalaman minimal harus antara ${JOB_LIMITS.experienceMinYears.min} sampai ${JOB_LIMITS.experienceMinYears.max} tahun`),
    skills: z.array(skillItemSchema, { error: "Keahlian wajib diisi (minimal 1 keahlian)" }).min(JOB_LIMITS.skills.min, `Keahlian harus minimal ${JOB_LIMITS.skills.min} item`).max(JOB_LIMITS.skills.max, `Keahlian maksimal ${JOB_LIMITS.skills.max} item`).refine(validateUniqueSkills, { message: "Keahlian tidak boleh ganda (duplikat)" }),
    summary: z.string({ error: "Ringkasan pekerjaan wajib diisi" }).trim().min(JOB_LIMITS.summary.min, `Ringkasan minimal ${JOB_LIMITS.summary.min} karakter`).max(JOB_LIMITS.summary.max, `Ringkasan maksimal ${JOB_LIMITS.summary.max} karakter`),
    responsibilities: z.array(responsibilityItemSchema, { error: "Tanggung jawab utama wajib diisi (minimal 3 item)" }).min(JOB_LIMITS.responsibilities.min, `Tanggung jawab harus ${JOB_LIMITS.responsibilities.min} sampai ${JOB_LIMITS.responsibilities.max} item`).max(JOB_LIMITS.responsibilities.max, `Tanggung jawab harus ${JOB_LIMITS.responsibilities.min} sampai ${JOB_LIMITS.responsibilities.max} item`),
    deadline: z.string({ error: "Batas waktu lamaran (deadline) wajib diisi" }).trim().refine(isValidDateString, "Format batas waktu lamaran harus YYYY-MM-DD yang valid").refine((v) => v >= getTodayJakarta(), "Batas waktu lamaran tidak boleh di masa lalu (minimal hari ini)"),
  })
).refine((d) => (d.workMode !== "remote" ? typeof d.cityId === "number" && d.cityId > 0 : true), {
  message: "Kota penempatan wajib dipilih untuk mode kerja non-remote",
  path: ["cityId"],
});

export type JobDraftInput = z.infer<typeof jobDraftSchema>;
export type JobSubmitInput = z.infer<typeof jobSubmitSchema>;
