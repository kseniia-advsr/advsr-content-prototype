-- ADVSR Content Engine — Phase 1 prototype schema.
-- Run this once in the Supabase SQL editor (or via `supabase db push`) for a
-- new project. See build spec, "Data storage: Supabase".

create table if not exists waitlist_submissions (
  id uuid primary key default gen_random_uuid(),
  -- Nullable: a row for this session can exist long before name/email are
  -- known (see session_id below) — they're filled in later when the real
  -- waitlist form is submitted.
  name text,
  email text,
  company text,
  market text,
  expected_price text,
  missing_feedback text,
  has_advsr_login boolean not null default false,
  tone_profile jsonb not null default '{}'::jsonb,
  generated_output text,
  created_at timestamptz not null default now(),

  -- Client-generated identifier created once per browser session, present
  -- from the very first "early profile capture" write (tone-of-voice +
  -- funnel answers, before contact info is known) through every later
  -- incremental write (clarifying Q&A, generated output, thumbs feedback)
  -- and the final waitlist form submission. Every write after the first is
  -- an upsert keyed on this column so the whole funnel accumulates onto one
  -- row instead of creating duplicates.
  session_id text unique,

  -- All 58 tone-of-voice questionnaire answers below are a queryable
  -- projection of the same responses object stored whole in tone_profile
  -- above — they let you query/aggregate a single answer directly instead of
  -- unpacking JSON. tone_profile remains the source of truth / full raw
  -- backup. Grouped here by the questionnaire's own section order (see
  -- toneProfile.ts); the mapping itself lives in toneColumns.ts.

  -- Communication style
  style text[],
  formality text,
  directness text,
  personality_level text,

  -- Client experience
  client_feeling text[],
  qualities_always text[],
  qualities_avoid text[],

  -- Advisor archetype
  archetype text,
  build_trust text[],
  greatest_strength text[],

  -- Negotiation & commercial style
  negotiation_style text,
  commercial_level text,
  opportunity_presentation text,

  -- Expertise & authority
  known_for text[],
  location text[],
  content_focus text[],

  -- Visibility & personal brand (`visibility` maps to `visibility_level`
  -- since `visibility` collides with the reserved-ish row-visibility naming
  -- this table already uses)
  platforms text[],
  visibility_level text,
  content_comfort text[],
  risk_appetite text,

  -- Communication channels: a rating (1-5) per channel, stored as the same
  -- {channel: rating} shape it's answered in rather than flattened.
  channel_personality jsonb,

  -- Brand positioning
  brand_affinities text[],
  brand_words text[],

  -- Language preferences
  english_variant text,
  term_advisor text,
  term_property text,
  term_client text,
  term_opportunity text,
  term_sale text,
  term_buyer text,
  term_vendor text,
  term_market text,
  term_network text,
  len_email text,
  len_social text,
  len_market text,
  len_property text,

  -- Communication guardrails
  never text[],

  -- AI support
  ai_help text[],

  -- Ideal client profile
  ideal_clients text[],

  -- Personal & family
  share_personal text,
  personal_ok text,
  personal_offlimits text,
  personal_interests text,

  -- Trust profile: five 1-10 self-ratings
  trust integer,
  likeability integer,
  respect integer,
  discretion integer,
  reliability integer,

  -- Real world examples
  example_email text,
  example_whatsapp text,
  example_linkedin text,
  example_proposal text,
  example_market text,
  example_property text,
  example_presentation text,

  -- Anything else
  display_name text,
  extra_context text,

  -- Posting-frequency belief flip: what the visitor thought before seeing
  -- the daily-posting interstitial, what they said after, and whether that
  -- counts as a change of mind.
  posting_frequency_before text,
  posting_frequency_after text,
  changed_mind_on_frequency boolean,

  -- Platform belief flip: which single platform the visitor believed was
  -- best, before seeing the LinkedIn/Instagram insight. Their actual
  -- platform choice afterward is stored in the existing `platforms` column
  -- above, not a separate one.
  platform_belief_before text,

  -- The insights funnel's "what does an hour of marketing cost you?" slider
  -- answer, in whole dollars (the range is 20-300, step 5).
  estimated_hourly_rate integer,

  -- The clarifying question(s) asked before generation and the visitor's
  -- answers, as [{question, answer}, ...]. Kept separate from tone_profile
  -- since it's per-generation context, not a tone-of-voice answer.
  clarifying_qa jsonb,

  -- Thumbs up/down on the generated content: exactly 'GOOD' or 'BAD',
  -- validated app-side (see captureHandler.ts).
  content_feedback text
);

-- Idempotent for existing databases that already have the base table from an
-- earlier version of this schema (matches the columns added manually here).
alter table waitlist_submissions alter column name drop not null;
alter table waitlist_submissions alter column email drop not null;
alter table waitlist_submissions add column if not exists session_id text unique;
alter table waitlist_submissions add column if not exists style text[];
alter table waitlist_submissions add column if not exists formality text;
alter table waitlist_submissions add column if not exists directness text;
alter table waitlist_submissions add column if not exists personality_level text;
alter table waitlist_submissions add column if not exists client_feeling text[];
alter table waitlist_submissions add column if not exists qualities_always text[];
alter table waitlist_submissions add column if not exists qualities_avoid text[];
alter table waitlist_submissions add column if not exists archetype text;
alter table waitlist_submissions add column if not exists build_trust text[];
alter table waitlist_submissions add column if not exists greatest_strength text[];
alter table waitlist_submissions add column if not exists negotiation_style text;
alter table waitlist_submissions add column if not exists commercial_level text;
alter table waitlist_submissions add column if not exists opportunity_presentation text;
alter table waitlist_submissions add column if not exists known_for text[];
alter table waitlist_submissions add column if not exists location text[];
alter table waitlist_submissions add column if not exists content_focus text[];
alter table waitlist_submissions add column if not exists platforms text[];
alter table waitlist_submissions add column if not exists visibility_level text;
alter table waitlist_submissions add column if not exists content_comfort text[];
alter table waitlist_submissions add column if not exists risk_appetite text;
alter table waitlist_submissions add column if not exists channel_personality jsonb;
alter table waitlist_submissions add column if not exists brand_affinities text[];
alter table waitlist_submissions add column if not exists brand_words text[];
alter table waitlist_submissions add column if not exists english_variant text;
alter table waitlist_submissions add column if not exists term_advisor text;
alter table waitlist_submissions add column if not exists term_property text;
alter table waitlist_submissions add column if not exists term_client text;
alter table waitlist_submissions add column if not exists term_opportunity text;
alter table waitlist_submissions add column if not exists term_sale text;
alter table waitlist_submissions add column if not exists term_buyer text;
alter table waitlist_submissions add column if not exists term_vendor text;
alter table waitlist_submissions add column if not exists term_market text;
alter table waitlist_submissions add column if not exists term_network text;
alter table waitlist_submissions add column if not exists len_email text;
alter table waitlist_submissions add column if not exists len_social text;
alter table waitlist_submissions add column if not exists len_market text;
alter table waitlist_submissions add column if not exists len_property text;
alter table waitlist_submissions add column if not exists never text[];
alter table waitlist_submissions add column if not exists ai_help text[];
alter table waitlist_submissions add column if not exists ideal_clients text[];
alter table waitlist_submissions add column if not exists share_personal text;
alter table waitlist_submissions add column if not exists personal_ok text;
alter table waitlist_submissions add column if not exists personal_offlimits text;
alter table waitlist_submissions add column if not exists personal_interests text;
alter table waitlist_submissions add column if not exists trust integer;
alter table waitlist_submissions add column if not exists likeability integer;
alter table waitlist_submissions add column if not exists respect integer;
alter table waitlist_submissions add column if not exists discretion integer;
alter table waitlist_submissions add column if not exists reliability integer;
alter table waitlist_submissions add column if not exists example_email text;
alter table waitlist_submissions add column if not exists example_whatsapp text;
alter table waitlist_submissions add column if not exists example_linkedin text;
alter table waitlist_submissions add column if not exists example_proposal text;
alter table waitlist_submissions add column if not exists example_market text;
alter table waitlist_submissions add column if not exists example_property text;
alter table waitlist_submissions add column if not exists example_presentation text;
alter table waitlist_submissions add column if not exists display_name text;
alter table waitlist_submissions add column if not exists extra_context text;
alter table waitlist_submissions add column if not exists posting_frequency_before text;
alter table waitlist_submissions add column if not exists posting_frequency_after text;
alter table waitlist_submissions add column if not exists changed_mind_on_frequency boolean;
alter table waitlist_submissions add column if not exists platform_belief_before text;
alter table waitlist_submissions add column if not exists estimated_hourly_rate integer;
alter table waitlist_submissions add column if not exists clarifying_qa jsonb;
alter table waitlist_submissions add column if not exists content_feedback text;

create index if not exists waitlist_submissions_created_at_idx
  on waitlist_submissions (created_at desc);

-- Row Level Security: all writes/reads for this table go through the
-- Netlify function using the service role key, which bypasses RLS. Enabling
-- RLS with no policies blocks the anon/public key from touching this table
-- directly, which is what we want since the browser never talks to Supabase
-- itself.
alter table waitlist_submissions enable row level security;
