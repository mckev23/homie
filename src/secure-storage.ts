import * as SecureStore from 'expo-secure-store';
import type { SupportedStorage } from '@supabase/auth-js';

const PREFIX = 'hom-auth-';

export const secureStorage: SupportedStorage = {
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
