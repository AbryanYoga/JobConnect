-- Urutan eksekusi berkas SQL di Supabase SQL Editor:
-- 1. schema.sql
-- 2. functions.sql
-- 3. policies.sql
-- 4. seed_wilayah.sql
-- 5. seed.sql

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null default 'Pengguna' check (char_length(name) <= 100),
  email text,
  role text not null default 'user' check (role in ('user', 'company', 'admin')),
  phone text,
  headline text check (headline is null or char_length(headline) <= 120),
  email_notifications boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.categories (
  id bigint generated always as identity primary key,
  name text not null unique,
  slug text not null unique
);

-- Slug remote dicadangkan untuk rute khusus lowongan jarak jauh (/wilayah/remote)
create table if not exists public.provinces (
  id smallint primary key,
  name text not null,
  slug text not null unique check (slug <> 'remote')
);

-- Nama memuat awalan "Kota" atau "Kabupaten" agar slug tidak bentrok (PRD 9.1)
create table if not exists public.cities (
  id int primary key,
  province_id smallint not null references public.provinces(id) on delete restrict,
  name text not null,
  slug text not null,
  type text not null check (type in ('kabupaten', 'kota')),
  unique (province_id, slug)
);
