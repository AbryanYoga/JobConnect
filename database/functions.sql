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

-- Pemeriksaan hak akses perusahaan membaca CV pelamar pada lowongannya
create or replace function public.can_company_read_cv(p_path text)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.applications a
    where a.cv_path = p_path
      and public.is_job_owner(a.job_id)
  );
$$;

-- Memeriksa kepemilikan folder logo perusahaan dengan evaluasi CASE untuk keamanan typecast
create or replace function public.owns_logo_folder(p_path text)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select case
    when f ~ '^[0-9]+$' then
      public.is_company_owner(f::bigint)
    else
      false
  end
  from (
    select (storage.foldername(p_path))[1] as f
  ) sub;
$$;

-- Pengajuan lowongan pekerjaan oleh pemilik perusahaan dengan validasi kelengkapan
create or replace function public.submit_job(p_job_id bigint)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_job record;
  v_item text;
  v_skills_count int;
  v_resp_count int;
  v_nth_count int;
  v_ben_count int;
begin
  select j.*, c.name as company_name, c.city_id as company_city_id
  into v_job
  from public.jobs j
  join public.companies c on c.id = j.company_id
  where j.id = p_job_id;

  if not found then
    raise exception 'Lowongan tidak ditemukan';
  end if;

  if not public.is_company_owner(v_job.company_id) then
    raise exception 'Hanya pemilik perusahaan yang dapat mengajukan lowongan ini';
  end if;

  if v_job.status not in ('draft', 'rejected') then
    raise exception 'Hanya lowongan berstatus draft atau rejected yang dapat diajukan (status saat ini: %)', v_job.status;
  end if;

  -- Cek profil perusahaan
  if v_job.company_name is null or trim(v_job.company_name) = '' then
    raise exception 'Profil perusahaan harus memiliki nama yang valid sebelum mengajukan lowongan';
  end if;

  if v_job.company_city_id is null then
    raise exception 'Profil perusahaan harus memiliki kota/kabupaten sebelum mengajukan lowongan';
  end if;

  -- Cek kelengkapan lowongan (PRD 3.7)
  if v_job.title is null or char_length(trim(v_job.title)) < 5 or char_length(trim(v_job.title)) > 80 then
    raise exception 'Judul lowongan harus 5 sampai 80 karakter (sekarang %)', coalesce(char_length(trim(v_job.title)), 0);
  end if;

  if v_job.category_id is null then
    raise exception 'Kategori pekerjaan wajib dipilih';
  end if;

  if v_job.summary is null or char_length(trim(v_job.summary)) < 50 or char_length(trim(v_job.summary)) > 280 then
    raise exception 'Ringkasan harus 50 sampai 280 karakter (sekarang %)', coalesce(char_length(trim(v_job.summary)), 0);
  end if;

  v_skills_count := coalesce(cardinality(v_job.skills), 0);
  if v_skills_count < 1 or v_skills_count > 8 then
    raise exception 'Keahlian harus 1 sampai 8 item (sekarang %)', v_skills_count;
  end if;
  foreach v_item in array v_job.skills loop
    if v_item is null or char_length(trim(v_item)) = 0 or char_length(trim(v_item)) > 30 then
      raise exception 'Setiap keahlian tidak boleh kosong dan maksimal 30 karakter';
    end if;
  end loop;

  v_resp_count := coalesce(cardinality(v_job.responsibilities), 0);
  if v_resp_count < 3 or v_resp_count > 6 then
    raise exception 'Tanggung jawab harus 3 sampai 6 item (sekarang %)', v_resp_count;
  end if;
  foreach v_item in array v_job.responsibilities loop
    if v_item is null or char_length(trim(v_item)) = 0 or char_length(trim(v_item)) > 120 then
      raise exception 'Setiap tanggung jawab tidak boleh kosong dan maksimal 120 karakter';
    end if;
  end loop;

  v_nth_count := coalesce(cardinality(v_job.nice_to_have), 0);
  if v_nth_count > 5 then
    raise exception 'Nilai tambah maksimal 5 item (sekarang %)', v_nth_count;
  end if;
  foreach v_item in array v_job.nice_to_have loop
    if v_item is null or char_length(trim(v_item)) = 0 or char_length(trim(v_item)) > 120 then
      raise exception 'Setiap nilai tambah tidak boleh kosong dan maksimal 120 karakter';
    end if;
  end loop;

  v_ben_count := coalesce(cardinality(v_job.benefits), 0);
  if v_ben_count > 6 then
    raise exception 'Benefit maksimal 6 item (sekarang %)', v_ben_count;
  end if;
  foreach v_item in array v_job.benefits loop
    if v_item is null or char_length(trim(v_item)) = 0 or char_length(trim(v_item)) > 60 then
      raise exception 'Setiap benefit tidak boleh kosong dan maksimal 60 karakter';
    end if;
  end loop;

  if v_job.deadline is null then
    raise exception 'Batas waktu lamaran (deadline) wajib diisi';
  end if;

  if v_job.deadline < current_date then
    raise exception 'Batas waktu lamaran (deadline) tidak boleh di masa lalu (sekarang %)', v_job.deadline;
  end if;

  if v_job.work_mode <> 'remote' and v_job.city_id is null then
    raise exception 'Kota penempatan wajib dipilih untuk mode kerja non-remote';
  end if;

  -- Pengajuan berhasil, ubah status ke pending dan bersihkan riwayat review sebelumnya
  update public.jobs
  set
    status = 'pending',
    review_note = null,
    reviewed_by = null,
    reviewed_at = null
  where id = p_job_id;
end;
$$;

-- Peninjauan lowongan oleh admin moderator platform (approve, reject, takedown)
create or replace function public.review_job(
  p_job_id bigint,
  p_decision text,
  p_note text default null
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_job record;
  v_new_status text;
begin
  if not public.is_admin() then
    raise exception 'Hanya admin yang berhak meninjau lowongan';
  end if;

  if p_decision not in ('approve', 'reject', 'takedown') then
    raise exception 'Keputusan review tidak valid (harus approve, reject, atau takedown)';
  end if;

  select * into v_job
  from public.jobs
  where id = p_job_id;

  if not found then
    raise exception 'Lowongan tidak ditemukan';
  end if;

  if p_decision = 'approve' then
    if v_job.status <> 'pending' then
      raise exception 'Hanya lowongan berstatus pending yang dapat disetujui (status saat ini: %)', v_job.status;
    end if;
    v_new_status := 'open';
  elsif p_decision = 'reject' then
    if v_job.status <> 'pending' then
      raise exception 'Hanya lowongan berstatus pending yang dapat ditolak (status saat ini: %)', v_job.status;
    end if;
    if p_note is null or trim(p_note) = '' then
      raise exception 'Catatan review wajib diisi saat menolak lowongan';
    end if;
    v_new_status := 'rejected';
  elsif p_decision = 'takedown' then
    if v_job.status <> 'open' then
      raise exception 'Hanya lowongan berstatus open yang dapat di-takedown (status saat ini: %)', v_job.status;
    end if;
    if p_note is null or trim(p_note) = '' then
      raise exception 'Catatan review wajib diisi saat melakukan takedown lowongan';
    end if;
    v_new_status := 'removed';
  end if;

  update public.jobs
  set
    status = v_new_status,
    reviewed_by = auth.uid(),
    reviewed_at = now(),
    review_note = p_note
  where id = p_job_id;
end;
$$;

-- Trigger pengaman tanpa security definer agar pemeriksaan current_user hanya menghadang operasi langsung dari anon dan authenticated
create or replace function public.jobs_guard()
returns trigger
language plpgsql
as $$
begin
  if current_user in ('anon', 'authenticated') then
    if tg_op = 'INSERT' then
      if new.status <> 'draft' then
        raise exception 'Lowongan baru hanya boleh dibuat dengan status draft (diberikan: %)', new.status;
      end if;
    elsif tg_op = 'UPDATE' then
      -- Tolak jika status lama pending, removed, atau closed
      if old.status in ('pending', 'removed', 'closed') then
        raise exception 'Lowongan dengan status % tidak dapat diubah langsung', old.status;
      end if;

      -- Tolak perubahan status kecuali open menjadi closed
      if new.status <> old.status then
        if not (old.status = 'open' and new.status = 'closed') then
          raise exception 'Perubahan status dari % menjadi % tidak diizinkan secara langsung', old.status, new.status;
        end if;
      end if;

      -- Tolak perubahan review_note, reviewed_by, reviewed_at, is_demo, company_id
      if new.review_note is distinct from old.review_note then
        raise exception 'Kolom review_note tidak boleh diubah langsung';
      end if;

      if new.reviewed_by is distinct from old.reviewed_by then
        raise exception 'Kolom reviewed_by tidak boleh diubah langsung';
      end if;

      if new.reviewed_at is distinct from old.reviewed_at then
        raise exception 'Kolom reviewed_at tidak boleh diubah langsung';
      end if;

      if new.is_demo is distinct from old.is_demo then
        raise exception 'Kolom is_demo tidak boleh diubah';
      end if;

      if new.company_id is distinct from old.company_id then
        raise exception 'Kolom company_id tidak boleh diubah';
      end if;
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists trg_jobs_guard on public.jobs;
create trigger trg_jobs_guard
before insert or update on public.jobs
for each row
execute function public.jobs_guard();

-- Mengubah status lamaran kerja dengan validasi hak akses dan alur transisi peran
create or replace function public.change_application_status(
  p_application_id bigint,
  p_to_status text,
  p_message text default null,
  p_interview_at timestamptz default null,
  p_interview_place text default null
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_app record;
  v_is_applicant boolean := false;
  v_is_company boolean := false;
  v_history_note text;
begin
  -- 1) Kunci baris lamaran dan tentukan peran pemanggil
  select * into v_app
  from public.applications
  where id = p_application_id
  for update;

  if not found then
    raise exception 'Lamaran tidak ditemukan';
  end if;

  if v_app.user_id = auth.uid() then
    v_is_applicant := true;
  elsif public.is_job_owner(v_app.job_id) then
    v_is_company := true;
  else
    raise exception 'Kamu tidak berhak mengubah lamaran ini';
  end if;

  -- 2) Status akhir tidak bisa diubah lagi
  if v_app.status in ('diterima', 'ditolak', 'ditarik') then
    raise exception 'Lamaran dengan status akhir % tidak dapat diubah lagi', v_app.status;
  end if;

  -- 3) Validasi transisi untuk pelamar
  if v_is_applicant then
    if p_to_status <> 'ditarik' then
      raise exception 'Pelamar hanya dapat mengubah status lamaran menjadi ditarik';
    end if;

  -- 4) Validasi transisi untuk mitra perusahaan
  elsif v_is_company then
    if p_to_status = 'ditolak' then
      -- Ditolak diizinkan dari status aktif apa pun (dikirim, ditinjau, shortlist, wawancara, ditawari)
      null;
    elsif v_app.status = 'dikirim' and p_to_status = 'ditinjau' then
      null;
    elsif v_app.status = 'ditinjau' and p_to_status = 'shortlist' then
      null;
    elsif v_app.status = 'shortlist' and p_to_status = 'wawancara' then
      null;
    elsif v_app.status = 'wawancara' and p_to_status = 'wawancara' then
      -- Wawancara ke wawancara diizinkan khusus untuk mengubah jadwal wawancara
      null;
    elsif v_app.status = 'wawancara' and p_to_status = 'ditawari' then
      null;
    elsif v_app.status = 'ditawari' and p_to_status = 'diterima' then
      null;
    else
      raise exception 'Status tidak bisa berubah dari % langsung ke %', v_app.status, p_to_status;
    end if;
  end if;

  -- 5) Validasi data masukan tambahan untuk status tertentu
  if p_to_status = 'ditolak' then
    if p_message is null or char_length(trim(p_message)) < 10 then
      raise exception 'Alasan penolakan wajib diisi minimal 10 karakter';
    end if;
  elsif p_to_status = 'wawancara' then
    if p_interview_at is null then
      raise exception 'Jadwal wawancara wajib diisi';
    end if;
    if p_interview_at <= now() then
      raise exception 'Jadwal wawancara harus di masa depan';
    end if;
    if p_interview_place is null or trim(p_interview_place) = '' then
      raise exception 'Lokasi atau tautan wawancara wajib diisi';
    end if;
  end if;

  -- 6) Update data lamaran
  update public.applications
  set
    status = p_to_status,
    message_to_applicant = case
      when p_message is not null then p_message
      else message_to_applicant
    end,
    interview_at = case
      when p_to_status = 'wawancara' then p_interview_at
      else interview_at
    end,
    interview_place = case
      when p_to_status = 'wawancara' then p_interview_place
      else interview_place
    end,
    decided_at = case
      when p_to_status in ('diterima', 'ditolak', 'ditarik') then now()
      else decided_at
    end
  where id = p_application_id;

  -- 7) Catat riwayat perubahan status
  if v_app.status = 'wawancara' and p_to_status = 'wawancara' then
    v_history_note := 'Jadwal wawancara diubah';
  else
    v_history_note := p_message;
  end if;

  insert into public.application_status_history (
    application_id,
    from_status,
    to_status,
    changed_by,
    note
  )
  values (
    p_application_id,
    v_app.status,
    p_to_status,
    auth.uid(),
    v_history_note
  );
end;
$$;

-- Menghitung jumlah lowongan open untuk seluruh provinsi (termasuk count 0)
create or replace function public.jobs_count_by_province()
returns table (
  province_id smallint,
  name text,
  slug text,
  job_count bigint
)
language sql
stable
security invoker
set search_path = ''
as $$
  select
    p.id as province_id,
    p.name,
    p.slug,
    count(j.id) as job_count
  from public.provinces p
  left join public.cities c on c.province_id = p.id
  left join public.jobs j on j.city_id = c.id and j.status = 'open'
  group by p.id, p.name, p.slug
  order by count(j.id) desc, p.name asc;
$$;

-- Menghitung jumlah lowongan open per kota di suatu provinsi (hanya kota dengan count >= 1)
create or replace function public.jobs_count_by_city(p_province text)
returns table (
  city_id int,
  name text,
  slug text,
  type text,
  job_count bigint
)
language sql
stable
security invoker
set search_path = ''
as $$
  select
    c.id as city_id,
    c.name,
    c.slug,
    c.type,
    count(j.id) as job_count
  from public.cities c
  join public.provinces p on p.id = c.province_id
  join public.jobs j on j.city_id = c.id and j.status = 'open'
  where p.slug = p_province
  group by c.id, c.name, c.slug, c.type
  order by count(j.id) desc, c.name asc;
$$;

-- Notifikasi dan inisialisasi screening AI saat lamaran baru masuk
create or replace function public.notify_on_application_created()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_info record;
begin
  select
    j.title as job_title,
    j.ai_screening,
    c.owner_id as company_owner_id,
    p.name as applicant_name
  into v_info
  from public.jobs j
  join public.companies c on c.id = j.company_id
  join public.profiles p on p.id = new.user_id
  where j.id = new.job_id;

  if found and v_info.company_owner_id is not null then
    -- Notifikasi lamaran_baru ke pemilik perusahaan
    insert into public.notifications (user_id, type, title, body, link)
    values (
      v_info.company_owner_id,
      'lamaran_baru',
      'Lamaran Baru Masuk',
      v_info.applicant_name || ' mengirimkan lamaran untuk posisi ' || v_info.job_title,
      '/mitra/pelamar/' || new.id::text
    );
  end if;

  -- Buat baris application_ai_reviews otomatis
  if coalesce(v_info.ai_screening, true) then
    insert into public.application_ai_reviews (application_id, status)
    values (new.id, 'pending')
    on conflict (application_id) do nothing;
  else
    insert into public.application_ai_reviews (application_id, status, error_message)
    values (new.id, 'skipped', 'Analisis AI dimatikan untuk lowongan ini')
    on conflict (application_id) do nothing;
  end if;

  return new;
end;
$$;

drop trigger if exists trg_notify_on_application_created on public.applications;
create trigger trg_notify_on_application_created
after insert on public.applications
for each row
execute function public.notify_on_application_created();

-- Notifikasi pembaruan status lamaran kepada pelamar atau perusahaan
create or replace function public.notify_on_application_status_history()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_info record;
  v_interview_time text;
begin
  select
    a.user_id as applicant_id,
    a.interview_at,
    a.interview_place,
    j.title as job_title,
    c.name as company_name,
    c.owner_id as company_owner_id,
    p.name as applicant_name
  into v_info
  from public.applications a
  join public.jobs j on j.id = a.job_id
  join public.companies c on c.id = j.company_id
  join public.profiles p on p.id = a.user_id
  where a.id = new.application_id;

  if not found then
    return new;
  end if;

  if new.to_status = 'ditarik' then
    if v_info.company_owner_id is not null then
      insert into public.notifications (user_id, type, title, body, link)
      values (
        v_info.company_owner_id,
        'lamaran_ditarik',
        'Lamaran Ditarik',
        v_info.applicant_name || ' telah menarik lamarannya untuk posisi ' || v_info.job_title,
        '/mitra/pelamar/' || new.application_id::text
      );
    end if;
  elsif new.to_status = 'wawancara' then
    v_interview_time := coalesce(
      to_char(v_info.interview_at at time zone 'Asia/Jakarta', 'DD/MM/YYYY pukul HH24:MI WIB'),
      to_char(v_info.interview_at, 'YYYY-MM-DD HH24:MI')
    );
    insert into public.notifications (user_id, type, title, body, link)
    values (
      v_info.applicant_id,
      'wawancara_dijadwalkan',
      'Jadwal Wawancara',
      'Wawancara untuk posisi ' || v_info.job_title || ' di ' || v_info.company_name || ' dijadwalkan pada ' || v_interview_time || ' di ' || coalesce(v_info.interview_place, '-'),
      '/lamaran-saya/' || new.application_id::text
    );
  else
    insert into public.notifications (user_id, type, title, body, link)
    values (
      v_info.applicant_id,
      'status_lamaran',
      'Pembaruan Status Lamaran',
      'Status lamaran Anda untuk posisi ' || v_info.job_title || ' di ' || v_info.company_name || ' telah diperbarui menjadi ' || new.to_status || '.' || case when new.note is not null and trim(new.note) <> '' then ' Catatan: ' || trim(new.note) else '' end,
      '/lamaran-saya/' || new.application_id::text
    );
  end if;

  return new;
end;
$$;

drop trigger if exists trg_notify_on_application_status_history on public.application_status_history;
create trigger trg_notify_on_application_status_history
after insert on public.application_status_history
for each row
execute function public.notify_on_application_status_history();

-- Notifikasi selesai analisis AI berkas pelamar ke pemilik perusahaan tanpa skor
create or replace function public.notify_on_ai_review_done()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_info record;
begin
  if old.status is distinct from new.status and new.status = 'done' then
    select
      j.title as job_title,
      c.owner_id as company_owner_id,
      p.name as applicant_name
    into v_info
    from public.applications a
    join public.jobs j on j.id = a.job_id
    join public.companies c on c.id = j.company_id
    join public.profiles p on p.id = a.user_id
    where a.id = new.application_id;

    if found and v_info.company_owner_id is not null then
      insert into public.notifications (user_id, type, title, body, link)
      values (
        v_info.company_owner_id,
        'analisis_selesai',
        'Analisis AI Selesai',
        'Analisis AI untuk berkas pelamar ' || v_info.applicant_name || ' pada posisi ' || v_info.job_title || ' telah selesai',
        '/mitra/pelamar/' || new.application_id::text
      );
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists trg_notify_on_ai_review_done on public.application_ai_reviews;
create trigger trg_notify_on_ai_review_done
after update of status on public.application_ai_reviews
for each row
execute function public.notify_on_ai_review_done();

-- Notifikasi alur persetujuan dan status tayang lowongan kepada admin dan mitra perusahaan
create or replace function public.notify_on_job_status_changed()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_info record;
begin
  if old.status is distinct from new.status then
    select c.name as company_name, c.owner_id as company_owner_id
    into v_info
    from public.companies c
    where c.id = new.company_id;

    -- 1) Status menjadi pending: notifikasi lowongan_diajukan ke SEMUA admin
    if new.status = 'pending' then
      insert into public.notifications (user_id, type, title, body, link)
      select
        pr.id,
        'lowongan_diajukan',
        'Pengajuan Lowongan Baru',
        'Perusahaan ' || coalesce(v_info.company_name, 'Mitra') || ' mengajukan lowongan baru: ' || new.title,
        '/admin/lowongan'
      from public.profiles pr
      where pr.role = 'admin';

    -- 2) Dari pending menjadi open: lowongan_disetujui ke pemilik perusahaan
    elsif old.status = 'pending' and new.status = 'open' then
      if v_info.company_owner_id is not null then
        insert into public.notifications (user_id, type, title, body, link)
        values (
          v_info.company_owner_id,
          'lowongan_disetujui',
          'Lowongan Disetujui',
          'Lowongan ' || new.title || ' telah disetujui dan kini tayang di JobConnect',
          '/mitra/lowongan'
        );
      end if;

    -- 3) Menjadi rejected: lowongan_ditolak ke pemilik perusahaan memuat review_note
    elsif new.status = 'rejected' then
      if v_info.company_owner_id is not null then
        insert into public.notifications (user_id, type, title, body, link)
        values (
          v_info.company_owner_id,
          'lowongan_ditolak',
          'Lowongan Belum Disetujui',
          'Pengajuan lowongan ' || new.title || ' belum disetujui.' || case when new.review_note is not null and trim(new.review_note) <> '' then ' Catatan: ' || trim(new.review_note) else '' end,
          '/mitra/lowongan'
        );
      end if;

    -- 4) Dari open menjadi removed: lowongan_takedown ke pemilik perusahaan memuat review_note
    elsif old.status = 'open' and new.status = 'removed' then
      if v_info.company_owner_id is not null then
        insert into public.notifications (user_id, type, title, body, link)
        values (
          v_info.company_owner_id,
          'lowongan_takedown',
          'Lowongan Diturunkan',
          'Lowongan ' || new.title || ' telah diturunkan oleh admin.' || case when new.review_note is not null and trim(new.review_note) <> '' then ' Catatan: ' || trim(new.review_note) else '' end,
          '/mitra/lowongan'
        );
      end if;
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists trg_notify_on_job_status_changed on public.jobs;
create trigger trg_notify_on_job_status_changed
after update of status on public.jobs
for each row
execute function public.notify_on_job_status_changed();






