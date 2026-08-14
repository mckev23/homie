import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { Session, SignUpWithPasswordCredentials, User } from '@supabase/supabase-js';
import { supabase } from '@/src/supabase';

export type AuthError = { message: string };

type AuthContextValue = {
  session: Session | null;
  user: User | null;
  loading: boolean;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: AuthError | null; needsConfirmation: boolean }>;
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: AuthError | null }>;
  resendConfirmation: (email: string) => Promise<{ error: AuthError | null }>;
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
        options: { data: { full_name: fullName } },
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
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      if (error) {
        return { error: { message: translateError(error.code, error.message) } };
      }
      return { error: null };
    },
    async resendConfirmation(email) {
      if (!supabase) return { error: { message: 'Service unavailable.' } };
      const { error } = await supabase.auth.resend({ type: 'signup', email });
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
