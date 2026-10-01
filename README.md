# JobConnect

JobConnect adalah sistem informasi lowongan pekerjaan berbasis web yang mempertemukan pencari kerja (pelamar) dengan perusahaan mitra, dilengkapi dengan fitur screening CV berbantuan AI dan jelajah lowongan per wilayah.

## Nilai Pembeda dan Solusi Masalah

JobConnect mengadopsi kemudahan dan kepraktisan portal rekrutmen modern seperti Glints, sekaligus secara tegas menyelesaikan masalah nyata yang sering dihadapi pencari kerja dan rekruter:

1. **Bebas Ghosting:** Transparansi 8 status lamaran yang runtut dengan catatan riwayat waktu dan notifikasi realtime.
2. **Bebas Loker Bodong:** Seluruh lowongan pekerjaan wajib lolos moderasi dan ACC oleh Admin sebelum dapat tayang ke publik.
3. **Screening AI Cerdas:** Rekruter dibantu oleh analisis kecocokan CV berbasis AI Claude untuk memprioritaskan kandidat paling relevan tanpa menghilangkan keputusan akhir manusia.
4. **Jelajah Wilayah Komprehensif:** Mendukung data wilayah resmi 38 provinsi dan 514 kota/kabupaten se-Indonesia.
5. **Antarmuka Bersih (Antislop):** Tanpa iklan kursus komersial, tanpa pop-up yang mengganggu, ringan diakses, dan ramah perangkat mobile (360px).

## Teknologi

- **Framework:** Next.js (App Router), TypeScript
- **Styling:** Tailwind CSS, font Inter
- **Backend & Database:** Supabase (PostgreSQL, Auth, Storage, Realtime)
- **Validasi:** Zod
- **AI Screening:** Claude API (Anthropic)
- **Deployment:** Vercel

## Peran Pengguna

1. **Pelamar:** mencari dan melamar pekerjaan dengan unggah CV PDF serta persetujuan analisis AI, memantau status lamaran.
2. **Perusahaan (Mitra):** mengelola profil perusahaan, mengajukan lowongan kerja, meninjau pelamar dengan bantuan skor dan ringkasan AI, mengatur jadwal wawancara, dan memutuskan hasil lamaran.
3. **Admin:** memoderasi platform, menyetujui (ACC) atau menolak pengajuan lowongan, mengelola kategori, serta memantau data platform.

## Dokumentasi

Dokumentasi lengkap pengembangan dapat dibaca pada folder `docs/`:
- `docs/PRD.md`: Product Requirements Document lengkap
- `docs/COMMIT-PLAN.md`: Rencana commit berurutan
- `AGENTS.md`: Panduan aturan kerja agen dan standar desain Antislop
