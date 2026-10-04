# AGENTS.md: Aturan Kerja AI Agent untuk JobConnect

Proyek: **JobConnect**: Sistem Informasi Lowongan Pekerjaan
Stack (FIX): Next.js (App Router) + Tailwind CSS + Supabase (PostgreSQL, Auth, Storage) + Vercel + Zod + TypeScript

## 1. Baca dulu sebelum menulis apa pun

1. `docs/PRD.md`: sumber kebenaran tunggal (fitur, halaman, skema database, RLS).
2. `docs/COMMIT-PLAN.md`: daftar commit berurutan yang harus dikerjakan.
3. Jalankan `git log --oneline` dan lihat centang di `docs/COMMIT-PLAN.md` untuk tahu commit nomor berapa yang berikutnya.

4. Bagian 6 di file ini (standar desain Antislop), sebelum mengerjakan commit apa pun yang menyentuh tampilan atau teks.

Jangan mengubah keputusan stack atau skema tanpa persetujuan pemilik proyek.

## 2. Aturan wajib commit

Pemilik proyek menargetkan **lebih dari 100 commit** yang kecil dan jelas. Untuk itu:

1. **Satu commit = satu perubahan logis.** Kerjakan sesuai nomor di `docs/COMMIT-PLAN.md`, berurutan, jangan lompat, jangan menggabungkan beberapa nomor jadi satu commit.
2. **Setelah setiap perubahan selesai, langsung commit lalu push.** Sekecil apa pun perubahannya.
3. Alur setiap commit:
   ```bash
   # 1) kerjakan satu nomor saja
   # 2) cek kode berjalan (npm run lint / npm run build bila relevan)
   git add <hanya file yang terkait perubahan itu>
   git commit -m "<pesan sesuai COMMIT-PLAN>"
   git push
   ```
   Centang nomor tersebut di `docs/COMMIT-PLAN.md` **di dalam commit yang sama** (ubah `[ ]` menjadi `[x]`).
4. Jangan pakai `git add .` kalau ada file yang tidak terkait. Periksa `git status` sebelum commit.
5. Jangan membuat commit kosong atau perubahan buatan (spasi, komentar kosong) hanya demi menambah jumlah commit.
6. Jangan `git commit --amend`, `git rebase`, atau `git push --force` pada commit yang sudah di-push.
7. Jika `git push` gagal, **berhenti dan laporkan** ke pemilik proyek. Jangan mencoba trik paksa.

## 3. Format pesan commit

Gunakan Conventional Commits, bahasa Indonesia, kata kerja di awal, huruf kecil, tanpa titik di akhir:

```
tipe(scope): deskripsi singkat
```

| Tipe | Dipakai untuk |
| --- | --- |
| `feat` | Fitur baru |
| `fix` | Perbaikan bug |
| `db` | Skema, policy RLS, fungsi, atau storage di database |
| `style` | Tampilan/CSS (bukan logika) |
| `refactor` | Merapikan kode tanpa mengubah perilaku |
| `docs` | README, PRD, ERD |
| `chore` | Konfigurasi, dependensi, build |

Aturan tambahan:
- Judul maksimal sekitar 72 karakter dan menjelaskan **apa yang berubah**, bukan sekadar "update" atau "fix bug".
- Boleh menambah isi (body) setelah baris kosong bila perlu menjelaskan alasan.
- Tanda em dash (—) tidak dipakai di pesan commit, komentar kode, README, maupun teks UI.
- Pakai pesan persis seperti di `docs/COMMIT-PLAN.md`. Jika hasil kerja berbeda dari rencana, sesuaikan pesannya agar akurat.

## 4. Jika ada perubahan di luar rencana

- Bug atau perbaikan yang muncul di tengah jalan: buat commit `fix` tersendiri, lalu catat di bagian **Commit Tambahan** di `docs/COMMIT-PLAN.md` dengan nomor `T1`, `T2`, dan seterusnya.
- Perubahan lain yang belum ada di rencana boleh di-commit dengan format yang sama dan dicatat di bagian yang sama.

## 5. Keamanan (tidak boleh dilanggar)

- Jangan pernah commit `.env`, `.env.local`, atau kunci rahasia. Hanya `.env.example` (tanpa nilai asli) yang boleh masuk repo.
- Hanya `NEXT_PUBLIC_SUPABASE_URL` dan `NEXT_PUBLIC_SUPABASE_ANON_KEY` yang dipakai di kode. Kunci `service_role` hanya boleh dipakai di `lib/supabase/admin.ts`, hanya diimpor dari `lib/ai/`, dan tidak pernah diberi awalan `NEXT_PUBLIC_` (PRD 9.2 poin 6).
- Jika file rahasia terlanjur ter-stage, batalkan dengan `git restore --staged <file>` sebelum commit.
- Perbaikan keamanan RLS berikut berlaku di atas PRD:
  1. User hanya boleh mengubah kolom `name`, `phone`, `headline`, dan `email_notifications` di `profiles` (bukan `role`). Gunakan `REVOKE UPDATE` lalu `GRANT UPDATE (name, phone, headline, email_notifications)`.
  2. Policy insert `applications` harus memakai `user_id = auth.uid() AND status = 'dikirim'`.

## 6. Standar desain dan tulisan (Antislop)

Tujuannya: JobConnect terlihat dibuat desainer manusia, bukan template generik hasil cetakan AI. Antislop tidak melarang teknik visual, tetapi melarang teknik yang dipakai tanpa tujuan.

Jika skill `antislop` (dan sub-skill `antislop-ui`, `antislop-copywriting`, `antislop-human`, `antislop-layoutmobile`, `antislop-code`) tersedia di Antigravity, aktifkan dan patuhi. Bagian ini adalah versi ringkas yang tetap berlaku walaupun skill tidak terbaca.

Jika ada bentrok: **PRD menang** untuk fitur, stack, database, dan daftar halaman. **Antislop menang** untuk kualitas visual, tulisan, dan aksesibilitas.

### 6.1 Design Read JobConnect (sudah diputuskan, jangan ditanyakan ulang)

| Hal | Keputusan |
| --- | --- |
| Produk | JobConnect, portal lowongan kerja |
| Audiens | Pencari kerja (termasuk lulusan SMK/SMA yang baru mulai) dan admin yang memasang lowongan |
| Karakter | Tepercaya, hangat, efisien. Fokus ke kemudahan mencari dan melamar |
| Dials situs publik | ENERGY 2 (Balanced), RHYTHM 2 (konsisten dengan beberapa variasi), MOTION 1 (hover dan transisi ringan) |
| Dials area admin | ENERGY 1 (Calm), RHYTHM 1, MOTION 1. Utamakan keterbacaan tabel dan form |
| Palet | Biru navy sebagai warna utama, abu-abu netral (slate) untuk teks dan latar, satu warna aksen hangat (amber) untuk penanda kecil. Total 2 sampai 3 warna inti + 1 aksen |
| Warna status | Abu-abu, kuning, biru, hijau, merah untuk status lamaran (sesuai PRD). Ini warna fungsional, tidak dihitung ke batas palet. Pakai latar pucat dengan teks gelap agar kontras lolos |
| Font | Inter (sesuai PRD) |
| Bentuk | Radius bervariasi sesuai hierarki: input dan tombol sedang, kartu lebih besar, pil hanya untuk badge status. Bayangan tipis dan konsisten |

### 6.2 Hard Gate (dilanggar berarti gagal)

1. **Tanpa em dash (—).** Pakai koma, titik, titik dua, atau kurung.
2. **Tanpa data atau testimoni palsu.** Angka di UI (jumlah lowongan, jumlah pelamar) harus dihitung dari database. Jika hasilnya 0 atau belum ada, sembunyikan bagian itu. Tidak ada testimoni, foto orang, atau logo perusahaan buatan AI. Logo kosong diganti inisial perusahaan.
3. **Semua elemen interaktif harus berfungsi.** Tombol dan link tidak boleh mati. Form punya validasi dan pesan error. Modal bisa ditutup dengan Esc.
4. **Setiap tampilan data punya 3 state:** Empty, Loading, Error. Buat komponen bersama `EmptyState`, `Skeleton`, `ErrorState` dan pakai ulang.
5. **Aksesibilitas:** kontras teks minimal 4.5:1 (WCAG AA), seluruh situs bisa dipakai lewat Tab dan Enter, fokus terlihat jelas, setiap input punya label.
6. **Mobile-first tanpa cacat:** tidak ada scroll horizontal pada halaman, teks tidak terpotong, target sentuh minimal 44x44px. Uji di 360px, 768px, 1280px. Tabel lebar boleh digeser di dalam wadahnya sendiri.

### 6.3 Aturan dengan alasan (Purpose Gate)

- **Gradient dan glow:** dilarang gradasi biru-ungu atau glow di banyak elemen. Boleh hanya di 1 atau 2 elemen fokus, dengan alasan hierarki.
- **Glassmorphism:** maksimal satu elemen (misalnya Navbar sticky). Tidak boleh semua kartu dibuat kaca blur.
- **Ikon:** pakai ikon yang berhubungan dengan artinya (misalnya briefcase, lokasi, pencarian, dokumen). Hindari sparkle, kubus 3D, dan petir tanpa makna.
- **Kartu:** jangan membuat 3 kartu seragam ukuran dan isi. Daftar lowongan boleh berbentuk kartu atau baris, tetapi bagian lain (kategori, langkah melamar) pakai bentuk berbeda sesuai isinya.
- **Jangan meniru mentah** tampilan Linear, Vercel, Notion, atau Stripe.

### 6.4 Layout

- Hindari pola template AI: Hero, 3 kartu fitur, bento grid, tabel harga, FAQ generik, footer 4 kolom. JobConnect tidak butuh bagian harga, testimoni, atau FAQ generik.
- Beranda: hero berisi kotak pencarian yang langsung berfungsi, lalu kategori (bentuk daftar dengan jumlah lowongan), lalu lowongan terbaru.
- Footer sederhana, maksimal 2 kolom.
- Ritme antar section dibuat bervariasi (lebar, latar, kepadatan), jangan semua section identik.

### 6.5 Tulisan di UI (bahasa Indonesia)

- CTA spesifik: "Cari Lowongan", "Lamar Sekarang", "Unggah CV", "Pasang Lowongan", "Lihat Lamaran Saya". Dilarang "Get Started", "Learn More", "Klik di sini".
- Dilarang buzzword: revolusioner, seamless, cutting-edge, next-gen, "berbasis AI", "solusi terbaik", dan sejenisnya. Jelaskan manfaat nyata dengan kalimat lugas.
- Pesan error menyebut masalah dan cara memperbaikinya, misalnya "CV harus berformat PDF dan maksimal 2 MB".
- Teks state kosong memberi langkah lanjut, misalnya "Belum ada lamaran. Cari lowongan yang cocok".

### 6.6 Kode

- Komentar hanya untuk menjelaskan alasan yang tidak jelas dari kode. Jangan menulis komentar basi seperti `// Import komponen`, `// Fungsi untuk mengambil data`, atau komentar yang mengulang isi kode.
- Jangan menghapus atau mengubah logika saat merapikan komentar.

### 6.7 Delivery Gate sebelum setiap commit yang menyentuh UI

Periksa dulu sebelum `git commit`:

- [ ] Tidak ada em dash, buzzword, atau angka karangan
- [ ] Tombol, link, dan form berfungsi (termasuk Esc pada modal)
- [ ] Ada state Empty, Loading, dan Error untuk data yang dimuat
- [ ] Fokus keyboard terlihat dan kontras teks lolos 4.5:1
- [ ] Tidak ada scroll horizontal di 360px dan target sentuh minimal 44px
- [ ] Warna dan bentuk mengikuti Design Read di 6.1

Jika salah satu belum terpenuhi, perbaiki dulu atau buat commit `fix` atau `style` terpisah sebelum lanjut.

## 7. Laporan setelah setiap commit

Setelah setiap push, tampilkan satu baris ringkas: `nomor | hash pendek | pesan commit`. Berhenti dan tanya pemilik proyek bila ada hal yang ambigu atau perlu tindakan manual (misalnya menjalankan SQL di Supabase, mengisi env di Vercel).

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
