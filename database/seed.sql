-- Berkas data awal (seed) referensi kategori pekerjaan JobConnect
-- Dijalankan setelah schema.sql, functions.sql, dan policies.sql

insert into public.categories (name, slug)
values
  ('Teknologi Informasi', 'teknologi-informasi'),
  ('Administrasi dan Perkantoran', 'administrasi-dan-perkantoran'),
  ('Penjualan dan Pemasaran', 'penjualan-dan-pemasaran'),
  ('Keuangan dan Akuntansi', 'keuangan-dan-akuntansi'),
  ('Layanan Pelanggan', 'layanan-pelanggan'),
  ('Desain dan Kreatif', 'desain-dan-kreatif'),
  ('Pendidikan dan Pelatihan', 'pendidikan-dan-pelatihan'),
  ('Kesehatan', 'kesehatan'),
  ('Manufaktur dan Produksi', 'manufaktur-dan-produksi'),
  ('Logistik dan Transportasi', 'logistik-dan-transportasi'),
  ('Perhotelan dan Kuliner', 'perhotelan-dan-kuliner'),
  ('Teknik dan Konstruksi', 'teknik-dan-konstruksi')
on conflict (slug) do nothing;
