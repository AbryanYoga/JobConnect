# Panduan Menjalankan Migrasi Database Supabase

Panduan ini berisi langkah terperinci untuk menjalankan skrip migrasi database JobConnect di Supabase. Ikuti urutan langkah di bawah ini secara runtut.

---

## 1. Prasyarat

Sebelum memulai, pastikan Anda telah menyiapkan proyek Supabase:
1. Masuk ke akun Anda di [Supabase Dashboard](https://supabase.com).
2. Buat proyek baru untuk JobConnect jika belum ada.
3. Buka menu **Project Settings > API**, lalu salin informasi kredensial berikut untuk konfigurasi aplikasi nanti:
   - **Project URL** (nantinya digunakan sebagai nilai `NEXT_PUBLIC_SUPABASE_URL`)
   - **anon / public key** (nantinya digunakan sebagai nilai `NEXT_PUBLIC_SUPABASE_ANON_KEY`)

> **Penting**: Jangan pernah membagikan atau mencantumkan nilai asli kunci rahasia API ke repositori git atau berkas publik.

---

## 2. Urutan Menjalankan Berkas SQL di SQL Editor

Buka menu **SQL Editor** pada dashboard proyek Supabase Anda. Buat kueri baru (**New query**), salin seluruh isi berkas, lalu jalankan (**Run**) sesuai urutan berikut:

### Langkah 1: `database/schema.sql`
- **Fungsi**: Membentuk 12 tabel aplikasi, relasi kunci asing (foreign key), tipe data terstruktur, aturan pembatas (check constraints), fungsi trigger pembaruan waktu `touch_updated_at`, dan indeks performa kueri.
- **Tabel yang dibuat**: `profiles`, `companies`, `categories`, `provinces`, `cities`, `jobs`, `applications`, `application_status_history`, `application_notes`, `application_ai_reviews`, `notifications`, `saved_jobs`.

### Langkah 2: `database/functions.sql`
- **Fungsi**: Membuat seluruh logika bisnis dan trigger pengaman pada database:
  - Trigger pendaftaran `handle_new_user` untuk pembuatan profil otomatis.
  - Fungsi keamanan dan pencegah rekursi RLS (`is_admin`, `is_company_owner`, `is_job_owner`, `is_application_company`, `has_applied`, `is_applicant_of_my_company`, `get_my_ai_review_status`, `can_company_read_cv`, `owns_logo_folder`).
  - Fungsi aksi alur kerja (`submit_job`, `review_job`, `change_application_status`).
  - Trigger pengaman integritas status lowongan `jobs_guard`.
  - Fungsi agregasi jelajah wilayah (`jobs_count_by_province`, `jobs_count_by_city`).
  - Trigger notifikasi otomatis dalam aplikasi (`notify_*`).
  - Fungsi rekapitulasi performa (`company_report`, `platform_report`).

### Langkah 3: `database/policies.sql`
- **Fungsi**: Mengaktifkan Row Level Security (RLS) pada 12 tabel, menentukan aturan akses baris (SELECT, INSERT, UPDATE, DELETE), membatasi hak akses kolom dengan `GRANT` dan `REVOKE`, mendaftarkan tabel notifikasi ke publikasi realtime, membuat bucket storage `cvs` dan `company-logos`, serta mengatur kebijakan akses berkas storage.

### Langkah 4: `database/seed_wilayah.sql`
- **Fungsi**: Memasukkan data referensi resmi 38 provinsi dan 514 kota/kabupaten di Indonesia berdasarkan Kepmendagri No. 300.2.2-2138 Tahun 2025.

### Langkah 5: `database/seed.sql`
- **Fungsi**: Memasukkan 12 kategori pekerjaan awal dan data percontohan untuk demo:
  - 12 kategori bidang kerja nyata.
  - Bagian **DATA CONTOH**: 3 akun perusahaan dummy, 3 profil perusahaan mitra contoh, dan 10 lowongan pekerjaan contoh berlabel `is_demo = true`.
  - **Perhatian**: Bagian data contoh pada berkas ini hanya ditujukan untuk tahap pengembangan dan demonstrasi. Jangan jalankan bagian data contoh tersebut pada basis data produksi sungguhan.

---

## 3. Cara Membuat Akun Admin Moderator

Peran admin memiliki hak moderasi untuk menyetujui, menolak, atau menurunkan lowongan. Sesuai prinsip keamanan (PRD bagian 2), peran admin tidak dapat dipilih secara langsung melalui formulir pendaftaran aplikasi.

Untuk membuat akun admin:
1. Buat akun pengguna baru melalui menu dashboard Supabase: **Authentication > Users > Add user > Create user** (atau daftar melalui halaman registrasi web saat aplikasi sudah berjalan).
2. Masukkan alamat email admin dan kata sandi yang kuat.
3. Buka **SQL Editor**, lalu jalankan kueri berikut untuk mengubah perannya menjadi admin:
   ```sql
   update public.profiles
   set role = 'admin'
   where email = 'email-admin-anda@domain.com';
   ```
4. Pastikan baris terupdate dengan memeriksa kembali profil tersebut:
   ```sql
   select id, email, name, role
   from public.profiles
   where email = 'email-admin-anda@domain.com';
   ```

---

## 4. Pemeriksaan Hasil Migrasi (Query Siap Tempel)

Setelah seluruh skrip berhasil dijalankan, jalankan kueri verifikasi berikut di SQL Editor untuk memastikan seluruh komponen terpasang dengan benar:

### (a) Memeriksa status RLS pada seluruh 12 tabel
Semua baris harus bernilai `rowsecurity = true`:
```sql
select tablename, rowsecurity
from pg_tables
where schemaname = 'public'
  and tablename in (
    'profiles', 'companies', 'categories', 'provinces', 'cities',
    'jobs', 'applications', 'application_status_history', 'application_notes',
    'application_ai_reviews', 'notifications', 'saved_jobs'
  )
order by tablename;
```

### (b) Memeriksa jumlah data wilayah
Harus menghasilkan tepat 38 provinsi dan 514 kota/kabupaten:
```sql
select
  (select count(*) from public.provinces) as total_provinces,
  (select count(*) from public.cities) as total_cities;
```

### (c) Menampilkan daftar seluruh kebijakan RLS yang terdaftar
```sql
select tablename, policyname, cmd, roles
from pg_policies
where schemaname = 'public'
order by tablename, policyname;
```

### (d) Memeriksa konfigurasi bucket storage
Bucket `cvs` harus bernilai `public = false` (maksimal 2 MB), sedangkan bucket `company-logos` harus bernilai `public = true` (maksimal 1 MB):
```sql
select id, name, public, file_size_limit, allowed_mime_types
from storage.buckets
where id in ('cvs', 'company-logos');
```

### (e) Memastikan tabel notifikasi terdaftar pada publikasi realtime
Harus menampilkan baris untuk tabel `notifications`:
```sql
select pubname, schemaname, tablename
from pg_publication_tables
where pubname = 'supabase_realtime'
  and tablename = 'notifications';
```

### (f) Memeriksa jumlah lowongan contoh (demo)
```sql
select is_demo, count(*) as total_lowongan
from public.jobs
group by is_demo;
```

---

## 5. Uji Keamanan Manual (Security Smoke Test)

Lakukan pengujian aturan keamanan langsung di SQL Editor menggunakan simulasi role pembaca atau pengguna biasa:

1. **Uji proteksi kolom role di profiles**:
   Pengguna biasa tidak boleh dapat mengubah perannya sendiri menjadi admin:
   ```sql
   -- Jalankan sebagai authenticated user
   -- Ekspektasi: Gagal dengan pesan "permission denied for column role"
   update public.profiles
   set role = 'admin'
   where id = auth.uid();
   ```

2. **Uji insert lamaran langsung dengan status tidak sah**:
   Pengguna biasa dilarang membuat lamaran langsung berstatus diterima:
   ```sql
   -- Ekspektasi: Gagal ditolak oleh policy insert applications (wajib status = 'dikirim')
   insert into public.applications (
     job_id, user_id, cv_path, cover_letter, ai_consent, status
   )
   values (
     1, auth.uid(), auth.uid()::text || '/1.pdf', 'Surat pengantar', true, 'diterima'
   );
   ```

3. **Uji manipulasi status lowongan oleh perusahaan**:
   Perusahaan tidak boleh dapat mengubah status lowongan secara sepihak langsung menjadi open tanpa melewati proses ACC admin:
   ```sql
   -- Ekspektasi: Gagal ditolak oleh trigger pengaman jobs_guard
   update public.jobs
   set status = 'open'
   where id = 1;
   ```

4. **Uji privasi berkas lamaran terhadap admin**:
   Admin secara sadar dibatasi dan tidak memiliki hak akses membaca baris lamaran pelamar:
   ```sql
   -- Ekspektasi: Mengembalikan 0 baris (kebijakan RLS applications tidak memberi akses ke admin)
   select * from public.applications;
   ```

5. **Uji privasi ulasan AI terhadap pelamar**:
   Pelamar tidak memiliki hak akses langsung ke tabel penilaian AI:
   ```sql
   -- Ekspektasi: Mengembalikan 0 baris (hanya pemilik lowongan yang diizinkan)
   select * from public.application_ai_reviews;
   ```

---

## 6. Catatan Khusus Mengenai Service Role Key

- Kunci `SUPABASE_SERVICE_ROLE_KEY` memiliki hak administratif penuh yang melewati seluruh kebijakan RLS database.
- Kunci ini **TIDAK DIGUNAKAN** pada konfigurasi klien maupun variabel lingkungan publik.
- Pada sistem JobConnect, kunci service role hanya akan diizinkan pada satu modul server terisolasi di `lib/supabase/admin.ts` yang dikhususkan untuk worker pemrosesan hasil screening AI Claude pada Fase 14.

---

## 7. Pembaruan Setelah Migrasi Awal (Pilihan Analisis AI Opsional)

Bila Anda sebelumnya sudah menjalankan migrasi database lengkap (Langkah 1 sampai 5 di bagian 2), Anda **tidak perlu mengulang seluruh skrip dari awal**.

Cukup buka **SQL Editor** di Supabase Dashboard, buat kueri baru, lalu salin dan jalankan **hanya dua blok pembaruan berikut** secara berurutan:

### Blok 1: Pembaruan Policy Insert Lamaran (dari `database/policies.sql`)
Mengizinkan pelamar mengirim lamaran baik dengan memilih analisis AI (`ai_consent = true`) maupun tanpa analisis AI (`ai_consent = false`):

```sql
drop policy if exists "applications_insert_policy" on public.applications;
create policy "applications_insert_policy"
on public.applications
for insert
to authenticated
with check (
  user_id = auth.uid()
  and status = 'dikirim'
  and exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and role = 'user'
  )
  and cv_path = (auth.uid()::text || '/' || job_id::text || '.pdf')
  and exists (
    select 1
    from public.jobs
    where id = job_id
      and status = 'open'
      and (deadline is null or deadline >= current_date)
  )
);
```

### Blok 2: Pembaruan Fungsi Trigger Lamaran (dari `database/functions.sql`)
Memeriksa pilihan pelamar terlebih dahulu: jika pelamar tidak memilih analisis AI, baris ulasan otomatis berstatus `skipped` dengan pesan penjelas:

```sql
create or replace function public.notify_on_application_created()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_info record;
begin
  select
    j.title as job_title,
    j.ai_screening,
    c.owner_id as company_owner_id,
    p.name as applicant_name
  into v_info
  from public.jobs j
  join public.companies c on c.id = j.company_id
  join public.profiles p on p.id = new.user_id
  where j.id = new.job_id;

  if found and v_info.company_owner_id is not null then
    -- Notifikasi lamaran_baru ke pemilik perusahaan
    insert into public.notifications (user_id, type, title, body, link)
    values (
      v_info.company_owner_id,
      'lamaran_baru',
      'Lamaran Baru Masuk',
      v_info.applicant_name || ' mengirimkan lamaran untuk posisi ' || v_info.job_title,
      '/mitra/pelamar/' || new.id::text
    );
  end if;

  -- Buat baris application_ai_reviews otomatis
  if new.ai_consent is not true then
    insert into public.application_ai_reviews (application_id, status, error_message)
    values (new.id, 'skipped', 'Pelamar tidak memilih analisis AI')
    on conflict (application_id) do nothing;
  elsif coalesce(v_info.ai_screening, true) then
    insert into public.application_ai_reviews (application_id, status)
    values (new.id, 'pending')
    on conflict (application_id) do nothing;
  else
    insert into public.application_ai_reviews (application_id, status, error_message)
    values (new.id, 'skipped', 'Analisis AI dimatikan untuk lowongan ini')
    on conflict (application_id) do nothing;
  end if;

  return new;
end;
$$;

drop trigger if exists trg_notify_on_application_created on public.applications;
create trigger trg_notify_on_application_created
after insert on public.applications
for each row
execute function public.notify_on_application_created();
```

### Kueri Uji Pembaruan:
Untuk memastikan pembaruan telah aktif, Anda dapat mencoba insert lamaran dengan `ai_consent = false` sebagai pelamar lalu periksa hasilnya:

```sql
-- Uji verifikasi: Baris review wajib terbentuk dengan status 'skipped' dan error_message 'Pelamar tidak memilih analisis AI'
select a.id, a.ai_consent, r.status as review_status, r.error_message
from public.applications a
left join public.application_ai_reviews r on r.application_id = a.id
order by a.created_at desc
limit 5;
```
