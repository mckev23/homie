import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { appConfig } from '@/src/config';
import { secureStorage } from '@/src/secure-storage';

export const supabase: SupabaseClient | null = appConfig.hasSupabaseConfig
  ? createClient(appConfig.supabaseUrl as string, appConfig.supabaseAnonKey as string, {
      auth: {
        autoRefreshToken: true,
        detectSessionInUrl: false,
        persistSession: true,
        storage: secureStorage,
      },
    })
  : null;
