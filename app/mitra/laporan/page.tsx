import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  MitraLaporanView,
  type RekapLowonganItem,
  type ApplicationDetailItem,
  type CompanyInfo,
} from "@/components/mitra/MitraLaporanView";
import type { LaporanExportItem } from "@/components/mitra/LaporanExportButtons";
import { getCompanyLogo } from "@/lib/company-logo";

export const metadata: Metadata = {
  title: "Laporan Rekapitulasi Pelamar - Mitra JobConnect",
  description:
    "Laporan berkala rekapitulasi pengajuan lamaran dan alur seleksi kandidat perusahaan mitra JobConnect.",
};

interface LaporanPageProps {
  searchParams: Promise<{
    mulai?: string;
    selesai?: string;
    lowongan?: string;
  }>;
}

function formatDateIndo(dateStr: string): string {
  try {
    return new Intl.DateTimeFormat("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }).format(new Date(dateStr));
  } catch {
    return dateStr;
  }
}

export default async function LaporanMitraPage({ searchParams }: LaporanPageProps) {
  const params = await searchParams;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?redirectTo=/mitra/laporan");
  }

  // Ambil data perusahaan yang dimiliki oleh akun mitra ini beserta lokasi dan logonya
  const { data: rawCompany } = await supabase
    .from("companies")
    .select(`
      id,
      name,
      slug,
      logo_path,
      industry,
      address_note,
      city:cities (
        name,
        type,
        province:provinces (name)
      )
    `)
    .eq("owner_id", user.id)
    .maybeSingle();

  if (!rawCompany) {
    redirect("/mitra/profil-perusahaan");
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const rawCity: any = Array.isArray(rawCompany.city) ? rawCompany.city[0] : rawCompany.city;
  const rawProvince = Array.isArray(rawCity?.province) ? rawCity.province[0] : rawCity?.province;
  const locationText = [
    rawCity ? `${rawCity.type === "kota" ? "Kota" : "Kab."} ${rawCity.name}` : null,
    rawProvince?.name,
  ]
    .filter(Boolean)
    .join(", ");

  const fallbackLogo = rawCompany.name ? getCompanyLogo(rawCompany.name) : null;
  let effectiveLogo: string | null = null;
  if (rawCompany.logo_path) {
    if (
      rawCompany.logo_path.startsWith("http://") ||
      rawCompany.logo_path.startsWith("https://") ||
      rawCompany.logo_path.startsWith("/")
    ) {
      effectiveLogo = rawCompany.logo_path;
    } else {
      const { data: publicUrlData } = supabase.storage
        .from("company-logos")
        .getPublicUrl(rawCompany.logo_path);
      effectiveLogo = publicUrlData?.publicUrl || null;
    }
  } else if (fallbackLogo) {
    effectiveLogo = fallbackLogo;
  }

  const company: CompanyInfo = {
    id: rawCompany.id,
    name: rawCompany.name,
    slug: rawCompany.slug,
    logoUrl: effectiveLogo,
    industry: rawCompany.industry,
    location: locationText,
    addressNote: rawCompany.address_note,
  };

  // Tentukan batas rentang tanggal (default 30 hari terakhir)
  const today = new Date();
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(today.getDate() - 30);

  const defaultStartDate = thirtyDaysAgo.toISOString().split("T")[0];
  const defaultEndDate = today.toISOString().split("T")[0];

  const startDate = params.mulai || defaultStartDate;
  const endDate = params.selesai || defaultEndDate;
  const selectedJobId = params.lowongan ? Number(params.lowongan) : null;

  // 1. Ambil daftar lowongan milik perusahaan untuk dropdown filter dan rekapitulasi
  const { data: companyJobs } = await supabase
    .from("jobs")
    .select("id, title, status, created_at")
    .eq("company_id", company.id)
    .order("created_at", { ascending: false });

  const jobsList = companyJobs || [];
  const jobIds = jobsList.map((j) => j.id);

  // 2. Ambil data lamaran dalam rentang tanggal
  let applications: ApplicationDetailItem[] = [];

  if (jobIds.length > 0) {
    const targetJobIds = selectedJobId ? [selectedJobId] : jobIds;

    const { data: appData, error: appError } = await supabase
      .from("applications")
      .select(`
        id,
        job_id,
        user_id,
        status,
        created_at,
        updated_at,
        decided_at,
        applicant:profiles!user_id(id, name, email, phone)
      `)
      .in("job_id", targetJobIds)
      .gte("created_at", `${startDate}T00:00:00Z`)
      .lte("created_at", `${endDate}T23:59:59Z`)
      .order("created_at", { ascending: false });

    if (!appError && appData) {
      // Petakan judul lowongan
      const jobTitleMap = new Map<number, string>();
      jobsList.forEach((j) => jobTitleMap.set(j.id, j.title));

      applications = appData.map((item) => {
        const applicantData = Array.isArray(item.applicant)
          ? item.applicant[0]
          : item.applicant;

        return {
          id: item.id,
          job_id: item.job_id,
          user_id: item.user_id,
          status: item.status,
          created_at: item.created_at,
          updated_at: item.updated_at,
          decided_at: item.decided_at,
          applicant: applicantData || null,
          jobTitle: jobTitleMap.get(item.job_id) || "Lowongan Kerja",
        };
      });
    }
  }

  // Hitung ringkasan statistik dari database nyata
  const totalPelamar = applications.length;
  const dalamProses = applications.filter((a) =>
    ["dikirim", "ditinjau", "shortlist", "wawancara"].includes(a.status)
  ).length;
  const diterima = applications.filter((a) =>
    ["ditawari", "diterima"].includes(a.status)
  ).length;
  const ditolak = applications.filter((a) =>
    ["ditolak", "ditarik"].includes(a.status)
  ).length;

  // Hitung rekap per lowongan
  const rekapLowongan: RekapLowonganItem[] = jobsList.map((job) => {
    const pelamarLowongan = applications.filter((a) => a.job_id === job.id);
    return {
      id: job.id,
      title: job.title,
      status: job.status,
      total: pelamarLowongan.length,
      dalamProses: pelamarLowongan.filter((a) =>
        ["dikirim", "ditinjau", "shortlist", "wawancara"].includes(a.status)
      ).length,
      diterima: pelamarLowongan.filter((a) =>
        ["ditawari", "diterima"].includes(a.status)
      ).length,
      ditolak: pelamarLowongan.filter((a) =>
        ["ditolak", "ditarik"].includes(a.status)
      ).length,
    };
  });

  // Siapkan data untuk ekspor CSV
  const exportItems: LaporanExportItem[] = applications.map((app, index) => ({
    no: index + 1,
    tanggalMelamar: formatDateIndo(app.created_at),
    namaPelamar: app.applicant?.name || "Nama Tidak Tersedia",
    email: app.applicant?.email || "-",
    telepon: app.applicant?.phone || "-",
    posisiLowongan: app.jobTitle || "-",
    statusSeleksi: app.status,
    tanggalUpdate: formatDateIndo(app.updated_at),
  }));

  const isFiltered = Boolean(params.mulai || params.selesai || params.lowongan);

  return (
    <MitraLaporanView
      company={company}
      startDate={startDate}
      endDate={endDate}
      selectedJobId={selectedJobId}
      jobsList={jobsList.map((j) => ({ id: j.id, title: j.title }))}
      totalPelamar={totalPelamar}
      dalamProses={dalamProses}
      diterima={diterima}
      ditolak={ditolak}
      rekapLowongan={rekapLowongan}
      applications={applications}
      exportItems={exportItems}
      isFiltered={isFiltered}
    />
  );
}
