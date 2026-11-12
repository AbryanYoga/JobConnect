-- ========================================================
-- MIGRATION: Penambahan Biodata Pencari Kerja & Portofolio Akun
-- Eksekusi di Supabase SQL Editor jika belum diterapkan
-- ========================================================

-- 1. Tambah kolom biodata dan portofolio ke tabel profiles
alter table public.profiles
  add column if not exists province_id smallint references public.provinces(id) on delete set null,
  add column if not exists city_id int references public.cities(id) on delete set null,
  add column if not exists birth_date date,
  add column if not exists education_level text check (education_level is null or education_level in ('smp', 'sma_smk', 'd3', 'd4', 's1', 's2', 's3', 'lainnya')),
  add column if not exists education_institution text check (education_institution is null or char_length(education_institution) <= 150),
  add column if not exists bio text check (bio is null or char_length(bio) <= 1500),
  add column if not exists linkedin_url text,
  add column if not exists portfolio_url text,
  add column if not exists portfolios jsonb default '[]'::jsonb;

-- 2. Berikan izin hak akses RLS (update) kepada pengguna terautentikasi
-- Catatan: Kolom role dan email tetap terproteksi ketat dan tidak boleh diubah langsung oleh klien
grant update (
  name,
  phone,
  headline,
  email_notifications,
  province_id,
  city_id,
  birth_date,
  education_level,
  education_institution,
  bio,
  linkedin_url,
  portfolio_url,
  portfolios
) on public.profiles to authenticated;

