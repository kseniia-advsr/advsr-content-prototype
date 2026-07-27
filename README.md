# ADVSR Content Engine — Phase 1 prototype

No-login, no-database public prototype: fill in a tone-of-voice questionnaire,
submit one topic, get one premium generation, then join the waitlist. Built
from `ADVSR_CONTENT_ENGINE_BUILD_SPEC.md` in the parent repo, forking the
DDRE "Real Estate Content Engine" source app's Content Architecture Engine
logic (`src/engine/`) without its login, MySQL, or tRPC/Express machinery.

## Stack

- **Frontend:** Vite + React 19 + Tailwind 4, single static bundle.
- **Backend:** Two Netlify Functions (`netlify/functions/generate.ts`,
  `waitlist.ts`), thin wrappers around framework-agnostic handlers in
  `src/server/` so the same logic runs locally under `pnpm dev` (via a Vite
  dev-only middleware in `vite.config.ts`) and in production under Netlify.
- **LLM:** Anthropic Messages API, called directly — no proxy, no streaming.
- **Storage:** Supabase (Postgres), one table (`waitlist_submissions`),
  service-role key only — the browser never talks to Supabase directly.

## What was ported vs. changed vs. new

- **Ported verbatim (the product IP, per build spec section 0):** the Tension
  Bridge narrative framework, Advisory Board, South Park Rule, output
  blueprints (`src/engine/contentEngine.ts`), the advisor-context builder
  (`src/engine/advisorContext.ts`), and the full 15-section tone-of-voice
  schema (`src/engine/toneProfile.ts`).
- **Changed:** brand-positioning paragraph rewritten from
  UHNW/London-centric to a global professional/brand audience; added the
  no-AI-slop writing-quality guardrail block (spec section 1a); UK postcode
  areas/districts (`ukPostcodes.ts`) replaced with global
  countries/cities (`src/engine/countries.ts`, spec section 4).
- **New:** everything under `src/server/`, `netlify/functions/`,
  `supabase/schema.sql`, and the whole frontend flow (no equivalent existed
  without login in the source app).

## Decisions made (spec section 6's open items)

- **Pricing-feedback format:** open text ("What would you expect to pay for
  ongoing access?"), not price bands.
- **How much of the 15-section questionnaire to show an anonymous visitor:**
  a curated 6-section subset — communication style, advisor archetype,
  expertise & authority (incl. markets), visibility/platforms, personal &
  family (privacy opt-in kept exactly as designed), and free-text context.
  See `PROTOTYPE_SECTION_IDS` in `src/components/IntakeForm.tsx`. The full
  15-section schema stays intact in `toneProfile.ts` for Phase 2 to reuse
  as-is; whatever subset a visitor fills in is stored as-is in
  `tone_profile`, unnormalised.
- **Countries/cities list:** a starting set of ~20 major markets in
  `src/engine/countries.ts` — expand freely, it's a plain data file.
- **Model:** `claude-sonnet-5` for ordinary use, `claude-opus-5` (best
  available) reserved for the premium first-generation, gated behind the
  `PREMIUM_MODEL` constant in `contentEngine.ts`. Re-check
  https://docs.claude.com/en/docs/about-claude/pricing before a real launch —
  Anthropic's recommended default can change.
- **Rate limiting:** simple in-memory per-IP counter (3 generations/hour),
  per the build spec's explicit allowance. This resets on every fresh
  Netlify function cold start — good enough to blunt casual abuse for a
  prototype, not airtight. Tighten this before a real public launch if abuse
  becomes a problem.

## Local development

```bash
pnpm install
cp .env.example .env   # fill in ANTHROPIC_API_KEY once you have one
pnpm dev
```

`pnpm dev` runs on `http://localhost:5173` with a dev-only API middleware
(see `devApiPlugin` in `vite.config.ts`) so `/api/generate` and
`/api/waitlist` work without `netlify dev`. Without `ANTHROPIC_API_KEY` /
`SUPABASE_URL` / `SUPABASE_SERVICE_ROLE_KEY` set, both endpoints fail with a
clear "not configured yet" error instead of crashing — useful for exercising
the UI flow before either service is wired up.

```bash
pnpm test    # vitest — pure logic only, no live API calls
pnpm check   # tsc --noEmit
pnpm build   # tsc --noEmit + vite build
```

## Getting the two external services running

1. **Anthropic API key** — see "Getting Anthropic API access" in
   `ADVSR_CONTENT_ENGINE_BUILD_SPEC.md`. This is a separate product/billing
   from a Claude Team (claude.ai) plan; someone needs admin access on
   platform.claude.com with a payment method attached.
2. **Supabase project** — create one at supabase.com, then run
   `supabase/schema.sql` in the SQL editor (or `supabase db push`). Copy the
   project URL and the **service role** key (Settings → API) into your env —
   never the anon/public key, since the service role key is what lets the
   Netlify function bypass Row Level Security to insert rows.

## Deploying to Netlify

1. Push this directory to a Git repo (or connect it as a monorepo subdirectory
   in Netlify's site settings with this as the base directory).
2. In Netlify: set `ANTHROPIC_API_KEY`, `SUPABASE_URL`,
   `SUPABASE_SERVICE_ROLE_KEY` as environment variables.
3. `netlify.toml` already points the build at `pnpm build`, publishes `dist`,
   and maps `/api/*` to the functions — no further config needed.

## Using the data once it builds up

Query `tone_profile` (jsonb) and `expected_price` in the Supabase table
editor or SQL editor to see which communication styles, archetypes and
platforms come up most, and to sanity-check the eventual subscription price
— see the build spec's "Use the data, don't just store it."
