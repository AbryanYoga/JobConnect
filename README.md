# JobConnect

JobConnect adalah sistem informasi portal lowongan pekerjaan berbasis web yang mempertemukan pencari kerja (pelamar) dengan perusahaan mitra terverifikasi, dilengkapi dengan transparansi alur seleksi 8 tahapan, peninjauan berkas kualifikasi terstruktur, dan jelajah lowongan per wilayah 38 provinsi di Indonesia.

---

## Nilai Pembeda dan Solusi Masalah

JobConnect dirancang untuk mengatasi berbagai kendala yang sering dihadapi pencari kerja maupun tim rekruter pada portal lowongan kerja konvensional:

1. **Transparansi Alur Seleksi (Bebas Ghosting):** Alur status lamaran yang runtut dan jelas (8 tahapan: `dikirim`, `ditinjau`, `shortlist`, `wawancara`, `ditawari`, `diterima`, `ditolak`, dan `ditarik`), dilengkapi catatan riwayat waktu pembaruan status serta informasi jadwal wawancara yang terperinci.
2. **Moderasi Lowongan Terverifikasi:** Setiap lowongan baru yang diajukan perusahaan wajib melalui proses verifikasi dan persetujuan (ACC) oleh Admin Moderator sebelum dapat tayang secara publik, mencegah lowongan fiktif dan penipuan.
3. **Penyaringan Berkas Kualifikasi Terstruktur:** Membantu tim rekruter membaca dan mengevaluasi kesesuaian berkas CV terhadap kualifikasi posisi (pemetaan keahlian, skor kesesuaian, dan saran pertanyaan teknis wawancara). Fitur analisis bersifat opsional atas persetujuan pelamar, dan keputusan akhir penerimaan tetap mutlak di tangan rekruter manusia.
4. **Jelajah Wilayah Lengkap:** Integrasi data resmi Kemendagri mencakup 38 provinsi dan 514 kota/kabupaten di seluruh Indonesia, memudahkan pencarian kerja baik posisi lokal, antardaerah, maupun kerja jarak jauh (remote).
5. **Privasi Berkas Ketat:** Dokumen Curriculum Vitae (CV) pelamar tersimpan di bucket privat terisolasi dengan Row Level Security (RLS). Hanya pemilik berkas dan perusahaan yang dilamar yang memiliki hak akses untuk membuka CV.
6. **Antarmuka Bersih dan Cepat (Standar Antislop):** Tanpa iklan pihak ketiga, tanpa pop-up yang mengganggu, waktu muat cepat, kontras warna ramah aksesibilitas (WCAG AA), dan responsif penuh pada berbagai ukuran layar hingga perangkat mobile (360px).

---

## Peran dan Alur Pengguna

Aplikasi mendukung tiga peran pengguna dengan hak akses terpisah:

### 1. Pencari Kerja (Pelamar)
- Menjelajah katalog lowongan pekerjaan dengan filter multi-kriteria (tipe pekerjaan, sistem kerja, jenjang pendidikan, kategori, dan wilayah).
- Melamar pekerjaan dengan mengunggah berkas CV format PDF (maksimal 2 MB) dan surat pengantar opsional.
- Memilih izin analisis kualifikasi berkas secara mandiri saat melamar.
- Memantau dasbor riwayat lamaran dan timeline perkembangan status secara transparan.
- Mengakses informasi detail jadwal dan lokasi/tautan wawancara kerja.
- Melakukan penarikan berkas lamaran secara mandiri sebelum status diputuskan.

### 2. Perusahaan Mitra
- Mengelola data profil perusahaan (nama, deskripsi, alamat wilayah, kontak resmi, dan logo perusahaan).
- Membuat dan mengajukan draf lowongan kerja terstruktur dengan spesifikasi kriteria yang jelas.
- Mengelola dasbor pelamar per lowongan: filter status, filter kategori kualifikasi, dan pengurutan kandidat.
- Membuka berkas CV pelamar menggunakan signed URL aman dan berbatas waktu.
- Meninjau hasil analisis kualifikasi berkas (skor kesesuaian, keahlian yang cocok vs belum ditemukan, dan rekomendasi pertanyaan wawancara).
- Menjadwalkan wawancara kerja (tanggal, jam, dan lokasi atau tautan daring).
- Menuliskan catatan internal khusus tim rekruter serta pesan keputusan bagi kandidat.

### 3. Administrator Platform (Moderator)
- Memverifikasi antrean pengajuan lowongan kerja baru dari mitra perusahaan.
- Memberikan persetujuan (ACC) agar lowongan tayang publik, atau menolak pengajuan dengan alasan perbaikan yang wajib diisi.
- Melakukan penindakan (takedown) terhadap lowongan yang terbukti bermasalah atau melanggar ketentuan.
- Mengelola daftar kategori lowongan pekerjaan platform.
- Memantau ringkasan statistik dan metrik operasional platform secara agregat.

---

## Kemajuan Pengembangan Fitur (Progress Terkini)

Pengembangan sistem JobConnect telah menyelesaikan tahapan utama:

- [x] **Arsitektur dan Autentikasi:** Fondasi Next.js App Router, TypeScript, Tailwind CSS, otentikasi Supabase, dan manajemen profil tiga peran.
- [x] **Keamanan Database:** Skema PostgreSQL, 12 tabel terelasi, indeks performa, fungsi database / RPC, trigger otomatis, dan Row Level Security (RLS) di seluruh tabel.
- [x] **Eksplorasi Publik:** Beranda interaktif, jelajah 38 provinsi dan 514 kota/kabupaten, pencarian lowongan, pemilih bahasa (i18n), dan detail lowongan kerja.
- [x] **Manajemen Lowongan Mitra:** Alur pembuatan formulir bertahap lowongan, validasi Zod, dan pengajuan moderasi lowongan.
- [x] **Moderasi Admin:** Dasbor antrean review lowongan, modal ACC, formulir tolak bersyarat alasan, takedown lowongan, dan kelola kategori.
- [x] **Alur Melamar Kerja:** Pengunggahan CV PDF ke bucket privat `cvs`, pencegahan lamaran ganda, dasbor riwayat lamaran pelamar, timeline status, dan penarikan lamaran.
- [x] **Review Pelamar Mitra:** Dasbor kandidat per lowongan, pembukaan CV via signed URL, pencatatan internal tim, pembaruan status lamaran, formulir alasan penolakan, dan penjadwalan wawancara.
- [x] **Screening Kualifikasi Berkas:** Sistem penilaian kecocokan CV pelamar terhadap lowongan, pembatasan kuota harian, deteksi instruksi manipulatif pada CV, panel review komprehensif, tombol evaluasi ulang berkas gagal, pengurutan dan filter kandidat berdasarkan skor, serta perlindungan kerahasiaan skor internal bagi pelamar.

---

## Arsitektur Teknologi

- **Frontend Framework:** Next.js (App Router), React 19, TypeScript
- **Styling & Tampilan:** Tailwind CSS, Font Inter, Lucide React
- **Backend & Database:** Supabase (PostgreSQL, Supabase Auth, Storage privat, Realtime)
- **Validasi Data:** Zod Schema Validation
- **Deployment Platform:** Vercel

---

## Struktur Direktori

```
JobConnect/
├── app/                      # Rute halaman dan API Next.js App Router
│   ├── (auth)/               # Halaman login, register, dan verifikasi akun
│   ├── admin/                # Dasbor moderasi admin (lowongan, kategori, statistik)
│   ├── api/                  # Route handler API terisolasi
│   ├── lamar/                # Alur dan formulir pengajuan lamaran kerja
│   ├── lamaran-saya/         # Dasbor riwayat lamaran dan timeline pelamar
│   ├── lowongan/             # Katalog publik dan halaman detail lowongan kerja
│   ├── mitra/                # Dasbor perusahaan mitra (kelola lowongan dan pelamar)
│   ├── wilayah/              # Eksplorasi loker per provinsi dan kota/kabupaten
│   └── page.tsx              # Halaman beranda utama JobConnect
├── components/               # Komponen antarmuka modular
│   ├── admin/                # Komponen antarmuka moderasi admin
│   ├── beranda/              # Komponen halaman beranda
│   ├── lamaran/              # Komponen form lamar dan penarikan lamaran
│   ├── layout/               # Navbar, footer, breadcrumb, dan tata letak
│   ├── lowongan/             # Kartu loker, panel filter, dan pencarian
│   ├── mitra/                # Komponen panel kandidat, review berkas, dan notes
│   └── ui/                   # Komponen atomik (Badge, Button, EmptyState, dll)
├── database/                 # Skema SQL, migrasi, policy RLS, fungsi, dan seed data
│   ├── functions.sql         # Fungsi database, RPC, dan trigger otomatis
│   ├── policies.sql          # Kebijakan Row Level Security (RLS)
│   ├── schema.sql            # Definisi struktur tabel dan indeks
│   └── seed_wilayah.sql      # Data referensi resmi provinsi dan kota/kabupaten
├── docs/                     # Dokumentasi perancangan dan rencana kerja
│   ├── COMMIT-PLAN.md        # Catatan daftar commit pengerjaan
│   └── PRD.md                # Dokumen Product Requirements Document (PRD)
├── lib/                      # Utilitas, helper, dan integrasi server
│   ├── labels.ts             # Definisi kamus label dan format status
│   ├── supabase/             # Klien Supabase (server, client, admin, middleware)
│   └── validation/           # Skema validasi formulir menggunakan Zod
└── public/                   # Aset statis, ikon, dan logo resmi JobConnect
```

---

## Panduan Menjalankan Proyek Secara Lokal

### Prasyarat
- Node.js versi 18.18 atau lebih baru
- npm, yarn, atau pnpm
- Proyek Supabase aktif (URL dan API keys)

### Langkah Instalasi

1. **Kloning repositori:**
   ```bash
   git clone https://github.com/AbryanYoga/JobConnect.git
   cd JobConnect
   ```

2. **Instal dependensi:**
   ```bash
   npm install
   ```

3. **Konfigurasi Environment Variable:**
   Salin berkas `.env.example` menjadi `.env.local` lalu lengkapi kredensial Supabase Anda:
   ```bash
   cp .env.example .env.local
   ```
   Isi konfigurasi pada `.env.local`:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://proyek-anda.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=kunci-anon-anda
   ```

4. **Siapkan Database Supabase:**
   Jalankan berkas SQL di folder `database/` secara berurutan pada Supabase SQL Editor:
   - `schema.sql` (struktur tabel)
   - `policies.sql` (kebijakan keamanan RLS)
   - `functions.sql` (fungsi dan trigger)
   - `seed_wilayah.sql` (data referensi provinsi dan kota)

5. **Jalankan Server Pengembangan:**
   ```bash
   npm run dev
   ```
   Buka peramban di `http://localhost:3000` untuk melihat aplikasi JobConnect.

---

## Lisensi dan Pengembang

Proyek sistem informasi JobConnect dikembangkan oleh **Abryan Yoga Pratama** (SMK Negeri 6 Surakarta) sebagai Tugas Proyek Rekayasa Perangkat Lunak (RPL).
