-- Berkas aturan keamanan RLS dan policy database JobConnect
-- Dijalankan pada urutan ke-3 setelah schema.sql dan functions.sql

-- Pengaktifan Row Level Security (RLS) pada 12 tabel aplikasi
alter table public.profiles enable row level security;
alter table public.companies enable row level security;
alter table public.categories enable row level security;
alter table public.provinces enable row level security;
alter table public.cities enable row level security;
alter table public.jobs enable row level security;
alter table public.applications enable row level security;
alter table public.application_status_history enable row level security;
alter table public.application_notes enable row level security;
alter table public.application_ai_reviews enable row level security;
alter table public.notifications enable row level security;
alter table public.saved_jobs enable row level security;

-- Policy tabel profiles
drop policy if exists "profiles_select_policy" on public.profiles;
create policy "profiles_select_policy"
on public.profiles
for select
using (
  id = auth.uid()
  or public.is_admin()
  or public.is_applicant_of_my_company(id)
);

drop policy if exists "profiles_update_policy" on public.profiles;
create policy "profiles_update_policy"
on public.profiles
for update
using (id = auth.uid())
with check (id = auth.uid());

-- Mencegah pengguna mengubah kolom role menjadi admin atau memalsukan email dari klien
revoke all on public.profiles from anon;
revoke insert, update, delete on public.profiles from authenticated;
grant update (name, phone, headline, email_notifications) on public.profiles to authenticated;

-- Policy tabel companies
drop policy if exists "companies_select_policy" on public.companies;
create policy "companies_select_policy"
on public.companies
for select
using (true);

drop policy if exists "companies_insert_policy" on public.companies;
create policy "companies_insert_policy"
on public.companies
for insert
to authenticated
with check (
  owner_id = auth.uid()
  and exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and role = 'company'
  )
);

drop policy if exists "companies_update_policy" on public.companies;
create policy "companies_update_policy"
on public.companies
for update
to authenticated
using (public.is_company_owner(id))
with check (owner_id = auth.uid());

-- slug dan owner_id tidak bisa diubah setelah dibuat agar URL profil stabil
revoke insert, update, delete on public.companies from anon, authenticated;
grant insert (owner_id, name, slug, logo_path, website, industry, size, city_id, address_note, description) on public.companies to authenticated;
grant update (name, logo_path, website, industry, size, city_id, address_note, description) on public.companies to authenticated;

-- Policy tabel categories
drop policy if exists "categories_select_policy" on public.categories;
create policy "categories_select_policy"
on public.categories
for select
using (true);

drop policy if exists "categories_admin_all_policy" on public.categories;
create policy "categories_admin_all_policy"
on public.categories
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

-- Policy tabel provinces
drop policy if exists "provinces_select_policy" on public.provinces;
create policy "provinces_select_policy"
on public.provinces
for select
using (true);

drop policy if exists "provinces_admin_all_policy" on public.provinces;
create policy "provinces_admin_all_policy"
on public.provinces
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

-- Policy tabel cities
drop policy if exists "cities_select_policy" on public.cities;
create policy "cities_select_policy"
on public.cities
for select
using (true);

drop policy if exists "cities_admin_all_policy" on public.cities;
create policy "cities_admin_all_policy"
on public.cities
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());
