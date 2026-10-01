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

-- Policy tabel jobs
drop policy if exists "jobs_select_policy" on public.jobs;
create policy "jobs_select_policy"
on public.jobs
for select
using (
  status = 'open'
  or public.is_company_owner(company_id)
  or public.is_admin()
  or public.has_applied(id)
);

drop policy if exists "jobs_insert_policy" on public.jobs;
create policy "jobs_insert_policy"
on public.jobs
for insert
to authenticated
with check (
  public.is_company_owner(company_id)
  and status = 'draft'
  and is_demo = false
);

drop policy if exists "jobs_update_policy" on public.jobs;
create policy "jobs_update_policy"
on public.jobs
for update
to authenticated
using (public.is_company_owner(company_id))
with check (public.is_company_owner(company_id));

drop policy if exists "jobs_delete_policy" on public.jobs;
create policy "jobs_delete_policy"
on public.jobs
for delete
to authenticated
using (
  public.is_company_owner(company_id)
  and status = 'draft'
);

-- Pembatasan hak kolom jobs dari klien
revoke insert, update, delete on public.jobs from anon, authenticated;
grant insert (
  company_id,
  category_id,
  city_id,
  location_detail,
  title,
  slug,
  work_mode,
  job_type,
  education_min,
  experience_min_years,
  skills,
  summary,
  responsibilities,
  nice_to_have,
  benefits,
  salary_min,
  salary_max,
  deadline,
  status,
  ai_screening
) on public.jobs to authenticated;

grant update (
  category_id,
  city_id,
  location_detail,
  title,
  work_mode,
  job_type,
  education_min,
  experience_min_years,
  skills,
  summary,
  responsibilities,
  nice_to_have,
  benefits,
  salary_min,
  salary_max,
  deadline,
  status,
  ai_screening
) on public.jobs to authenticated;

grant delete on public.jobs to authenticated;

-- Policy tabel applications
drop policy if exists "applications_select_policy" on public.applications;
create policy "applications_select_policy"
on public.applications
for select
to authenticated
using (
  user_id = auth.uid()
  or public.is_job_owner(job_id)
);

drop policy if exists "applications_insert_policy" on public.applications;
create policy "applications_insert_policy"
on public.applications
for insert
to authenticated
with check (
  user_id = auth.uid()
  and status = 'dikirim'
  and ai_consent = true
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

revoke all on public.applications from anon;
revoke update, delete on public.applications from authenticated;
grant insert (job_id, user_id, cv_path, cover_letter, ai_consent, status) on public.applications to authenticated;

-- Policy tabel application_status_history
drop policy if exists "application_status_history_select_policy" on public.application_status_history;
create policy "application_status_history_select_policy"
on public.application_status_history
for select
to authenticated
using (
  exists (
    select 1
    from public.applications a
    where a.id = application_id
      and a.user_id = auth.uid()
  )
  or public.is_application_company(application_id)
);

revoke all on public.application_status_history from anon;
revoke insert, update, delete on public.application_status_history from authenticated;
