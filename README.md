# JobConnect

JobConnect adalah sistem informasi lowongan pekerjaan berbasis web yang mempertemukan pencari kerja (pelamar) dengan perusahaan mitra, dilengkapi dengan transparansi alur seleksi dan jelajah lowongan per wilayah.

## Nilai Pembeda dan Solusi Masalah

JobConnect mengadopsi kemudahan dan kepraktisan platform lowongan kerja modern, sekaligus secara tegas menyelesaikan permasalahan yang sering dihadapi pencari kerja dan rekruter di berbagai portal rekrutmen umum:

1. **Bebas Ghosting:** Transparansi 8 status lamaran yang runtut dengan catatan riwayat waktu dan notifikasi realtime.
2. **Bebas Loker Bodong:** Seluruh lowongan pekerjaan wajib lolos moderasi dan ACC oleh Admin sebelum dapat tayang ke publik.
3. **Screening AI Opsional:** Analisis kecocokan CV bersifat opsional dan dipilih sendiri oleh pelamar saat melamar. Jika tidak dipilih, berkas CV tidak dikirim ke penyedia AI, dan keputusan akhir tetap berada di tangan perusahaan.
4. **Jelajah Wilayah Komprehensif:** Mendukung data wilayah resmi 38 provinsi dan 514 kota/kabupaten se-Indonesia.
5. **Antarmuka Bersih (Antislop):** Tanpa iklan kursus komersial, tanpa pop-up yang mengganggu, ringan diakses, dan ramah perangkat mobile (360px).

## Teknologi

- **Framework:** Next.js (App Router), TypeScript
- **Styling:** Tailwind CSS, font Inter
- **Backend & Database:** Supabase (PostgreSQL, Auth, Storage, Realtime)
- **Validasi:** Zod
- **Deployment:** Vercel

## Peran Pengguna

1. **Pelamar:** mencari dan melamar pekerjaan dengan unggah berkas CV PDF serta memantau status perkembangan lamaran secara berkala.
2. **Perusahaan (Mitra):** mengelola profil perusahaan, mengajukan lowongan kerja, meninjau berkas pelamar, mengatur jadwal wawancara, dan memutuskan hasil lamaran.
3. **Admin:** memoderasi platform, menyetujui (ACC) atau menolak pengajuan lowongan, mengelola kategori, serta memantau data platform.

## Struktur Folder

Kode sumber proyek JobConnect diorganisasikan ke dalam beberapa folder utama: `app/` untuk routing halaman dan rute API Next.js App Router, `components/` untuk komponen antarmuka yang dikelompokkan berdasarkan modul (ui, layout, lowongan, lamaran, notifikasi, mitra, dan admin), `lib/` untuk utilitas logika aplikasi, koneksi Supabase, integrasi AI, pengiriman email, kueri database, serta skema validasi Zod, `database/` untuk skema SQL, fungsi, policy RLS, dan seed data, serta `docs/` untuk dokumentasi spesifikasi produk dan database.

## Dokumentasi

Dokumentasi perancangan sistem dapat dibaca pada berkas:
- `docs/PRD.md`: Dokumen spesifikasi kebutuhan produk (PRD)
