import { createClient, SupabaseClient } from '@supabase/supabase-js';

export const SUPABASE_PROJECT_ID = 'exxwklvtlltfhtrvzsgp';
export const SUPABASE_URL =
  import.meta.env.VITE_SUPABASE_URL?.trim() || `https://${SUPABASE_PROJECT_ID}.supabase.co`;

const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim() || '';

export const isSupabaseConfigured = Boolean(
  SUPABASE_URL && supabaseAnonKey && supabaseAnonKey !== 'YOUR_SUPABASE_ANON_KEY'
);

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(SUPABASE_URL, supabaseAnonKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    })
  : null;
