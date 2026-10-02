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

## Dokumentasi

Dokumentasi perancangan sistem dapat dibaca pada berkas:
- `docs/PRD.md`: Dokumen spesifikasi kebutuhan produk (PRD)
