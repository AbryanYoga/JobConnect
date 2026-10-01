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

-- ==============================================================================
-- DATA CONTOH: hanya untuk pengembangan dan demo. Jangan dijalankan di produksi sungguhan.
-- Wajib dijalankan SETELAH seed_wilayah.sql dan bagian kategori di atas.
-- ==============================================================================

-- 1. Tiga akun perusahaan contoh di auth.users (idempoten dan aman)
-- Akun dibuat tanpa kata sandi terenkripsi sehingga tidak dapat dipakai login langsung.
insert into auth.users (
  id,
  instance_id,
  aud,
  role,
  email,
  raw_app_meta_data,
  raw_user_meta_data,
  email_confirmed_at,
  created_at,
  updated_at
)
select
  v.id,
  '00000000-0000-0000-0000-000000000000'::uuid,
  'authenticated',
  'authenticated',
  v.email,
  '{"provider":"email","providers":["email"]}'::jsonb,
  v.meta,
  now(),
  now(),
  now()
from (
  values
    (
      'a0000000-0000-0000-0000-000000000001'::uuid,
      'mitra.karya@contoh.invalid',
      '{"name":"PT Contoh Karya Nusantara","role":"company"}'::jsonb
    ),
    (
      'a0000000-0000-0000-0000-000000000002'::uuid,
      'mitra.solusi@contoh.invalid',
      '{"name":"PT Contoh Solusi Teknologi","role":"company"}'::jsonb
    ),
    (
      'a0000000-0000-0000-0000-000000000003'::uuid,
      'mitra.logistik@contoh.invalid',
      '{"name":"PT Contoh Logistik Mandiri","role":"company"}'::jsonb
    )
) as v(id, email, meta)
where not exists (
  select 1 from auth.users u where u.id = v.id or u.email = v.email
);

-- Profil perusahaan otomatis dibuat oleh trigger on_auth_user_created.
-- Pernyataan berikut memastikan profil tetap ada bila trigger belum aktif saat seed dijalankan.
insert into public.profiles (id, email, name, role)
select
  u.id,
  u.email,
  u.raw_user_meta_data->>'name',
  'company'
from auth.users u
where u.id in (
  'a0000000-0000-0000-0000-000000000001'::uuid,
  'a0000000-0000-0000-0000-000000000002'::uuid,
  'a0000000-0000-0000-0000-000000000003'::uuid
)
on conflict (id) do nothing;

-- 2. Tiga data profil perusahaan mitra contoh
insert into public.companies (
  owner_id,
  name,
  slug,
  industry,
  size,
  website,
  city_id,
  address_note,
  description
)
values
  (
    'a0000000-0000-0000-0000-000000000001'::uuid,
    'PT Contoh Karya Nusantara (Data Contoh)',
    'contoh-karya-nusantara',
    'Manufaktur dan Rekayasa',
    '51-200',
    'https://karya.contoh.invalid',
    (select c.id from public.cities c join public.provinces p on p.id = c.province_id where p.slug = 'jawa-tengah' and c.slug = 'kota-surakarta'),
    'Kawasan Industri Slamet Riyadi No. 10 (Data Contoh)',
    'PT Contoh Karya Nusantara adalah profil perusahaan fiktif yang digunakan khusus untuk keperluan demonstrasi dan pengujian sistem JobConnect. Perusahaan ini bergerak di bidang manufaktur presisi dan perakitan komponen mekanik.'
  ),
  (
    'a0000000-0000-0000-0000-000000000002'::uuid,
    'PT Contoh Solusi Teknologi (Data Contoh)',
    'contoh-solusi-teknologi',
    'Teknologi Informasi',
    '11-50',
    'https://solusi.contoh.invalid',
    (select c.id from public.cities c join public.provinces p on p.id = c.province_id where p.slug = 'dki-jakarta' and c.slug = 'kota-jakarta-pusat'),
    'Jalan Thamrin Gedung Contoh Lt. 5 (Data Contoh)',
    'PT Contoh Solusi Teknologi adalah data perusahaan percontohan pada aplikasi JobConnect. Berfokus pada pengembangan perangkat lunak berbasis web dan solusi digital untuk kebutuhan operasional bisnis.'
  ),
  (
    'a0000000-0000-0000-0000-000000000003'::uuid,
    'PT Contoh Logistik Mandiri (Data Contoh)',
    'contoh-logistik-mandiri',
    'Logistik dan Transportasi',
    '201-500',
    'https://logistik.contoh.invalid',
    (select c.id from public.cities c join public.provinces p on p.id = c.province_id where p.slug = 'jawa-tengah' and c.slug = 'kota-semarang'),
    'Kawasan Pelabuhan Tanjung Emas Blok C (Data Contoh)',
    'PT Contoh Logistik Mandiri adalah data rekaan untuk mendemonstrasikan sistem JobConnect. Mengelola pergudangan terpadu dan armada distribusi logistik antar kota di pulau Jawa.'
  )
on conflict (slug) do nothing;

-- 3. Sepuluh lowongan contoh dengan label is_demo = true

insert into public.jobs (
  company_id,
  category_id,
  city_id,
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
  is_demo
)
values (
  (select id from public.companies where slug = 'contoh-karya-nusantara'),
  (select id from public.categories where slug = 'teknik-dan-konstruksi'),
  (select c.id from public.cities c join public.provinces p on p.id = c.province_id where p.slug = 'jawa-tengah' and c.slug = 'kota-surakarta'),
  'Operator Mesin Bubut CNC (Data Contoh)',
  'contoh-operator-mesin-bubut-cnc',
  'onsite',
  'kontrak',
  'sma_smk',
  1,
  array['Operasional Mesin CNC', 'Membaca Gambar Teknik', 'Pengukuran Jangka Sorong', 'K3 Bengkel']::text[],
  'Dibutuhkan operator mesin bubut CNC untuk memproduksi komponen presisi logam sesuai dengan gambar kerja teknik serta standar keselamatan kerja industri.',
  array['Mengoperasikan mesin bubut CNC sesuai perintah kerja harian', 'Memeriksa dimensi produk menggunakan alat ukur presisi', 'Melakukan perawatan rutin ringan pada mesin dan area kerja', 'Melaporkan hasil produksi dan kendala mesin kepada supervisor']::text[],
  array['Pengalaman kerja di bengkel permesinan minimal 1 tahun', 'Memiliki sertifikat kompetensi keahlian teknik permesinan']::text[],
  array['BPJS Ketenagakerjaan dan Kesehatan', 'Uang makan harian', 'Tunjangan shift kerja']::text[],
  3200000,
  4500000,
  current_date + interval '60 days',
  'open',
  true
)
on conflict (slug) do nothing;

insert into public.jobs (
  company_id,
  category_id,
  city_id,
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
  is_demo
)
values (
  (select id from public.companies where slug = 'contoh-karya-nusantara'),
  (select id from public.categories where slug = 'teknik-dan-konstruksi'),
  (select c.id from public.cities c join public.provinces p on p.id = c.province_id where p.slug = 'jawa-tengah' and c.slug = 'kota-surakarta'),
  'Teknisi Pemeliharaan Listrik (Data Contoh)',
  'contoh-teknisi-pemeliharaan-listrik',
  'onsite',
  'full_time',
  'sma_smk',
  1,
  array['Instalasi Listrik Industri', 'Panel Listrik 3 Fasa', 'Troubleshooting Motor', 'Membaca Wiring Diagram']::text[],
  'Bertanggung jawab dalam merawat instalasi kelistrikan pabrik dan memastikan seluruh mesin produksi beroperasi tanpa gangguan teknis kelistrikan yang berarti.',
  array['Melakukan pemeriksaan rutin panel listrik dan mesin industri', 'Menangani kendala kelistrikan pada lini perakitan pabrik', 'Membuat catatan berkala riwayat pemeliharaan komponen listrik', 'Menerapkan prosedur keselamatan kerja kelistrikan dengan ketat']::text[],
  array['Lulusan SMK jurusan Teknik Otomasi atau Listrik Industri', 'Memahami dasar Programmable Logic Controller']::text[],
  array['BPJS Ketenagakerjaan dan Kesehatan', 'Seragam dan perlengkapan safety', 'Insentif kehadiran bulanan']::text[],
  3500000,
  4800000,
  current_date + interval '60 days',
  'open',
  true
)
on conflict (slug) do nothing;

insert into public.jobs (
  company_id,
  category_id,
  city_id,
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
  is_demo
)
values (
  (select id from public.companies where slug = 'contoh-solusi-teknologi'),
  (select id from public.categories where slug = 'teknologi-informasi'),
  (select c.id from public.cities c join public.provinces p on p.id = c.province_id where p.slug = 'dki-jakarta' and c.slug = 'kota-jakarta-pusat'),
  'Frontend Web Developer (Data Contoh)',
  'contoh-frontend-web-developer',
  'hybrid',
  'full_time',
  'd3',
  2,
  array['React.js', 'Next.js', 'TypeScript', 'Tailwind CSS', 'Git Workflow']::text[],
  'Membangun antarmuka web interaktif dan responsif menggunakan Next.js dan Tailwind CSS yang terhubung langsung dengan REST API untuk aplikasi layanan pelanggan.',
  array['Menerjemahkan desain dari Figma menjadi kode web yang efisien', 'Mengintegrasikan antarmuka dengan layanan API backend', 'Memastikan performa dan aksesibilitas web di berbagai peramban', 'Berkolaborasi dengan tim backend dalam penentuan kontrak API']::text[],
  array['Familiar dengan State Management seperti Zustand atau Redux', 'Pernah membangun aplikasi dengan konsep Server Components']::text[],
  array['Jadwal kerja fleksibel hybrid', 'BPJS Kesehatan dan Ketenagakerjaan', 'Tunjangan perangkat kerja', 'Bonus akhir tahun']::text[],
  7000000,
  11000000,
  current_date + interval '60 days',
  'open',
  true
)
on conflict (slug) do nothing;

insert into public.jobs (
  company_id,
  category_id,
  city_id,
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
  is_demo
)
values (
  (select id from public.companies where slug = 'contoh-solusi-teknologi'),
  (select id from public.categories where slug = 'teknologi-informasi'),
  null,
  'Backend Golang Developer (Data Contoh)',
  'contoh-backend-golang-developer',
  'remote',
  'full_time',
  'tanpa_syarat',
  2,
  array['Golang', 'PostgreSQL', 'Docker', 'RESTful API', 'Redis Cache']::text[],
  'Mengembangkan layanan backend berskala tinggi menggunakan bahasa pemrograman Go dengan basis data PostgreSQL untuk mendukung platform pemrosesan data secara realtime.',
  array['Menulis kode layanan backend yang bersih teruji dan aman', 'Merancang skema database relasional dan optimasi kueri kompleks', 'Mengelola deployment container aplikasi menggunakan Docker', 'Melakukan tinjauan kode sesama rekan pengembang perangkat lunak']::text[],
  array['Pengalaman menggunakan message broker RabbitMQ atau Kafka', 'Memahami konsep arsitektur microservices dan gRPC']::text[],
  array['Kerja jarak jauh sepenuhnya', 'Tunjangan internet bulanan', 'Cuti tahunan 15 hari']::text[],
  9000000,
  14000000,
  current_date + interval '60 days',
  'open',
  true
)
on conflict (slug) do nothing;

insert into public.jobs (
  company_id,
  category_id,
  city_id,
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
  is_demo
)
values (
  (select id from public.companies where slug = 'contoh-solusi-teknologi'),
  (select id from public.categories where slug = 'desain-dan-kreatif'),
  null,
  'Desainer Grafis Media Sosial (Data Contoh)',
  'contoh-desainer-grafis-media-sosial',
  'remote',
  'freelance',
  'sma_smk',
  0,
  array['Figma Design', 'Adobe Photoshop', 'Adobe Illustrator', 'Tata Letak Tipografi']::text[],
  'Merancang konten visual kreatif dan aset grafis promosi untuk kanal media sosial resmi guna meningkatkan keterlibatan dan daya tarik komunikasi visual audiens.',
  array['Membuat materi grafis untuk posting media sosial berkala', 'Menyelaraskan gaya visual desain dengan pedoman identitas merek', 'Menyesuaikan format materi desain untuk berbagai resolusi layar']::text[],
  array['Menyertakan portofolio desain visual aktif yang relevan', 'Kemampuan dasar membuat motion graphic atau animasi pendek']::text[],
  array['Waktu kerja mandiri dan fleksibel', 'Honorarium berbasis proyek yang jelas']::text[],
  null,
  null,
  current_date + interval '60 days',
  'open',
  true
)
on conflict (slug) do nothing;

insert into public.jobs (
  company_id,
  category_id,
  city_id,
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
  is_demo
)
values (
  (select id from public.companies where slug = 'contoh-logistik-mandiri'),
  (select id from public.categories where slug = 'logistik-dan-transportasi'),
  (select c.id from public.cities c join public.provinces p on p.id = c.province_id where p.slug = 'jawa-tengah' and c.slug = 'kota-semarang'),
  'Koordinator Gudang Logistik (Data Contoh)',
  'contoh-koordinator-gudang-logistik',
  'onsite',
  'full_time',
  'sma_smk',
  2,
  array['Manajemen Pergudangan', 'Pencatatan Stok Opname', 'Operasional Forklift', 'Sistem Manajemen Gudang']::text[],
  'Mengawasi alur keluar masuk barang di gudang utama pelabuhan serta memimpin tim staf pergudangan agar stok barang tercatat rapi dan pengiriman berjalan tepat waktu.',
  array['Memeriksa kesesuaian surat jalan dengan muatan fisik barang', 'Mengatur penempatan stok produk di rak penyimpanan gudang', 'Mengkoordinasikan tim bongkar muat kontainer barang logistik', 'Membuat laporan mutasi barang berkala kepada manajer operasional']::text[],
  array['Memiliki surat izin operasi forklift yang masih berlaku', 'Berpengalaman memimpin tim pergudangan minimal 5 orang']::text[],
  array['BPJS Kesehatan dan Ketenagakerjaan', 'Uang lembur terstruktur', 'Makan siang disediakan']::text[],
  4000000,
  5500000,
  current_date + interval '60 days',
  'open',
  true
)
on conflict (slug) do nothing;

insert into public.jobs (
  company_id,
  category_id,
  city_id,
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
  is_demo
)
values (
  (select id from public.companies where slug = 'contoh-logistik-mandiri'),
  (select id from public.categories where slug = 'administrasi-dan-perkantoran'),
  (select c.id from public.cities c join public.provinces p on p.id = c.province_id where p.slug = 'jawa-tengah' and c.slug = 'kota-semarang'),
  'Staf Administrasi Ekspedisi (Data Contoh)',
  'contoh-staf-administrasi-ekspedisi',
  'onsite',
  'kontrak',
  'sma_smk',
  0,
  array['Microsoft Excel', 'Entri Data Cepat', 'Arsip Dokumen', 'Komunikasi Telepon']::text[],
  'Membantu rekapitulasi data pengiriman harian dan pembuatan dokumen surat jalan muatan barang agar arsip operasional pengiriman tersusun rapi serta bebas selisih.',
  array['Memasukkan data manifes pengiriman barang ke sistem internal', 'Menyiapkan berkas surat jalan sebelum armada logistik berangkat', 'Mengarsipkan bukti penerimaan barang dari pelanggan secara runtut']::text[],
  array['Lulusan SMK jurusan Administrasi Perkantoran atau Akuntansi', 'Mampu mengetik cepat dengan akurasi data yang tinggi']::text[],
  array['BPJS Ketenagakerjaan', 'Tunjangan kehadiran kerja bulanan']::text[],
  3000000,
  3800000,
  current_date + interval '60 days',
  'open',
  true
)
on conflict (slug) do nothing;

insert into public.jobs (
  company_id,
  category_id,
  city_id,
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
  is_demo
)
values (
  (select id from public.companies where slug = 'contoh-solusi-teknologi'),
  (select id from public.categories where slug = 'layanan-pelanggan'),
  (select c.id from public.cities c join public.provinces p on p.id = c.province_id where p.slug = 'jawa-tengah' and c.slug = 'kota-surakarta'),
  'Magang Layanan Pelanggan (Data Contoh)',
  'contoh-magang-layanan-pelanggan',
  'hybrid',
  'magang',
  'sma_smk',
  0,
  array['Komunikasi Pelanggan', 'Etika Layanan Chat', 'Pemecahan Masalah Dasar', 'Pencatatan Tiket Bantuan']::text[],
  'Mendampingi pelanggan dalam menggunakan fitur aplikasi serta mencatat kendala teknis pengguna untuk diteruskan kepada tim dukungan perbaikan sistem perangkat lunak.',
  array['Menjawab pertanyaan pengguna melalui kanal obrolan bantuan', 'Mencatat tiket laporan kendala pengguna dengan rincian jelas', 'Membantu penyusunan panduan tanya jawab kendala umum pengguna']::text[],
  array['Kemampuan komunikasi lisan dan tulisan yang ramah dan lugas', 'Terbiasa mengoperasikan aplikasi berbasis web dan ponsel']::text[],
  array['Uang saku magang bulanan', 'Sertifikat resmi selesai magang', 'Bimbingan mentor profesional']::text[],
  1500000,
  2000000,
  current_date + interval '60 days',
  'open',
  true
)
on conflict (slug) do nothing;

insert into public.jobs (
  company_id,
  category_id,
  city_id,
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
  is_demo
)
values (
  (select id from public.companies where slug = 'contoh-karya-nusantara'),
  (select id from public.categories where slug = 'penjualan-dan-pemasaran'),
  (select c.id from public.cities c join public.provinces p on p.id = c.province_id where p.slug = 'dki-jakarta' and c.slug = 'kota-jakarta-pusat'),
  'Sales B2B Industri Logam (Data Contoh)',
  'contoh-sales-b2b-industri-logam',
  'onsite',
  'full_time',
  'd3',
  1,
  array['Negosiasi Bisnis B2B', 'Presentasi Produk', 'Riset Klien Potensial', 'Manajemen Hubungan Klien']::text[],
  'Mencari dan membina hubungan kemitraan dengan pabrik serta kontraktor yang membutuhkan pasokan komponen logam presisi dan suku cadang mesin industri secara rutin.',
  array['Menghubungi calon mitra industri dan menjadwalkan kunjungan kerja', 'Menjelaskan spesifikasi teknis produk logam hasil produksi bengkel', 'Menyusun proposal penawaran harga sesuai kebutuhan proyek mitra', 'Menjaga hubungan baik jangka panjang dengan mitra bisnis lama']::text[],
  array['Memiliki kendaraan pribadi dan SIM yang masih aktif', 'Pernah bekerja di bidang penjualan peralatan teknik mesin']::text[],
  array['Gaji pokok dan komisi penjualan', 'BPJS Ketenagakerjaan dan Kesehatan', 'Tunjangan bahan bakar operasional', 'Bonus target kuartalan']::text[],
  5000000,
  8000000,
  current_date + interval '60 days',
  'open',
  true
)
on conflict (slug) do nothing;

insert into public.jobs (
  company_id,
  category_id,
  city_id,
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
  is_demo
)
values (
  (select id from public.companies where slug = 'contoh-solusi-teknologi'),
  (select id from public.categories where slug = 'keuangan-dan-akuntansi'),
  (select c.id from public.cities c join public.provinces p on p.id = c.province_id where p.slug = 'jawa-barat' and c.slug = 'kota-bandung'),
  'Staf Akuntansi dan Pajak (Data Contoh)',
  'contoh-staf-akuntansi-dan-pajak',
  'onsite',
  'full_time',
  's1',
  1,
  array['Pencatatan Jurnal Akuntansi', 'Rekonsiliasi Bank', 'Perpajakan PPh dan PPN', 'Laporan Keuangan Dasar']::text[],
  'Menyusun laporan keuangan bulanan mencatat transaksi arus kas dan memastikan pelaporan perpajakan perusahaan dilakukan tepat waktu sesuai regulasi yang berlaku.',
  array['Membuat jurnal harian pemasukan dan pengeluaran operasional', 'Melakukan rekonsiliasi berkala rekening koran dengan buku kas', 'Menyiapkan berkas faktur pajak dan bukti potong transaksi', 'Membantu penyusunan neraca dan laporan laba rugi bulanan']::text[],
  array['Memiliki sertifikat brevet pajak A dan B', 'Terbiasa menggunakan software akuntansi berbasis cloud']::text[],
  array['BPJS Kesehatan dan Ketenagakerjaan', 'Tunjangan makan siang', 'Tunjangan hari raya']::text[],
  null,
  null,
  current_date + interval '60 days',
  'open',
  true
)
on conflict (slug) do nothing;
