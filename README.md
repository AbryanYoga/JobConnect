# JobConnect

JobConnect adalah sistem informasi lowongan pekerjaan berbasis web yang mempertemukan pencari kerja (pelamar) dengan perusahaan mitra, dilengkapi dengan fitur screening CV berbantuan AI dan jelajah lowongan per wilayah.

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
