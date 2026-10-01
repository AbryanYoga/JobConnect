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
