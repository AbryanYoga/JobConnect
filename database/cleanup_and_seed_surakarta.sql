-- ==============================================================================
-- JobConnect: Pembersihan Data Mitra Lama & Pengisian Lowongan Wilayah Surakarta
-- Eksekusi skrip ini di Supabase SQL Editor untuk membersihkan data lowongan/mitra lama
-- dan hanya menyisakan akun mitra resmi mitra.test@jobconnect.id di Kota Surakarta.
-- ==============================================================================

begin;

-- 1. Hapus lowongan lama yang bukan milik PIC Mitra Perusahaan (owner_id bukan mitra.test)
delete from public.applications
where job_id in (
  select j.id from public.jobs j
  join public.companies c on c.id = j.company_id
  where c.owner_id <> 'c0000000-0000-0000-0000-000000000001'::uuid
);

delete from public.saved_jobs
where job_id in (
  select j.id from public.jobs j
  join public.companies c on c.id = j.company_id
  where c.owner_id <> 'c0000000-0000-0000-0000-000000000001'::uuid
);

delete from public.jobs
where company_id in (
  select id from public.companies
  where owner_id <> 'c0000000-0000-0000-0000-000000000001'::uuid
);

-- 2. Hapus perusahaan lama selain PIC Mitra Perusahaan
delete from public.companies
where owner_id <> 'c0000000-0000-0000-0000-000000000001'::uuid;

-- 3. Pastikan domisili PIC Mitra Perusahaan berada di Kota Surakarta
update public.companies
set
  city_id = 3372,
  address_note = 'Jl. Slamet Riyadi No. 182, Timuran, Kec. Banjarsari, Kota Surakarta, Jawa Tengah 57131'
where owner_id = 'c0000000-0000-0000-0000-000000000001'::uuid;

commit;
