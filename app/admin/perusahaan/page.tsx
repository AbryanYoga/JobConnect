import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { CompanyManagerView, type CompanyItem } from "@/components/admin/CompanyManagerView";

export const metadata: Metadata = {
  title: "Manajemen Perusahaan Mitra",
  description:
    "Pantau entitas perusahaan mitra, verifikasi identitas instansi, kontak penanggung jawab, dan kelola lowongan aktif di JobConnect.",
};

export default async function AdminPerusahaanPage() {
  const supabase = await createClient();

  // Ambil data seluruh perusahaan beserta relasi kota, profil pemilik, dan lowongan
  const { data: rawCompanies } = await supabase
    .from("companies")
    .select(
      `
      id,
      name,
      slug,
      logo_path,
      website,
      industry,
      size,
      address_note,
      created_at,
      cities:city_id (
        id,
        name,
        provinces:province_id (
          id,
          name
        )
      ),
      profiles:owner_id (
        id,
        name,
        email,
        phone
      ),
      jobs (
        id,
        status
      )
    `
    )
    .order("created_at", { ascending: false });

  const allCompanies: CompanyItem[] =
    (rawCompanies as unknown as CompanyItem[]) || [];

  return <CompanyManagerView companies={allCompanies} />;
}
