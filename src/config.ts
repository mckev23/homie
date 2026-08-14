export type AppConfig = {
  supabaseUrl: string | null;
  supabaseAnonKey: string | null;
  hasSupabaseConfig: boolean;
};

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL ?? null;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? null;

export const appConfig: AppConfig = {
  supabaseUrl,
  supabaseAnonKey,
  hasSupabaseConfig: Boolean(supabaseUrl && supabaseAnonKey),
};
