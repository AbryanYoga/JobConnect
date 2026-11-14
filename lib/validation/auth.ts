import { z } from "zod";
import { hasProfanity } from "./profanity";

export const PASSWORD_MIN = 8;
export const PASSWORD_MAX = 72;
export const NAME_MIN = 2;
export const NAME_MAX = 100;
export const EMAIL_MAX = 254;

export const peranEnum = z.enum(["pelamar", "perusahaan"], {
  error: "Pilih peran sebagai pelamar atau perusahaan",
});

export type Peran = z.infer<typeof peranEnum>;

export const registerSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(NAME_MIN, `Nama minimal ${NAME_MIN} karakter`)
      .max(NAME_MAX, `Nama maksimal ${NAME_MAX} karakter`)
      .refine((val) => !hasProfanity(val), {
        message: "Nama mengandung kata yang tidak pantas. Harap gunakan nama asli yang sopan.",
      }),
    email: z
      .string()
      .trim()
      .toLowerCase()
      .min(1, "Email wajib diisi")
      .email("Email tidak valid. Contoh: nama@email.com")
      .max(EMAIL_MAX, `Email maksimal ${EMAIL_MAX} karakter`),
    password: z
      .string()
      .min(PASSWORD_MIN, `Kata sandi minimal ${PASSWORD_MIN} karakter`)
      .max(PASSWORD_MAX, `Kata sandi maksimal ${PASSWORD_MAX} karakter`),
    confirmPassword: z
      .string()
      .min(1, "Konfirmasi kata sandi wajib diisi"),
    peran: peranEnum,
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Konfirmasi kata sandi tidak sama",
    path: ["confirmPassword"],
  });

export type RegisterInput = z.infer<typeof registerSchema>;

export const companyRegisterSchema = z
  .object({
    picName: z
      .string()
      .trim()
      .min(NAME_MIN, `Nama penanggung jawab minimal ${NAME_MIN} karakter`)
      .max(NAME_MAX, `Nama penanggung jawab maksimal ${NAME_MAX} karakter`)
      .refine((val) => !hasProfanity(val), {
        message: "Nama mengandung kata yang tidak pantas. Harap gunakan nama asli yang sopan.",
      }),
    companyName: z
      .string()
      .trim()
      .min(NAME_MIN, `Nama perusahaan minimal ${NAME_MIN} karakter`)
      .max(NAME_MAX, `Nama perusahaan maksimal ${NAME_MAX} karakter`)
      .refine((val) => !hasProfanity(val), {
        message: "Nama perusahaan mengandung kata yang tidak pantas.",
      }),
    email: z
      .string()
      .trim()
      .toLowerCase()
      .min(1, "Email kantor wajib diisi")
      .email("Format email tidak valid. Contoh: hrd@perusahaan.co.id")
      .max(EMAIL_MAX, `Email maksimal ${EMAIL_MAX} karakter`),
    phone: z
      .string()
      .trim()
      .min(9, "Nomor telepon atau WhatsApp minimal 9 digit")
      .max(16, "Nomor telepon atau WhatsApp maksimal 16 digit")
      .regex(/^[0-9+\-\s()]+$/, "Nomor telepon hanya boleh berisi angka dan tanda hubung"),
    password: z
      .string()
      .min(PASSWORD_MIN, `Kata sandi minimal ${PASSWORD_MIN} karakter`)
      .max(PASSWORD_MAX, `Kata sandi maksimal ${PASSWORD_MAX} karakter`),
    confirmPassword: z.string().min(1, "Konfirmasi kata sandi wajib diisi"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Konfirmasi kata sandi tidak sama",
    path: ["confirmPassword"],
  });

export type CompanyRegisterInput = z.infer<typeof companyRegisterSchema>;

export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .min(1, "Email wajib diisi")
    .email("Email tidak valid. Contoh: nama@email.com"),
  password: z.string().min(1, "Kata sandi wajib diisi"),
});

export type LoginInput = z.infer<typeof loginSchema>;

/**
 * Memetakan peran pendaftaran ke role database.
 * Nilai admin sengaja tidak ada dalam pemetaan ini untuk mencegah eskalasi hak akses.
 */
export function peranToRole(peran: Peran): "user" | "company" {
  if (peran === "pelamar") {
    return "user";
  }
  if (peran === "perusahaan") {
    return "company";
  }
  throw new Error(`Peran tidak valid: ${peran}`);
}
