/**
 * Helper terpusat untuk memetakan nama perusahaan ke aset logo resmi perusahaan.
 * Digunakan sebagai fallback cerdas bila logo_path di storage Supabase belum diisi
 * atau pada data contoh dan katalog perusahaan.
 */

export function getCompanyLogo(name?: string | null): string | null {
  if (!name) return null;
  const lower = name.toLowerCase();

  // 1. Perusahaan Contoh / Data Demo
  if (lower.includes("solusi teknologi") || lower.includes("solusi-teknologi")) {
    return "/logos/companies/solusi-teknologi.svg";
  }
  if (lower.includes("logistik mandiri") || lower.includes("logistik-mandiri")) {
    return "/logos/companies/logistik-mandiri.svg";
  }
  if (lower.includes("karya nusantara") || lower.includes("karya-nusantara")) {
    return "/logos/companies/karya-nusantara.svg";
  }

  // 2. Perusahaan Mitra Nasional Terverifikasi
  if (lower.includes("telkom")) return "/logos/companies/telkom.svg";
  if (lower.includes("mandiri")) return "/logos/companies/mandiri.svg";
  if (lower.includes("bca")) return "/logos/companies/bca.svg";
  if (lower.includes("gojek")) return "/logos/companies/gojek.svg";
  if (lower.includes("bri")) return "/logos/companies/bri.svg";
  if (lower.includes("solusi")) return "/logos/companies/solusi-pintar.svg";

  return null;
}

export function getCompanyInitials(name: string): string {
  if (!name) return "CO";
  const words = name
    .trim()
    .split(/\s+/)
    .filter((w) => !["pt", "cv", "tbk", "ud"].includes(w.toLowerCase()));
  if (words.length >= 2) {
    return (words[0][0] + words[1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}
