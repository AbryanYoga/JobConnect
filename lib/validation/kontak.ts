import { z } from "zod";
import { hasProfanity } from "./profanity";

export const kontakSchema = z.object({
  nama: z
    .string({ error: "Nama lengkap wajib diisi" })
    .trim()
    .min(3, "Nama lengkap minimal 3 karakter")
    .max(100, "Nama lengkap maksimal 100 karakter")
    .refine((val) => !hasProfanity(val), {
      message: "Nama mengandung kata yang tidak pantas",
    }),
  email: z
    .string({ error: "Alamat email wajib diisi" })
    .trim()
    .email("Format alamat email tidak valid")
    .max(150, "Email maksimal 150 karakter"),
  kategori: z
    .enum(["umum", "pelamar", "mitra", "kendala"], {
      error: "Pilih kategori pesan yang sesuai",
    })
    .default("umum"),
  pesan: z
    .string({ error: "Isi pesan wajib diisi" })
    .trim()
    .min(10, "Pesan minimal 10 karakter")
    .max(1000, "Pesan maksimal 1000 karakter")
    .refine((val) => !hasProfanity(val), {
      message: "Isi pesan mengandung kata yang tidak pantas",
    }),
});

export type KontakInput = z.infer<typeof kontakSchema>;
