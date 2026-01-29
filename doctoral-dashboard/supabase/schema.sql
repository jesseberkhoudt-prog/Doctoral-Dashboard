-- Doctoral Dashboard schema (Postgres / Supabase)

-- Pages: each dashboard section stores TipTap JSON
create table if not exists public.pages (
  id uuid primary key default gen_random_uuid(),
  key text unique not null,
  title text not null,
  content_json jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create index if not exists pages_key_idx on public.pages (key);

-- Tags: lens + custom
create table if not exists public.tags (
  id uuid primary key default gen_random_uuid(),
  label text not null unique,
  kind text not null check (kind in ('lens','custom'))
);

-- Join: page ↔ tags
create table if not exists public.page_tags (
  page_id uuid references public.pages(id) on delete cascade,
  tag_id uuid references public.tags(id) on delete cascade,
  primary key (page_id, tag_id)
);

-- Versions: manual snapshots (restore UI can be added next)
create table if not exists public.page_versions (
  id uuid primary key default gen_random_uuid(),
  page_id uuid references public.pages(id) on delete cascade,
  label text not null,
  content_json jsonb not null,
  created_at timestamptz not null default now()
);

-- Seed default lens tags (Mega/Macro/Micro)
insert into public.tags (label, kind) values
  ('MEGA', 'lens'),
  ('MACRO', 'lens'),
  ('MICRO', 'lens')
on conflict (label) do nothing;

-- RLS (Row Level Security)
alter table public.pages enable row level security;
alter table public.tags enable row level security;
alter table public.page_tags enable row level security;
alter table public.page_versions enable row level security;

-- Policies: authenticated users can do everything (MVP).
-- Later: restrict admin-only, add viewer links, etc.
create policy "pages_all_authed" on public.pages
  for all to authenticated
  using (true) with check (true);

create policy "tags_all_authed" on public.tags
  for all to authenticated
  using (true) with check (true);

create policy "page_tags_all_authed" on public.page_tags
  for all to authenticated
  using (true) with check (true);

create policy "versions_all_authed" on public.page_versions
  for all to authenticated
  using (true) with check (true);
