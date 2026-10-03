import { z } from "zod";

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
      .max(NAME_MAX, `Nama maksimal ${NAME_MAX} karakter`),
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
