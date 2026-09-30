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

create table if not exists public.companies (
  id bigint generated always as identity primary key,
  owner_id uuid not null unique references public.profiles(id) on delete cascade,
  name text not null check (char_length(name) <= 100),
  slug text not null unique,
  logo_path text,
  website text,
  industry text,
  size text,
  city_id int references public.cities(id) on delete restrict,
  address_note text check (address_note is null or char_length(address_note) <= 150),
  description text check (description is null or char_length(description) <= 1500),
  created_at timestamptz not null default now()
);

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Melonggarkan syarat kota agar lowongan berstatus draft tanpa kota tetap bisa disimpan
create table if not exists public.jobs (
  id bigint generated always as identity primary key,
  company_id bigint not null references public.companies(id) on delete cascade,
  category_id bigint references public.categories(id) on delete restrict,
  city_id int references public.cities(id) on delete restrict,
  location_detail text,
  title text not null check (char_length(title) <= 80),
  slug text not null unique,
  work_mode text not null default 'onsite' check (work_mode in ('onsite', 'hybrid', 'remote')),
  job_type text not null default 'full_time' check (job_type in ('full_time', 'part_time', 'magang', 'kontrak', 'freelance')),
  education_min text not null default 'tanpa_syarat' check (education_min in ('tanpa_syarat', 'sma_smk', 'd3', 's1', 's2')),
  experience_min_years int not null default 0 check (experience_min_years between 0 and 20),
  skills text[] not null default '{}' check (cardinality(skills) <= 8),
  summary text check (summary is null or char_length(summary) <= 280),
  responsibilities text[] not null default '{}' check (cardinality(responsibilities) <= 6),
  nice_to_have text[] not null default '{}' check (cardinality(nice_to_have) <= 5),
  benefits text[] not null default '{}' check (cardinality(benefits) <= 6),
  salary_min int check (salary_min is null or salary_min >= 0),
  salary_max int,
  deadline date,
  status text not null default 'draft' check (status in ('draft', 'pending', 'open', 'rejected', 'closed', 'removed')),
  review_note text,
  reviewed_by uuid,
  reviewed_at timestamptz,
  ai_screening boolean not null default true,
  is_demo boolean not null default false,
  views int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (salary_max is null or salary_min is null or salary_max >= salary_min),
  check (status = 'draft' or city_id is not null or work_mode = 'remote')
);

drop trigger if exists trg_jobs_touch_updated_at on public.jobs;
create trigger trg_jobs_touch_updated_at
before update on public.jobs
for each row
execute function public.touch_updated_at();
