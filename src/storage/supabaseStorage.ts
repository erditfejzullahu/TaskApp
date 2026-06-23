import type { SupportedStorage } from '@supabase/supabase-js';
import { storage } from './mmkv';

export const mmkvSupabaseStorage: SupportedStorage = {
  getItem: (key: string) => storage.getString(key) ?? null,
  setItem: (key: string, value: string) => storage.set(key, value),
  removeItem: (key: string) => storage.remove(key),
};
