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
