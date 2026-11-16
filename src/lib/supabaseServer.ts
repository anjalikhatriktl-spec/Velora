import { createClient, type SupabaseClient } from '@supabase/supabase-js';

export const SUPABASE_PROJECT_ID = 'exxwklvtlltfhtrvzsgp';
export const DEFAULT_SUPABASE_URL = `https://${SUPABASE_PROJECT_ID}.supabase.co`;

export function getSupabaseConfig() {
  const url =
    process.env.SUPABASE_URL?.trim() ||
    process.env.VITE_SUPABASE_URL?.trim() ||
    DEFAULT_SUPABASE_URL;

  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() ||
    process.env.SUPABASE_ANON_KEY?.trim() ||
    process.env.VITE_SUPABASE_ANON_KEY?.trim() ||
    '';

  return { url, key };
}

let cachedClient: SupabaseClient | null = null;
let cachedSignature = '';

export function getSupabaseServerClient():
  | { client: SupabaseClient; error: null }
  | { client: null; error: string } {
  const { url, key } = getSupabaseConfig();

  if (!key) {
    return {
      client: null,
      error:
        'Supabase API key is missing. Add SUPABASE_SERVICE_ROLE_KEY (or SUPABASE_ANON_KEY) in Secrets for project exxwklvtlltfhtrvzsgp.',
    };
  }

  const signature = `${url}::${key}`;
  if (!cachedClient || cachedSignature !== signature) {
    cachedClient = createClient(url, key, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
    cachedSignature = signature;
  }

  return { client: cachedClient, error: null };
}
