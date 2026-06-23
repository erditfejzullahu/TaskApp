import { SUPABASE_URL, SUPABASE_ANON_KEY } from '@env';

export const ENV = {
  SUPABASE_URL: SUPABASE_URL.trim(),
  SUPABASE_ANON_KEY: SUPABASE_ANON_KEY.trim(),
} as const;

export const isSupabaseConfigured = (): boolean =>
  ENV.SUPABASE_URL.length > 0 && ENV.SUPABASE_ANON_KEY.length > 0;
