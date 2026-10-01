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
