const LOGO_PATTERNS: [RegExp, string][] = [
  [/solusi[- ]teknologi/i, "/logos/companies/solusi-teknologi.svg"],
  [/logistik[- ]mandiri/i, "/logos/companies/logistik-mandiri.svg"],
  [/karya[- ]nusantara/i, "/logos/companies/karya-nusantara.svg"],
  [/telkom/i, "/logos/companies/telkom.svg"],
  [/mandiri/i, "/logos/companies/mandiri.svg"],
  [/bca/i, "/logos/companies/bca.svg"],
  [/gojek/i, "/logos/companies/gojek.svg"],
  [/bri/i, "/logos/companies/bri.svg"],
  [/solusi/i, "/logos/companies/solusi-pintar.svg"],
];

export function getCompanyLogo(name?: string | null): string | null {
  if (!name) return null;
  return LOGO_PATTERNS.find(([re]) => re.test(name))?.[1] ?? null;
}

export function getCompanyInitials(name: string): string {
  if (!name) return "CO";
  const words = name.trim().split(/\s+/).filter((w) => !["pt", "cv", "tbk", "ud"].includes(w.toLowerCase()));
  return words.length >= 2 ? (words[0][0] + words[1][0]).toUpperCase() : name.slice(0, 2).toUpperCase();
}
