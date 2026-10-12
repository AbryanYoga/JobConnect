import type { Metadata } from "next";
import { AboutView } from "@/components/tentang/AboutView";

export const metadata: Metadata = {
  title: "Tentang Kami - JobConnect",
  description:
    "Mengenal JobConnect, platform resmi penghubung pencari kerja dan perusahaan terverifikasi di seluruh 38 provinsi di Indonesia.",
};

export default function TentangPage() {
  return <AboutView />;
}
