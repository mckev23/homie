import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import type { SupportedStorage } from '@supabase/auth-js';

const PREFIX = 'hom-auth-';

/*
expo-secure-store has no web implementation — every method throws
"...is not a function" there (it's backed by the iOS/Android keychain, which
has no web equivalent). Calling it unconditionally broke sign-in on web: the
account/password check succeeded, then persisting the resulting session threw,
and because nothing caught it, the caller's loading state never cleared —
a silent, permanent spinner with no visible error.
Native keeps the keychain-backed store; web uses localStorage, which is
supabase-js's own documented approach for session persistence in a browser.
*/
export const secureStorage: SupportedStorage =
  Platform.OS === 'web'
    ? {
        getItem: async (key: string) => window.localStorage.getItem(PREFIX + key),
        setItem: async (key: string, value: string) => window.localStorage.setItem(PREFIX + key, value),
        removeItem: async (key: string) => window.localStorage.removeItem(PREFIX + key),
      }
    : {
        getItem: async (key: string): Promise<string | null> => {
          const value = await SecureStore.getItemAsync(PREFIX + key);
          return value ?? null;
        },
        setItem: async (key: string, value: string): Promise<void> => {
          await SecureStore.setItemAsync(PREFIX + key, value);
        },
        removeItem: async (key: string): Promise<void> => {
          await SecureStore.deleteItemAsync(PREFIX + key);
        },
      };
