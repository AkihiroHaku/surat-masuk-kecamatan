create extension if not exists "pgcrypto";

create table if not exists public.users (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  username text not null unique,
  email text not null unique,
  password_hash text not null,
  role text not null check (role in ('admin', 'sekcam', 'camat')),
  created_at timestamptz not null default now()
);

create table if not exists public.surat_masuk (
  id uuid primary key default gen_random_uuid(),
  nomor_agenda text not null unique,
  nomor_surat text not null,
  tanggal_surat date not null,
  tanggal_diterima date not null,
  pengirim text not null,
  instansi_pengirim text not null,
  perihal text not null,
  kategori text not null check (kategori in ('Undangan', 'Permohonan', 'Pemberitahuan', 'Dinas', 'Internal')),
  prioritas text not null check (prioritas in ('Normal', 'Penting', 'Sangat Penting')),
  status text not null check (status in ('Baru', 'Diproses', 'Selesai')),
  ringkasan_ai text not null,
  rekomendasi_ai text not null,
  disposisi text not null,
  file_url text not null,
  file_name text not null,
  ocr_text text not null default '',
  created_by uuid references public.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.tindak_lanjut_logs (
  id uuid primary key default gen_random_uuid(),
  surat_id uuid not null references public.surat_masuk(id) on delete cascade,
  from_user text not null,
  to_user text not null,
  note text not null,
  status text not null check (status in ('Baru', 'Diproses', 'Selesai')),
  created_at timestamptz not null default now()
);

create index if not exists idx_surat_masuk_nomor_surat on public.surat_masuk (nomor_surat);
create index if not exists idx_surat_masuk_pengirim on public.surat_masuk (pengirim);
create index if not exists idx_surat_masuk_status on public.surat_masuk (status);
create index if not exists idx_surat_masuk_tanggal_diterima on public.surat_masuk (tanggal_diterima);
