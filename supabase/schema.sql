-- ADVSR Content Engine — Phase 1 prototype schema.
-- Run this once in the Supabase SQL editor (or via `supabase db push`) for a
-- new project. See build spec, "Data storage: Supabase".

create table if not exists waitlist_submissions (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  company text,
  market text,
  expected_price text,
  has_advsr_login boolean not null default false,
  tone_profile jsonb not null default '{}'::jsonb,
  generated_output text,
  created_at timestamptz not null default now()
);

create index if not exists waitlist_submissions_created_at_idx
  on waitlist_submissions (created_at desc);

-- Row Level Security: all writes/reads for this table go through the
-- Netlify function using the service role key, which bypasses RLS. Enabling
-- RLS with no policies blocks the anon/public key from touching this table
-- directly, which is what we want since the browser never talks to Supabase
-- itself.
alter table waitlist_submissions enable row level security;
