import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { JobForm } from "@/components/mitra/JobForm";
import { ShieldCheck } from "lucide-react";

export const metadata: Metadata = {
  title: "Pasang Lowongan Baru - Dashboard Mitra",
  description: "Formulir pengajuan lowongan pekerjaan resmi terstruktur mitra JobConnect.",
};

export default async function TambahLowonganPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?redirectTo=/mitra/lowongan/tambah");
  }

  // Cek peran perusahaan
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "company") {
    redirect("/403");
  }

  // Cek kelengkapan data perusahaan
  const { data: company } = await supabase
    .from("companies")
    .select("id, name, city_id")
    .eq("owner_id", user.id)
    .maybeSingle();

  if (!company || !company.city_id) {
    redirect("/mitra");
  }

  // Ambil daftar kategori dari database
  const { data: categoriesData } = await supabase
    .from("categories")
    .select("id, name, slug")
    .order("name", { ascending: true });

  const categories = categoriesData || [];

  // Ambil daftar provinsi dan kota resmi untuk dropdown berjenjang
  const { data: provincesData } = await supabase
    .from("provinces")
    .select("id, name")
    .order("name", { ascending: true });

  const { data: citiesData } = await supabase
    .from("cities")
    .select("id, province_id, name, type")
    .order("name", { ascending: true });

  const provinces = provincesData || [];
  const cities = citiesData || [];

  return (
    <div className="space-y-8">
      {/* Breadcrumb Navigasi */}
      <Breadcrumb
        items={[
          { label: "Beranda", href: "/" },
          { label: "Mitra", href: "/mitra" },
          { label: "Kelola Lowongan", href: "/mitra/lowongan" },
          { label: "Pasang Lowongan" },
        ]}
      />

      {/* Header Formulir Pengajuan */}
      <div className="bg-white rounded-3xl border border-black/[0.08] p-6 sm:p-8 shadow-card space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" aria-hidden="true" />
          <span>Verifikasi Moderasi Admin</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-black tracking-tight">
          Pasang Lowongan Pekerjaan Baru
        </h1>
        <p className="text-sm text-slate-600 font-medium max-w-2xl leading-relaxed">
          Tentukan kualifikasi yang jelas dan terstruktur. Setelah diajukan, lowongan akan ditinjau oleh admin JobConnect sebelum ditayangkan ke publik demi menjamin platform bebas dari calo dan penipuan.
        </p>
      </div>

      {/* Form Kriteria Terstruktur dengan Lokasi Berjenjang */}
      <JobForm categories={categories} provinces={provinces} cities={cities} />
    </div>
  );
}
