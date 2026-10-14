-- ==============================================================================
-- JobConnect: Akun Demo untuk Pengujian & Presentasi
-- Jalankan skrip ini di Supabase SQL Editor untuk membuat 3 akun siap pakai:
-- 1. Pelamar (role: user) -> Abryan Yoga Pratama (abryan.yoga@jobconnect.id)
-- 2. Mitra Perusahaan (role: company) -> PT Contoh Karya Nusantara (perusahaan.demo@jobconnect.id)
-- 3. Admin Platform (role: admin) -> Admin JobConnect (admin.demo@jobconnect.id)
--
-- Password untuk semua akun demo: Password123!
-- ==============================================================================

-- 1. Aktifkan ekstensi pgcrypto
create extension if not exists pgcrypto with schema extensions;

-- 2. Bersihkan akun demo lama jika sebelumnya ada data identitas yang belum lengkap
delete from auth.identities where user_id in (
  'b0000000-0000-0000-0000-000000000001'::uuid,
  'a0000000-0000-0000-0000-000000000001'::uuid,
  'b0000000-0000-0000-0000-000000000002'::uuid
);

delete from auth.users where id in (
  'b0000000-0000-0000-0000-000000000001'::uuid,
  'a0000000-0000-0000-0000-000000000001'::uuid,
  'b0000000-0000-0000-0000-000000000002'::uuid
) or email in (
  'abryan.yoga@jobconnect.id',
  'pelamar.demo@jobconnect.id',
  'perusahaan.demo@jobconnect.id',
  'mitra.demo@jobconnect.id',
  'admin.demo@jobconnect.id',
  'admin@jobconnect.id'
);

-- 3. Masukkan data ke auth.users
insert into auth.users (
  id,
  instance_id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  is_sso_user,
  created_at,
  updated_at,
  confirmation_token,
  recovery_token,
  email_change_token_new,
  email_change
)
values
  -- 1. Pelamar (User): Abryan Yoga Pratama
  (
    'b0000000-0000-0000-0000-000000000001'::uuid,
    '00000000-0000-0000-0000-000000000000'::uuid,
    'authenticated',
    'authenticated',
    'abryan.yoga@jobconnect.id',
    extensions.crypt('Password123!', extensions.gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"name":"Abryan Yoga Pratama","role":"user"}'::jsonb,
    false,
    now(),
    now(),
    '',
    '',
    '',
    ''
  ),
  -- 2. Mitra Perusahaan (Company): PT Contoh Karya Nusantara
  (
    'a0000000-0000-0000-0000-000000000001'::uuid,
    '00000000-0000-0000-0000-000000000000'::uuid,
    'authenticated',
    'authenticated',
    'perusahaan.demo@jobconnect.id',
    extensions.crypt('Password123!', extensions.gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"name":"PT Contoh Karya Nusantara","role":"company"}'::jsonb,
    false,
    now(),
    now(),
    '',
    '',
    '',
    ''
  ),
  -- 3. Admin Platform (Admin): Admin JobConnect
  (
    'b0000000-0000-0000-0000-000000000002'::uuid,
    '00000000-0000-0000-0000-000000000000'::uuid,
    'authenticated',
    'authenticated',
    'admin.demo@jobconnect.id',
    extensions.crypt('Password123!', extensions.gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"name":"Admin JobConnect","role":"admin"}'::jsonb,
    false,
    now(),
    now(),
    '',
    '',
    '',
    ''
  );

-- 4. Masukkan data ke auth.identities (wajib bagi GoTrue Supabase agar tidak error schema query)
do $$
declare
  v_has_provider_id boolean;
begin
  select exists (
    select 1 from information_schema.columns
    where table_schema = 'auth' and table_name = 'identities' and column_name = 'provider_id'
  ) into v_has_provider_id;

  if v_has_provider_id then
    execute $sql$
      insert into auth.identities (
        id,
        user_id,
        identity_data,
        provider,
        provider_id,
        last_sign_in_at,
        created_at,
        updated_at
      )
      values
        (
          'b0000000-0000-0000-0000-000000000001',
          'b0000000-0000-0000-0000-000000000001'::uuid,
          '{"sub":"b0000000-0000-0000-0000-000000000001","email":"abryan.yoga@jobconnect.id"}'::jsonb,
          'email',
          'abryan.yoga@jobconnect.id',
          now(),
          now(),
          now()
        ),
        (
          'a0000000-0000-0000-0000-000000000001',
          'a0000000-0000-0000-0000-000000000001'::uuid,
          '{"sub":"a0000000-0000-0000-0000-000000000001","email":"perusahaan.demo@jobconnect.id"}'::jsonb,
          'email',
          'perusahaan.demo@jobconnect.id',
          now(),
          now(),
          now()
        ),
        (
          'b0000000-0000-0000-0000-000000000002',
          'b0000000-0000-0000-0000-000000000002'::uuid,
          '{"sub":"b0000000-0000-0000-0000-000000000002","email":"admin.demo@jobconnect.id"}'::jsonb,
          'email',
          'admin.demo@jobconnect.id',
          now(),
          now(),
          now()
        )
      on conflict do nothing;
    $sql$;
  else
    execute $sql$
      insert into auth.identities (
        id,
        user_id,
        identity_data,
        provider,
        last_sign_in_at,
        created_at,
        updated_at
      )
      values
        (
          'b0000000-0000-0000-0000-000000000001',
          'b0000000-0000-0000-0000-000000000001'::uuid,
          '{"sub":"b0000000-0000-0000-0000-000000000001","email":"abryan.yoga@jobconnect.id"}'::jsonb,
          'email',
          now(),
          now(),
          now()
        ),
        (
          'a0000000-0000-0000-0000-000000000001',
          'a0000000-0000-0000-0000-000000000001'::uuid,
          '{"sub":"a0000000-0000-0000-0000-000000000001","email":"perusahaan.demo@jobconnect.id"}'::jsonb,
          'email',
          now(),
          now(),
          now()
        ),
        (
          'b0000000-0000-0000-0000-000000000002',
          'b0000000-0000-0000-0000-000000000002'::uuid,
          '{"sub":"b0000000-0000-0000-0000-000000000002","email":"admin.demo@jobconnect.id"}'::jsonb,
          'email',
          now(),
          now(),
          now()
        )
      on conflict do nothing;
    $sql$;
  end if;
end $$;

-- 5. Sinkronkan profil pengguna di public.profiles
insert into public.profiles (id, email, name, role, phone, headline)
values
  (
    'b0000000-0000-0000-0000-000000000001'::uuid,
    'abryan.yoga@jobconnect.id',
    'Abryan Yoga Pratama',
    'user',
    '081234567890',
    'Software Developer | Rekayasa Perangkat Lunak'
  ),
  (
    'a0000000-0000-0000-0000-000000000001'::uuid,
    'perusahaan.demo@jobconnect.id',
    'PT Contoh Karya Nusantara',
    'company',
    '0215550101',
    'Perusahaan Teknologi & Solusi Digital Terverifikasi'
  ),
  (
    'b0000000-0000-0000-0000-000000000002'::uuid,
    'admin.demo@jobconnect.id',
    'Admin JobConnect',
    'admin',
    '081100001111',
    'Moderator & Administrator Platform JobConnect'
  )
on conflict (id) do update set
  email = excluded.email,
  name = excluded.name,
  role = excluded.role,
  phone = coalesce(excluded.phone, public.profiles.phone),
  headline = coalesce(excluded.headline, public.profiles.headline);

-- 6. Pastikan perusahaan PT Contoh Karya Nusantara dimiliki oleh akun perusahaan ini
update public.companies
set owner_id = 'a0000000-0000-0000-0000-000000000001'::uuid
where slug = 'contoh-karya-nusantara';
