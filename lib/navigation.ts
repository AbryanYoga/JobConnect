export type Role = "tamu" | "pelamar" | "perusahaan" | "admin";

export interface NavItem {
  label: string;
  href: string;
}

export type ActionVariant = "text" | "outline" | "primary";

export interface NavAction {
  label: string;
  href: string;
  variant: ActionVariant;
}

export const NAV_LINKS_BY_ROLE: Record<Role, NavItem[]> = {
  tamu: [
    { label: "Beranda", href: "/" },
    { label: "Lowongan", href: "/lowongan" },
    { label: "Wilayah", href: "/wilayah" },
    { label: "Panduan & FAQ", href: "/tentang" },
  ],
  pelamar: [
    { label: "Lowongan", href: "/lowongan" },
    { label: "Wilayah", href: "/wilayah" },
    { label: "Lamaran Saya", href: "/lamaran-saya" },
    { label: "Tersimpan", href: "/tersimpan" },
  ],
  perusahaan: [
    { label: "Dashboard", href: "/mitra" },
    { label: "Kelola Lowongan", href: "/mitra/lowongan" },
  ],
  admin: [
    { label: "Dashboard", href: "/admin" },
    { label: "Antrean Review", href: "/admin/lowongan" },
  ],
};

export const NAV_ACTIONS_BY_ROLE: Record<Role, NavAction[]> = {
  tamu: [
    {
      label: "Pasang Lowongan",
      href: "/register?peran=perusahaan",
      variant: "text",
    },
    {
      label: "Masuk",
      href: "/login",
      variant: "outline",
    },
    {
      label: "Daftar",
      href: "/register",
      variant: "primary",
    },
  ],
  pelamar: [],
  perusahaan: [
    {
      label: "Pasang Lowongan",
      href: "/mitra/lowongan/tambah",
      variant: "primary",
    },
  ],
  admin: [],
};
