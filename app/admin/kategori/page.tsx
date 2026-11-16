import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
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
    .select("id, name, slug")
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
    jobCount: jobCounts[c.id] || 0,
  }));

  return <CategoryManager categories={formattedCategories} />;
}
