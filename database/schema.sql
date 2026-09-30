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
