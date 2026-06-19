create extension if not exists pgcrypto;

create table if not exists public.photos (
  id uuid primary key default gen_random_uuid(),
  date_code text not null check (date_code ~ '^[0-9]{6}$'),
  photo_date date not null,
  post_text text not null default '',
  caption text not null default '',
  post_url text,
  original_url text,
  cached_url text,
  local_path text,
  storage_path text,
  source text not null default 'x',
  source_key text not null,
  sort_index integer not null default 1,
  created_at timestamptz not null default now(),
  unique (date_code, sort_index, source_key)
);

alter table public.photos enable row level security;

drop policy if exists "Allow public photo reads" on public.photos;
create policy "Allow public photo reads"
on public.photos for select
using (true);

create index if not exists photos_photo_date_idx on public.photos (photo_date);
create index if not exists photos_date_code_idx on public.photos (date_code);
