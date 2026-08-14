import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { appConfig } from '@/src/config';

export const supabase: SupabaseClient | null = appConfig.hasSupabaseConfig
  ? createClient(appConfig.supabaseUrl as string, appConfig.supabaseAnonKey as string, {
      auth: {
        autoRefreshToken: false,
        detectSessionInUrl: false,
        persistSession: false,
      },
    })
  : null;
