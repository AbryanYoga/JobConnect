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
  avatar_url text,
  province_id smallint references public.provinces(id) on delete set null,
  city_id int references public.cities(id) on delete set null,
  birth_date date,
  education_level text check (education_level is null or education_level in ('smp', 'sma_smk', 'd3', 'd4', 's1', 's2', 's3', 'lainnya')),
  education_institution text check (education_institution is null or char_length(education_institution) <= 150),
  bio text check (bio is null or char_length(bio) <= 1500),
  linkedin_url text,
  portfolio_url text,
  portfolios jsonb default '[]'::jsonb,
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

create table if not exists public.applications (
  id bigint generated always as identity primary key,
  job_id bigint not null references public.jobs(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  cv_path text not null,
  cover_letter text check (cover_letter is null or char_length(cover_letter) <= 2000),
  ai_consent boolean not null,
  status text not null default 'dikirim' check (status in ('dikirim', 'ditinjau', 'shortlist', 'wawancara', 'ditawari', 'diterima', 'ditolak', 'ditarik')),
  message_to_applicant text,
  interview_at timestamptz,
  interview_place text,
  decided_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (job_id, user_id)
);

drop trigger if exists trg_applications_touch_updated_at on public.applications;
create trigger trg_applications_touch_updated_at
before update on public.applications
for each row
execute function public.touch_updated_at();

create table if not exists public.application_status_history (
  id bigint generated always as identity primary key,
  application_id bigint not null references public.applications(id) on delete cascade,
  from_status text,
  to_status text not null,
  changed_by uuid,
  note text,
  created_at timestamptz not null default now()
);

create table if not exists public.application_notes (
  id bigint generated always as identity primary key,
  application_id bigint not null references public.applications(id) on delete cascade,
  author_id uuid not null,
  note text not null check (char_length(note) <= 2000),
  created_at timestamptz not null default now()
);

create table if not exists public.application_ai_reviews (
  id bigint generated always as identity primary key,
  application_id bigint not null unique references public.applications(id) on delete cascade,
  status text not null default 'pending' check (status in ('pending', 'processing', 'done', 'failed', 'skipped')),
  score int check (score is null or (score between 0 and 100)),
  level text check (level is null or level in ('tinggi', 'sedang', 'rendah')),
  summary text,
  matched_skills text[] not null default '{}',
  missing_skills text[] not null default '{}',
  interview_questions text[] not null default '{}',
  suspicious boolean not null default false,
  attempts int not null default 0,
  error_message text,
  model text,
  created_at timestamptz not null default now(),
  completed_at timestamptz
);

create table if not exists public.notifications (
  id bigint generated always as identity primary key,
  user_id uuid not null references public.profiles(id) on delete cascade,
  type text not null,
  title text not null,
  body text,
  link text,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

-- Fitur P2: Bookmark lowongan oleh pelamar
create table if not exists public.saved_jobs (
  user_id uuid not null references public.profiles(id) on delete cascade,
  job_id bigint not null references public.jobs(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, job_id)
);

-- Index performa query dan relasi foreign key
create index if not exists idx_jobs_status_deadline on public.jobs(status, deadline);
create index if not exists idx_jobs_company_id on public.jobs(company_id);
create index if not exists idx_jobs_category_id on public.jobs(category_id);
create index if not exists idx_jobs_city_id_status on public.jobs(city_id, status);
create index if not exists idx_cities_province_id on public.cities(province_id);
create index if not exists idx_jobs_skills_gin on public.jobs using gin(skills);
create index if not exists idx_applications_user_id on public.applications(user_id);
create index if not exists idx_applications_job_id_status on public.applications(job_id, status);
create index if not exists idx_notifications_user_read_created on public.notifications(user_id, read_at, created_at desc);
create index if not exists idx_application_ai_reviews_score on public.application_ai_reviews(score);

create index if not exists idx_application_status_history_application_id on public.application_status_history(application_id);
create index if not exists idx_application_notes_application_id on public.application_notes(application_id);
create index if not exists idx_saved_jobs_job_id on public.saved_jobs(job_id);
create index if not exists idx_companies_city_id on public.companies(city_id);
create index if not exists idx_jobs_open_created_at on public.jobs(created_at desc) where status = 'open';
