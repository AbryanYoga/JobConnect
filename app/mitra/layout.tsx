import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { MitraSidebar } from "@/components/mitra/MitraSidebar";

interface MitraLayoutProps {
  children: ReactNode;
}

export default async function MitraLayout({ children }: MitraLayoutProps) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?redirectTo=/mitra");
  }

  // Ambil profil dan peran pengguna
  const { data: profile } = await supabase
    .from("profiles")
    .select("role, name")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "company") {
    redirect("/403");
  }

  // Ambil data perusahaan milik akun ini
  const { data: company } = await supabase
    .from("companies")
    .select("id, name, logo_path")
    .eq("owner_id", user.id)
    .maybeSingle();

  let logoUrl: string | null = null;
  if (company?.logo_path) {
    const { data: publicUrlData } = supabase.storage
      .from("company-logos")
      .getPublicUrl(company.logo_path);
    logoUrl = publicUrlData.publicUrl;
  }

  const companyName = company?.name || profile?.name || "Perusahaan Mitra";

  return (
    <div className="min-h-screen bg-[#FAF8F0] text-black">
      <div className="mx-auto w-full max-w-[1600px] px-4 sm:px-6 lg:px-8 xl:px-10 py-6 sm:py-8">
        <div className="flex flex-col lg:flex-row gap-6 xl:gap-8 items-start">
          {/* Navigasi Samping Mitra */}
          <MitraSidebar
            companyName={companyName}
            companyLogoUrl={logoUrl}
            isVerified={Boolean(company?.id)}
          />

          {/* Konten Utama Halaman Mitra */}
          <main className="flex-1 w-full min-w-0" id="main-content">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
