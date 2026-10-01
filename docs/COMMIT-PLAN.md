# COMMIT-PLAN: JobConnect

Daftar commit berurutan (170 commit + tambahan) yang diselaraskan dengan PRD Versi 2.0 (tiga peran: Pelamar, Perusahaan, Admin dengan screening CV berbantuan AI). Aturan lengkap ada di `AGENTS.md`, termasuk standar desain Antislop di bagian 6 yang berlaku untuk seluruh commit tampilan.

**Cara pakai:** kerjakan dari nomor terkecil yang belum dicentang. Setelah satu nomor selesai: `git add` file terkait -> `git commit` dengan pesan di bawah -> `git push` -> ubah `[ ]` jadi `[x]` di commit yang sama.

---

## Fase 1: Setup repo dan dokumen

- [x] 001 `chore: inisialisasi repo dengan README awal`
- [x] 002 `chore: tambah .gitignore untuk Next.js dan file env`
- [x] 003 `docs: tambah AGENTS.md dan COMMIT-PLAN.md`
- [x] 004 `docs: tambah PRD JobConnect ke folder docs`
- [x] 005 `docs: tambah rancangan database ke folder docs`
- [x] 006 `docs: tambah gambar ERD ke folder docs`

## Fase 2: Database Supabase (folder database/)

- [x] 007 `db: buat tabel profiles dengan role user, company, admin`
- [x] 008 `db: buat tabel categories`
- [x] 009 `db: buat tabel provinces untuk kode wilayah 38 provinsi`
- [x] 010 `db: buat tabel cities untuk kota dan kabupaten`
- [x] 011 `db: buat tabel companies untuk profil perusahaan mitra`
- [x] 012 `db: buat tabel jobs dengan kriteria terstruktur dan work mode`
- [x] 013 `db: buat tabel applications dengan unique job_id dan user_id`
- [x] 014 `db: buat tabel application_status_history untuk timeline status`
- [x] 015 `db: buat tabel application_notes untuk catatan internal perusahaan`
- [x] 016 `db: buat tabel application_ai_reviews untuk hasil screening AI`
- [x] 017 `db: buat tabel notifications untuk notifikasi realtime`
- [x] 018 `db: buat tabel saved_jobs untuk bookmark lowongan`
- [x] 019 `db: tambah index performa untuk seluruh tabel`
- [x] 020 `db: tambah trigger handle_new_user untuk membuat profil otomatis`
- [x] 021 `db: aktifkan RLS pada seluruh tabel`
- [x] 022 `db: tambah fungsi keamanan is_admin dan is_company_owner`
- [x] 023 `db: tambah policy RLS tabel profiles`
- [x] 024 `db: batasi update profiles hanya kolom name, phone, headline, notifikasi`
- [x] 025 `db: tambah policy RLS tabel companies`
- [x] 026 `db: tambah policy RLS tabel categories, provinces, dan cities`
- [x] 027 `db: tambah policy RLS tabel jobs`
- [x] 028 `db: tambah policy RLS tabel applications dan status history`
- [x] 029 `db: tambah policy RLS tabel application_notes khusus perusahaan`
- [x] 030 `db: tambah policy RLS tabel application_ai_reviews`
- [x] 031 `db: tambah policy RLS tabel notifications dan saved_jobs`
- [x] 032 `db: tambah bucket storage cvs dan company-logos beserta policynya`
- [x] 033 `db: tambah fungsi submit_job dan review_job untuk ACC lowongan`
- [x] 034 `db: tambah fungsi change_application_status untuk transisi status`
- [x] 035 `db: tambah fungsi jobs_count_by_province dan city untuk jelajah wilayah`
- [x] 036 `db: tambah trigger notify otomatis pada lamaran dan status`
- [x] 037 `db: tambah fungsi rekap company_report dan platform_report`
- [x] 038 `db: tambah seed data kategori pekerjaan`
- [ ] 039 `db: tambah seed data 38 provinsi dan kota kabupaten`
- [ ] 040 `db: tambah seed data lowongan contoh berlabel demo`
- [ ] 041 `docs: tambah panduan menjalankan migrasi SQL di Supabase`

## Fase 3: Inisialisasi Next.js dan Fondasi Desain

- [ ] 042 `chore: inisialisasi Next.js dengan TypeScript dan Tailwind`
- [ ] 043 `chore: bersihkan template bawaan create-next-app`
- [ ] 044 `chore: pasang dependensi supabase, zod, lucide-react`
- [ ] 045 `chore: tambah .env.example tanpa nilai rahasia`
- [ ] 046 `style: konfigurasi palet navy, slate, amber dan font Inter di Tailwind`
- [ ] 047 `feat(layout): buat root layout dengan font Inter dan metadata`
- [ ] 048 `feat(layout): buat komponen Navbar dengan deteksi peran`
- [ ] 049 `feat(layout): buat komponen Footer dua kolom sederhana`
- [ ] 050 `chore: siapkan arsitektur folder app, components, lib`

## Fase 4: Komponen UI Dasar (Antislop Design System)

- [ ] 051 `feat(ui): buat komponen Button dengan varian tombol dan ukuran`
- [ ] 052 `feat(ui): buat komponen Badge untuk tipe kerja dan mode kerja`
- [ ] 053 `feat(ui): buat komponen StatusBadge untuk delapan status lamaran`
- [ ] 054 `feat(ui): buat komponen EmptyState dengan tombol aksi lanjutan`
- [ ] 055 `feat(ui): buat komponen Skeleton untuk indikator loading data`
- [ ] 056 `feat(ui): buat komponen ErrorState dengan tombol coba lagi`
- [ ] 057 `feat(ui): buat komponen Modal yang dapat ditutup dengan tombol Escape`
- [ ] 058 `feat(ui): buat komponen Input, Select, Textarea dengan label dan error`
- [ ] 059 `style(ui): tambah focus ring yang kontras pada seluruh elemen interaktif`
- [ ] 060 `feat(ui): buat halaman not-found 404 kustom`

## Fase 5: Integrasi Klien Supabase dan Validasi Zod

- [ ] 061 `feat(supabase): buat client Supabase sisi browser`
- [ ] 062 `feat(supabase): buat client Supabase sisi server`
- [ ] 063 `feat(supabase): buat helper admin service role terisolasi untuk AI`
- [ ] 064 `chore: buat definisi tipe TypeScript database Supabase`
- [ ] 065 `feat(validasi): buat skema Zod untuk registrasi dan login`
- [ ] 066 `feat(validasi): buat skema Zod untuk profil pelamar dan perusahaan`
- [ ] 067 `feat(validasi): buat skema Zod untuk kriteria lowongan terstruktur`
- [ ] 068 `feat(validasi): buat skema Zod untuk form lamaran dan file CV`

## Fase 6: Autentikasi dan Profil Pengguna

- [ ] 069 `feat(auth): buat halaman register dengan pilihan Pelamar atau Perusahaan`
- [ ] 070 `feat(auth): sambungkan register ke Supabase Auth dengan metadata peran`
- [ ] 071 `feat(auth): buat halaman login dengan validasi email dan password`
- [ ] 072 `feat(auth): sambungkan login ke Supabase Auth dan tangani pesan error`
- [ ] 073 `feat(auth): buat fungsionalitas logout`
- [ ] 074 `feat(navbar): sesuaikan menu navigasi berdasarkan sesi dan peran pengguna`
- [ ] 075 `feat(profil): buat halaman profil pelamar`
- [ ] 076 `feat(profil): aktifkan simpan perubahan nama, telepon, dan headline`
- [ ] 077 `feat(mitra): buat halaman profil perusahaan mitra`
- [ ] 078 `feat(mitra): aktifkan simpan identitas, industri, lokasi, dan deskripsi perusahaan`
- [ ] 079 `feat(mitra): tambah fitur unggah logo perusahaan ke bucket storage`

## Fase 7: Middleware Proteksi Rute dan Sesi

- [ ] 080 `feat(middleware): buat middleware untuk refresh sesi Supabase`
- [ ] 081 `feat(middleware): proteksi rute mitra khusus akun perusahaan`
- [ ] 082 `feat(middleware): proteksi rute admin khusus akun berkedudukan admin`
- [ ] 083 `feat(middleware): proteksi rute pelamar agar wajib login`
- [ ] 084 `feat(auth): buat halaman tidak berwenang 403`

## Fase 8: Halaman Publik Beranda dan Jelajah Wilayah

- [ ] 085 `feat(beranda): buat section hero dengan kolom pencarian kata kunci`
- [ ] 086 `feat(beranda): buat bar chip jelajah provinsi dengan scroll horizontal`
- [ ] 087 `feat(beranda): buat section daftar kategori pekerjaan dengan jumlah lowongan`
- [ ] 088 `feat(beranda): buat section kartu lowongan terbaru berstatus open`
- [ ] 089 `feat(wilayah): buat halaman indeks seluruh 38 provinsi di /wilayah`
- [ ] 090 `feat(wilayah): buat halaman daftar kota kabupaten per provinsi`
- [ ] 091 `feat(wilayah): buat halaman daftar lowongan per kota`
- [ ] 092 `feat(wilayah): buat halaman khusus lowongan kerja remote`
- [ ] 093 `feat(ui): buat komponen Breadcrumb untuk navigasi hierarki wilayah`

## Fase 9: Eksplorasi Lowongan dan Profil Publik Perusahaan

- [ ] 094 `feat(lowongan): buat halaman daftar pencarian lowongan /lowongan`
- [ ] 095 `feat(lowongan): buat komponen SearchBar dengan debounce pencarian`
- [ ] 096 `feat(lowongan): buat panel filter kategori, tipe kerja, mode, dan wilayah`
- [ ] 097 `feat(lowongan): buat kartu JobCard dengan info ringkas dan lencana demo`
- [ ] 098 `feat(lowongan): buat komponen Pagination 10 data per halaman`
- [ ] 099 `feat(lowongan): buat halaman detail lowongan /lowongan/[slug]`
- [ ] 100 `feat(lowongan): tampilkan kartu Kriteria Utama terstruktur`
- [ ] 101 `feat(lowongan): buat halaman profil publik perusahaan /perusahaan/[slug]`
- [ ] 102 `feat(lowongan): tambah loading skeleton dan error boundary pada lowongan`

## Fase 10: Pengajuan Lowongan oleh Perusahaan dan ACC Admin

- [ ] 103 `feat(mitra): buat layout dashboard mitra dengan navigasi samping`
- [ ] 104 `feat(mitra): buat halaman ringkasan dashboard mitra`
- [ ] 105 `feat(mitra): buat halaman daftar lowongan milik perusahaan`
- [ ] 106 `feat(mitra): buat form tambah lowongan dengan kriteria terstruktur`
- [ ] 107 `feat(mitra): buat dropdown berjenjang provinsi dan kota untuk lokasi`
- [ ] 108 `feat(mitra): tambah penghitung karakter pada form lowongan`
- [ ] 109 `feat(mitra): aktifkan simpan draft dan fungsi submit_job ke pending`
- [ ] 110 `feat(mitra): buat halaman edit lowongan perusahaan`
- [ ] 111 `feat(mitra): tambah fitur tutup lowongan menjadi closed`
- [ ] 112 `feat(admin): buat layout dashboard admin moderator`
- [ ] 113 `feat(admin): buat halaman dashboard statistik platform admin`
- [ ] 114 `feat(admin): buat halaman antrean review lowongan pending`
- [ ] 115 `feat(admin): buat modal ACC lowongan menjadi open`
- [ ] 116 `feat(admin): buat modal tolak lowongan dengan alasan wajib`
- [ ] 117 `feat(admin): buat fitur takedown lowongan bermasalah ke status removed`
- [ ] 118 `feat(admin): buat halaman kelola kategori lowongan`

## Fase 11: Proses Melamar Kerja dan Manajemen Lamaran

- [ ] 119 `feat(lamar): buat komponen form melamar kerja pada detail lowongan`
- [ ] 120 `feat(lamar): tambah validasi checkbox persetujuan analisis AI`
- [ ] 121 `feat(lamar): tambah upload file CV format PDF maksimal 2 MB`
- [ ] 122 `feat(lamar): unggah CV ke bucket privat cvs di Supabase Storage`
- [ ] 123 `feat(lamar): simpan baris lamaran dengan status awal dikirim`
- [ ] 124 `fix(lamar): cegah melamar ganda ke lowongan yang sama`
- [ ] 125 `fix(lamar): blokir aksi melamar jika lowongan closed atau expired`
- [ ] 126 `feat(lamar): tampilkan banner status sudah melamar pada detail lowongan`
- [ ] 127 `feat(lamaran-saya): buat halaman riwayat lamaran pencari kerja`
- [ ] 128 `feat(lamaran-saya): buat halaman detail status lamaran dan timeline`
- [ ] 129 `feat(lamaran-saya): tambah fitur penarikan lamaran oleh pelamar`

## Fase 12: Review Pelamar oleh Perusahaan dan Keputusan Akhir

- [ ] 130 `feat(mitra): buat halaman daftar pelamar per lowongan`
- [ ] 131 `feat(mitra): buat halaman detail kandidat pelamar`
- [ ] 132 `feat(mitra): buat fungsi buka CV pelamar menggunakan signed URL aman`
- [ ] 133 `feat(mitra): buat form catatan internal perusahaan pada kandidat`
- [ ] 134 `feat(mitra): buat alur pengubah status lamaran kandidat`
- [ ] 135 `feat(mitra): tambah form pesan penolakan saat kandidat ditolak`
- [ ] 136 `feat(mitra): buat form penjadwalan wawancara tanggal dan tempat`

## Fase 13: Screening CV Berbantuan AI (Claude API)

- [ ] 137 `feat(ai): buat modul klien Claude API di lib/ai`
- [ ] 138 `feat(ai): buat prompt evaluasi netral tanpa bias demografi`
- [ ] 139 `feat(ai): buat skema Zod validasi skor, level, dan ringkasan AI`
- [ ] 140 `feat(ai): buat API route POST /api/ai/screen untuk pemrosesan CV`
- [ ] 141 `feat(ai): buat proteksi manipulasi prompt injection pada teks CV`
- [ ] 142 `feat(ai): buat pembatasan kuota harian screening AI`
- [ ] 143 `feat(mitra): buat panel hasil review AI pada detail pelamar`
- [ ] 144 `feat(mitra): tambah tombol analisis ulang jika screening gagal`
- [ ] 145 `feat(mitra): tambah pengurutan dan filter pelamar berdasarkan skor AI`
- [ ] 146 `feat(lamaran-saya): tampilkan status proses analisis tanpa membocorkan skor`

## Fase 14: Notifikasi Realtime dan Email

- [ ] 147 `feat(notifikasi): buat komponen ikon lonceng dengan badge belum dibaca`
- [ ] 148 `feat(notifikasi): buat halaman daftar notifikasi /notifikasi`
- [ ] 149 `feat(notifikasi): pasang Supabase Realtime untuk pembaruan realtime`
- [ ] 150 `feat(notifikasi): buat fungsi tandai notifikasi telah dibaca`
- [ ] 151 `feat(email): siapkan modul pengiriman email menggunakan Resend`
- [ ] 152 `feat(email): buat template email notifikasi status lamaran dan ACC`

## Fase 15: Fitur Tambahan (Bookmark dan Laporan)

- [ ] 153 `feat(bookmark): buat tombol simpan lowongan pada kartu dan detail`
- [ ] 154 `feat(bookmark): buat halaman lowongan tersimpan /tersimpan`
- [ ] 155 `feat(mitra): buat halaman laporan rekapitulasi pelamar perusahaan`
- [ ] 156 `feat(mitra): tambah ekspor laporan ke format CSV dan cetak PDF`
- [ ] 157 `feat(admin): buat halaman rekapitulasi data agregat platform admin`

## Fase 16: Pengujian Responsif dan Audit Antislop

- [ ] 158 `style(navbar): buat menu navigasi responsif untuk perangkat mobile`
- [ ] 159 `style(beranda): uji dan rapikan tampilan pada 360px, 768px, 1280px`
- [ ] 160 `style(wilayah): rapikan jelajah wilayah dan filter di layar mobile`
- [ ] 161 `style(mitra): buat tabel pelamar dapat digeser horizontal di mobile`
- [ ] 162 `style: verifikasi kontras warna WCAG AA dan target sentuh 44px`
- [ ] 163 `chore: audit menyeluruh Delivery Gate Antislop dan perbaiki temuan`

## Fase 17: Build, Deployment Vercel, dan Dokumentasi Akhir

- [ ] 164 `chore: validasi build produksi Next.js dan perbaiki error type lint`
- [ ] 165 `chore: siapkan konfigurasi deployment ke platform Vercel`
- [ ] 166 `docs: catat daftar environment variable Vercel dan URL Supabase`
- [ ] 167 `docs(readme): lengkapi README dengan fitur, arsitektur, dan cara instalasi`
- [ ] 168 `docs(readme): tambahkan panduan akun demo pelamar, mitra, dan admin`
- [ ] 169 `docs(readme): pasang tautan screenshot aplikasi dan video demo`
- [ ] 170 `chore: tandai rilis versi v1.0.0`

---

## Commit Tambahan (di luar rencana)

Catat di sini bug atau perbaikan tak terduga yang muncul di tengah jalan. Format: `- [x] T1 pesan commit`

## Catatan Penting Agent

- Nomor 007 sampai 041 adalah file migrasi dan seed SQL di folder `database/`. Pemilik proyek menjalankannya manual di Supabase SQL Editor. Berhenti dan minta konfirmasi setelah nomor 041 selesai dibuat.
- Nomor 165 dan 166 memerlukan tindakan manual di dashboard Vercel dan Supabase. Tulis panduan langkahnya lalu tunggu konfirmasi.
- Nomor 169 membutuhkan screenshot dan video demo dari pemilik proyek.
- Data contoh pada nomor 040 wajib diberi label `is_demo = true` sesuai PRD bagian 6. Angka di UI selalu dihitung dari database (aturan Antislop di AGENTS.md bagian 6).