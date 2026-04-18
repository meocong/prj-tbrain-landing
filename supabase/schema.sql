-- Terminal Bench Sample Showcase — Postgres schema.
-- Namespace: tbrain_landing (kept separate from public / other projects).
-- Deploy via Supabase Studio SQL editor or:
--   psql "$DATABASE_URL" < supabase/schema.sql

create schema if not exists tbrain_landing;

-- Expose the schema to PostgREST (Supabase auto-reload picks this up).
-- If this grant fails in the SQL editor, run it as the postgres superuser.
grant usage on schema tbrain_landing to anon, authenticated, service_role;
grant all on all tables in schema tbrain_landing to service_role;
grant all on all sequences in schema tbrain_landing to service_role;
alter default privileges in schema tbrain_landing
  grant all on tables to service_role;
alter default privileges in schema tbrain_landing
  grant all on sequences to service_role;

create extension if not exists "pgcrypto";

-- Prospects / end users that receive a passcode.
create table if not exists tbrain_landing.clients (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  full_name text,
  company text,
  role text,
  team_size text,
  use_case text,
  target_use text[],
  created_at timestamptz not null default now()
);

-- A release cadence for a given data project (e.g. terminal-bench april-2026).
create table if not exists tbrain_landing.batches (
  id uuid primary key default gen_random_uuid(),
  project text not null,
  slug text not null,
  name text not null,
  description text,
  gcs_batch_zip_object text,
  created_at timestamptz not null default now(),
  unique (project, slug)
);

-- A single sample inside a batch.
create table if not exists tbrain_landing.samples (
  id uuid primary key default gen_random_uuid(),
  batch_id uuid not null references tbrain_landing.batches(id) on delete cascade,
  slug text not null,
  title text not null,
  difficulty text,
  category text,
  tags text[],
  author_name text,
  author_email text,
  expert_time_min int,
  junior_time_min int,
  spec_json jsonb,
  instruction_md text,
  tests_json jsonb,
  gcs_sample_zip_object text,
  created_at timestamptz not null default now(),
  unique (batch_id, slug)
);

-- File manifest, one row per file in each sample's tree.
create table if not exists tbrain_landing.files (
  id uuid primary key default gen_random_uuid(),
  sample_id uuid not null references tbrain_landing.samples(id) on delete cascade,
  path text not null,
  mime text,
  size_bytes int,
  gcs_object text,
  unique (sample_id, path)
);

create index if not exists files_sample_idx on tbrain_landing.files (sample_id);

-- Per-user passcode grants.
create table if not exists tbrain_landing.access_grants (
  id uuid primary key default gen_random_uuid(),
  client_id uuid references tbrain_landing.clients(id) on delete cascade,
  batch_id uuid not null references tbrain_landing.batches(id) on delete cascade,
  passcode_hash text not null,
  passcode_prefix text not null,
  issued_at timestamptz not null default now(),
  expires_at timestamptz,
  max_uses int,
  use_count int not null default 0,
  last_used_at timestamptz,
  revoked_at timestamptz,
  note text,
  unique (client_id, batch_id)
);

create index if not exists access_grants_prefix_idx
  on tbrain_landing.access_grants (batch_id, passcode_prefix)
  where revoked_at is null;

-- Shared passcodes (demo videos, walk-in demos) not tied to a specific client.
create table if not exists tbrain_landing.batch_passcodes (
  id uuid primary key default gen_random_uuid(),
  batch_id uuid not null references tbrain_landing.batches(id) on delete cascade,
  label text,
  passcode_hash text not null,
  passcode_prefix text not null,
  issued_at timestamptz not null default now(),
  expires_at timestamptz,
  revoked_at timestamptz
);

create index if not exists batch_passcodes_prefix_idx
  on tbrain_landing.batch_passcodes (batch_id, passcode_prefix)
  where revoked_at is null;

-- Access requests submitted via the request-access form.
create table if not exists tbrain_landing.access_requests (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  full_name text,
  company text,
  role text,
  team_size text,
  use_case text,
  target_use text[],
  batch_id uuid references tbrain_landing.batches(id),
  status text not null default 'pending',
  approve_token text,
  issued_passcode_last4 text,
  requested_at timestamptz not null default now(),
  reviewed_at timestamptz,
  reviewed_by text,
  review_note text
);

create index if not exists access_requests_status_idx on tbrain_landing.access_requests (status, requested_at desc);

-- Every passcode attempt, successful or not.
create table if not exists tbrain_landing.auth_attempts (
  id bigserial primary key,
  ip inet not null,
  batch_id uuid references tbrain_landing.batches(id),
  success boolean not null,
  attempted_at timestamptz not null default now(),
  meta jsonb
);

create index if not exists auth_attempts_ip_idx
  on tbrain_landing.auth_attempts (ip, batch_id, attempted_at desc);

-- Audit log of every meaningful action inside the tbrain_landing.
create table if not exists tbrain_landing.access_events (
  id bigserial primary key,
  client_id uuid references tbrain_landing.clients(id),
  grant_id uuid references tbrain_landing.access_grants(id),
  session_id text,
  batch_id uuid references tbrain_landing.batches(id),
  sample_id uuid references tbrain_landing.samples(id),
  event_type text not null,
  file_path text,
  ip inet,
  user_agent text,
  meta jsonb,
  occurred_at timestamptz not null default now()
);

create index if not exists access_events_client_idx on tbrain_landing.access_events (client_id, occurred_at desc);
create index if not exists access_events_sample_idx on tbrain_landing.access_events (sample_id, event_type, occurred_at desc);

-- RLS — deny-all. The app reads and writes through server routes with the
-- service-role key (which bypasses RLS), so this acts as a safety net.
alter table tbrain_landing.clients          enable row level security;
alter table tbrain_landing.batches          enable row level security;
alter table tbrain_landing.samples          enable row level security;
alter table tbrain_landing.files            enable row level security;
alter table tbrain_landing.access_grants    enable row level security;
alter table tbrain_landing.batch_passcodes  enable row level security;
alter table tbrain_landing.access_requests  enable row level security;
alter table tbrain_landing.auth_attempts    enable row level security;
alter table tbrain_landing.access_events    enable row level security;
