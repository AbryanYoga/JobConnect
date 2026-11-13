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
  avatar_url,
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

-- 3. Pasang fungsi RPC update_my_profile (SECURITY DEFINER)
create or replace function public.update_my_profile(
  p_name text,
  p_phone text default null,
  p_headline text default null,
  p_province_id smallint default null,
  p_city_id int default null,
  p_birth_date date default null,
  p_education_level text default null,
  p_education_institution text default null,
  p_bio text default null,
  p_linkedin_url text default null,
  p_portfolio_url text default null,
  p_portfolios jsonb default '[]'::jsonb,
  p_email_notifications boolean default true
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := auth.uid();
begin
  if v_user_id is not null then
    update public.profiles
    set
      name = coalesce(nullif(trim(p_name), ''), name),
      phone = p_phone,
      headline = p_headline,
      province_id = p_province_id,
      city_id = p_city_id,
      birth_date = p_birth_date,
      education_level = p_education_level,
      education_institution = p_education_institution,
      bio = p_bio,
      linkedin_url = p_linkedin_url,
      portfolio_url = p_portfolio_url,
      portfolios = coalesce(p_portfolios, '[]'::jsonb),
      email_notifications = coalesce(p_email_notifications, true),
      updated_at = now()
    where id = v_user_id;
  end if;
end;
$$;

grant execute on function public.update_my_profile to authenticated;

