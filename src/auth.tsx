import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import * as Linking from 'expo-linking';
import type { Session, SignUpWithPasswordCredentials, User } from '@supabase/supabase-js';
import { supabase } from '@/src/supabase';

export type AuthError = { message: string };

/*
Where Supabase sends the user back after they tap a link in an auth email.
Built from the app's `scheme` (homeapp), so it resolves to
homeapp://reset-password in a standalone build and to the Expo Go dev URL
during development. Both forms must be allow-listed in the Supabase
dashboard under Authentication -> URL Configuration -> Redirect URLs, or
Supabase silently falls back to the Site URL and the link won't open hōm.
*/
export const PASSWORD_RESET_REDIRECT = Linking.createURL('/reset-password');

/*
Where Supabase sends the user after they tap a signup confirmation email
link. Unlike password reset, the app doesn't need to read anything off
this link — Supabase confirms the email server-side before redirecting —
so this just needs to land somewhere valid instead of falling back to the
dashboard's default Site URL (which was left at localhost:3000).
*/
export const SIGNUP_CONFIRM_REDIRECT = Linking.createURL('/login');

type AuthContextValue = {
  session: Session | null;
  user: User | null;
  loading: boolean;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: AuthError | null; needsConfirmation: boolean }>;
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: AuthError | null }>;
  resendConfirmation: (email: string) => Promise<{ error: AuthError | null }>;
  /** Exchanges recovery tokens from a reset deep link for a live session. */
  startPasswordRecovery: (accessToken: string, refreshToken: string) => Promise<{ error: AuthError | null }>;
  /** Sets a new password for the currently-authenticated user. */
  updatePassword: (newPassword: string) => Promise<{ error: AuthError | null }>;
  /** Permanently deletes the signed-in user's account and all their data. */
  deleteAccount: () => Promise<{ error: AuthError | null }>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function translateError(code: string | undefined, defaultMessage: string): string {
  switch (code) {
    case 'invalid_credentials':
      return 'Invalid email or password.';
    case 'user_already_registered':
      return 'An account with this email already exists.';
    case 'email_not_confirmed':
      return 'Please verify your email before signing in.';
    case 'weak_password':
      return 'Password is too weak. Use at least 8 characters with letters and numbers.';
    case 'over_request_rate_limit':
    case 'rate_limit_exceeded':
      return 'Too many attempts. Please wait a moment and try again.';
    case 'network_request_failed':
      return 'Network connection problem. Check your internet and try again.';
    default:
      return defaultMessage;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase?.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });

    const sub = supabase?.auth.onAuthStateChange((_event, newSession) => {
      (async () => {
        setSession(newSession);
      })();
    });

    return () => {
      sub?.data.subscription.unsubscribe();
    };
  }, []);

  const value = useMemo<AuthContextValue>(() => ({
    session,
    user: session?.user ?? null,
    loading,
    async signUp(email, password, fullName) {
      if (!supabase) return { error: { message: 'Service unavailable.' }, needsConfirmation: false };
      const credentials: SignUpWithPasswordCredentials = {
        email,
        password,
        options: { data: { full_name: fullName }, emailRedirectTo: SIGNUP_CONFIRM_REDIRECT },
      };
      const { data, error } = await supabase.auth.signUp(credentials);
      if (error) {
        return { error: { message: translateError(error.code, error.message) }, needsConfirmation: false };
      }
      const needsConfirmation = !data.session && !!data.user;
      return { error: null, needsConfirmation };
    },
    async signIn(email, password) {
      if (!supabase) return { error: { message: 'Service unavailable.' } };
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        return { error: { message: translateError(error.code, error.message) } };
      }
      return { error: null };
    },
    async signOut() {
      await supabase?.auth.signOut();
    },
    async resetPassword(email) {
      if (!supabase) return { error: { message: 'Service unavailable.' } };
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: PASSWORD_RESET_REDIRECT,
      });
      if (error) {
        return { error: { message: translateError(error.code, error.message) } };
      }
      return { error: null };
    },
    async startPasswordRecovery(accessToken, refreshToken) {
      if (!supabase) return { error: { message: 'Service unavailable.' } };
      const { error } = await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken,
      });
      if (error) {
        return {
          error: {
            message: translateError(
              error.code,
              'This reset link is no longer valid. Please request a new one.'
            ),
          },
        };
      }
      return { error: null };
    },
    async updatePassword(newPassword) {
      if (!supabase) return { error: { message: 'Service unavailable.' } };
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) {
        return { error: { message: translateError(error.code, error.message) } };
      }
      return { error: null };
    },
    async deleteAccount() {
      if (!supabase) return { error: { message: 'Service unavailable.' } };
      // Deletes auth.users row + cascades all hōm data. See migration
      // 20260828120000_create_delete_current_user_function.sql.
      const { error } = await supabase.rpc('delete_current_user');
      if (error) {
        return { error: { message: 'Could not delete your account. Please try again.' } };
      }
      // The account is gone; clear the local session so the app returns to
      // the signed-out state. A failure here is not worth surfacing — the
      // deletion already succeeded.
      await supabase.auth.signOut().catch(() => undefined);
      return { error: null };
    },
    async resendConfirmation(email) {
      if (!supabase) return { error: { message: 'Service unavailable.' } };
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email,
        options: { emailRedirectTo: SIGNUP_CONFIRM_REDIRECT },
      });
      if (error) {
        return { error: { message: translateError(error.code, error.message) } };
      }
      return { error: null };
    },
  }), [session, loading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
