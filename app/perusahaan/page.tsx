import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { CompanyEditorialLanding } from "@/components/perusahaan/CompanyEditorialLanding";

export const metadata: Metadata = {
  title: "Pasang Lowongan & Rekrut Talenta Terverifikasi - JobConnect untuk Perusahaan",
  description:
    "Publikasikan lowongan kerja resmi, kelola kandidat pelamar di 38 provinsi, dan rekrut talenta terbaik tanpa calo dan bebas pungutan liar.",
};

export default async function PerusahaanLandingPage() {
  let companiesCount = 0;
  let openJobsCount = 0;
  let provincesCount = 38;

  try {
    const supabase = await createClient();
    const [compRes, jobsRes, provRes] = await Promise.all([
      supabase.from("companies").select("id", { count: "exact", head: true }),
      supabase.from("jobs").select("id", { count: "exact", head: true }).eq("status", "open"),
      supabase.from("provinces").select("id", { count: "exact", head: true }),
    ]);

    companiesCount = compRes.count || 0;
    openJobsCount = jobsRes.count || 0;
    if (provRes.count && provRes.count > 0) {
      provincesCount = provRes.count;
    }
  } catch {
    // Fallback default jika koneksi database offline
  }

  return (
    <CompanyEditorialLanding
      companiesCount={companiesCount}
      openJobsCount={openJobsCount}
      provincesCount={provincesCount}
    />
  );
}
