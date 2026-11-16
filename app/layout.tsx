import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { cookies } from "next/headers";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { FloatingHelpWidget } from "@/components/ui/FloatingHelpWidget";
import { LanguageProvider, type Language } from "@/lib/i18n";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
  ),
  title: {
    default: "JobConnect, cari lowongan kerja dan lamar langsung",
    template: "%s | JobConnect",
  },
  description:
    "Cari lowongan kerja berdasarkan kata kunci, kategori, dan wilayah di Indonesia lalu lamar pekerjaan langsung dengan mengunggah CV.",
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/favicon.svg", type: "image/svg+xml" },
    ],
    apple: "/logos/concept-2-symbol.png",
  },
  other: {
    google: "notranslate",
  },
};

export const viewport: Viewport = {
  themeColor: "#1F3A64",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let initialLang: Language = "id";
  try {
    const cookieStore = await cookies();
    const cookieVal = cookieStore.get("jobconnect_lang")?.value;
    if (cookieVal === "en" || cookieVal === "id") {
      initialLang = cookieVal;
    }
  } catch {
    initialLang = "id";
  }

  return (
    <html
      lang={initialLang}
      className={`${inter.variable} notranslate`}
      translate="no"
    >
      <body className="min-h-dvh flex flex-col font-sans bg-[#FAF8F0] notranslate" translate="no">
        <LanguageProvider initialLanguage={initialLang}>
          <a
            href="#konten"
            className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:px-4 focus:py-2 focus:bg-navy-700 focus:text-white focus:rounded-control focus:shadow-modal focus:outline-2 focus:outline-offset-2 focus:outline-accent-400 font-medium text-sm"
          >
            {initialLang === "en" ? "Skip to content" : "Lewati ke konten"}
          </a>
          <Navbar />
          <main id="konten" className="flex-1">
            {children}
          </main>
          <Footer />
          <FloatingHelpWidget />
        </LanguageProvider>
      </body>
    </html>
  );
}
