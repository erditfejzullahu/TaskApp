import 'react-native-url-polyfill/auto';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { ENV, isSupabaseConfigured } from '@/config/env';
import { mmkvSupabaseStorage } from '@/storage/supabaseStorage';
import type { SupabaseTaskRow } from '@/types/task';

let client: SupabaseClient | null = null;

export const getSupabaseClient = (): SupabaseClient | null => {
  if (!isSupabaseConfigured()) {
    return null;
  }

  if (!client) {
    client = createClient<{
      public: {
        Tables: {
          tasks: {
            Row: SupabaseTaskRow;
            Insert: SupabaseTaskRow;
            Update: Partial<SupabaseTaskRow>;
          };
        };
      };
    }>(ENV.SUPABASE_URL, ENV.SUPABASE_ANON_KEY, {
      auth: {
        storage: mmkvSupabaseStorage,
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
    });
  }

  return client;
};

export const TASKS_TABLE = 'tasks';
