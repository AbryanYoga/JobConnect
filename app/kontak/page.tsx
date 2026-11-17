import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { PublicContactForm } from "@/components/tentang/PublicContactForm";

export const metadata: Metadata = {
  title: "Hubungi Tim Dukungan - JobConnect",
  description:
    "Kirimkan pertanyaan, kendala teknis, atau permintaan kerjasama mitra langsung ke tim pengelola JobConnect tanpa perlu login.",
};

export default function KontakPage() {
  return (
    <div className="min-h-screen bg-[#FAF8F0] py-8 sm:py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div>
          <Link
            href="/tentang"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-black transition min-h-[44px]"
          >
            <ArrowLeft className="w-4 h-4" aria-hidden="true" />
            <span>Kembali ke Pusat Bantuan & FAQ</span>
          </Link>
        </div>

        <PublicContactForm />
      </div>
    </div>
  );
}
