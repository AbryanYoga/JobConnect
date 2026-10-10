import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { FolderTree } from "lucide-react";
import { CategoryManager, type CategoryItem } from "@/components/admin/CategoryManager";

export const metadata: Metadata = {
  title: "Kelola Kategori Lowongan",
  description: "Manajemen dan penyusunan kategori lowongan kerja pada platform JobConnect.",
};

export default async function AdminKategoriPage() {
  const supabase = await createClient();

  // Ambil seluruh kategori
  const { data: categoriesData } = await supabase
    .from("categories")
    .select("id, name, slug, created_at")
    .order("name", { ascending: true });

  const categoriesList = categoriesData || [];

  // Hitung jumlah lowongan per kategori
  const { data: jobsCategoryData } = await supabase
    .from("jobs")
    .select("category_id");

  const jobCounts: Record<number, number> = {};
  if (jobsCategoryData) {
    jobsCategoryData.forEach((j) => {
      if (j.category_id) {
        jobCounts[j.category_id] = (jobCounts[j.category_id] || 0) + 1;
      }
    });
  }

  const formattedCategories: CategoryItem[] = categoriesList.map((c) => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
    created_at: c.created_at,
    jobCount: jobCounts[c.id] || 0,
  }));

  return (
    <div className="space-y-8">
      {/* Header Halaman */}
      <div className="bg-white rounded-3xl border border-black/[0.08] p-6 sm:p-8 shadow-card flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-xl bg-slate-900 text-[#FFDD00] flex items-center justify-center shrink-0">
              <FolderTree className="w-4 h-4" aria-hidden="true" />
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-black tracking-tight">
              Kelola Kategori Lowongan
            </h1>
          </div>
          <p className="text-sm text-slate-600 font-medium max-w-xl leading-relaxed">
            Atur taksonomi bidang pekerjaan platform. Kategori digunakan untuk pengelompokan penelusuran oleh pencari kerja.
          </p>
        </div>
      </div>

      {/* Komponen Pengelola Kategori */}
      <CategoryManager categories={formattedCategories} />
    </div>
  );
}
