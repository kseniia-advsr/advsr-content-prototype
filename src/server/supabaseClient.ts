import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let cached: SupabaseClient | null | undefined;

/**
 * Lazily builds a Supabase client from server-only env vars. Returns null
 * when not configured yet so callers can fail with a clear error instead of
 * throwing during module load (useful before Supabase is set up).
 */
export function getSupabaseClient(): SupabaseClient | null {
  if (cached !== undefined) return cached;
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  cached = url && key ? createClient(url, key) : null;
  return cached;
}

/** Test-only: clear the cached client so tests can vary env vars. */
export function _resetSupabaseClientForTests(): void {
  cached = undefined;
}
