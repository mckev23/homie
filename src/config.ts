export type AppConfig = {
  supabaseUrl: string | null;
  supabaseAnonKey: string | null;
  hasSupabaseConfig: boolean;
  /**
   * Whether the crash screen may show the underlying error text. Preview
   * builds set this so a failure is diagnosable without a debugger attached;
   * production must never set it, so real users only ever see plain language.
   */
  showErrorDetail: boolean;
};

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL ?? null;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? null;

export const appConfig: AppConfig = {
  supabaseUrl,
  supabaseAnonKey,
  hasSupabaseConfig: Boolean(supabaseUrl && supabaseAnonKey),
  showErrorDetail: process.env.EXPO_PUBLIC_DEBUG_ERRORS === '1',
};
