import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "JobConnect",
  description: "Sistem Informasi Lowongan Pekerjaan",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}
