-- Berkas fungsi dan trigger database JobConnect
-- Dijalankan pada urutan ke-2 setelah schema.sql

-- Mencegah eskalasi hak akses pendaftaran agar role admin tidak bisa disuntikkan lewat metadata
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_role text;
  v_name text;
begin
  if new.raw_user_meta_data->>'role' = 'company' then
    v_role := 'company';
  else
    v_role := 'user';
  end if;

  v_name := substring(coalesce(nullif(trim(new.raw_user_meta_data->>'name'), ''), 'Pengguna'), 1, 100);

  insert into public.profiles (id, email, name, role)
  values (new.id, new.email, v_name, v_role)
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row
execute function public.handle_new_user();

-- Fungsi helper keamanan dan pencegah rekursi RLS
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and role = 'admin'
  );
$$;

create or replace function public.is_company_owner(p_company_id bigint)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.companies
    where id = p_company_id
      and owner_id = auth.uid()
  );
$$;

create or replace function public.is_job_owner(p_job_id bigint)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.jobs j
    join public.companies c on c.id = j.company_id
    where j.id = p_job_id
      and c.owner_id = auth.uid()
  );
$$;

create or replace function public.is_application_company(p_application_id bigint)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.applications a
    join public.jobs j on j.id = a.job_id
    join public.companies c on c.id = j.company_id
    where a.id = p_application_id
      and c.owner_id = auth.uid()
  );
$$;

create or replace function public.has_applied(p_job_id bigint)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.applications
    where job_id = p_job_id
      and user_id = auth.uid()
  );
$$;

create or replace function public.is_applicant_of_my_company(p_user_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.applications a
    join public.jobs j on j.id = a.job_id
    join public.companies c on c.id = j.company_id
    where a.user_id = p_user_id
      and c.owner_id = auth.uid()
  );
$$;

-- Mengambil status review AI untuk pelamar tanpa membocorkan skor atau catatan detail
create or replace function public.get_my_ai_review_status(p_application_id bigint)
returns text
language sql
stable
security definer
set search_path = ''
as $$
  select r.status
  from public.application_ai_reviews r
  join public.applications a on a.id = r.application_id
  where r.application_id = p_application_id
    and a.user_id = auth.uid();
$$;

