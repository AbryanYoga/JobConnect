import type { Metadata } from "next";
import { AboutView } from "@/components/tentang/AboutView";

export const metadata: Metadata = {
  title: "Panduan & Pusat Bantuan - JobConnect",
  description:
    "Pelajari alur melamar kerja resmi, standar moderasi lowongan, transparansi gaji, dan jawaban pertanyaan umum di JobConnect.",
};

export default function TentangPage() {
  return <AboutView />;
}
