import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type ThemeKey = 'light' | 'dark';

// Platform detection
let isReactNative = false;
try {
  const { Platform } = require('react-native');
  isReactNative = Platform.OS === 'ios' || Platform.OS === 'android';
} catch {
  isReactNative = false;
}

function getDefaultTheme(): ThemeKey {
  return 'light';
}

// Accept any string as theme, but only allow ThemeKey values for the UI (cast as needed)
export interface ThemeStore {
  theme: string;
  setTheme: (theme: string) => void;
  hydrate: () => Promise<void>;
}

// Create the store
const createThemeStore = () => {
  return create<ThemeStore>((set) => ({
    theme: getDefaultTheme(),
    setTheme: (theme) => set({ theme }),
    hydrate: async () => {
      if (isReactNative) {
        try {
          const storedTheme = await AsyncStorage.getItem('theme');
          if (storedTheme) {
            set({ theme: storedTheme });
          }
        } catch (e) {
          console.log('Error loading theme from AsyncStorage:', e);
        }
      } else if (typeof window !== 'undefined' && window.localStorage) {
        const storedTheme = window.localStorage.getItem('theme');
        if (storedTheme) {
          set({ theme: storedTheme });
        }
      }
    },
  }));
};

// Use global singleton pattern for React Native
const getGlobalStore = () => {
  const globalAny = global as any;
  if (!globalAny.__THEME_STORE__) {
    globalAny.__THEME_STORE__ = createThemeStore();
  }
  return globalAny.__THEME_STORE__;
};

// Export the singleton store
export const useThemeStore = getGlobalStore();

// Hydrate on import
useThemeStore.getState().hydrate();

// Persist theme changes to storage
useThemeStore.subscribe((state: ThemeStore) => {
  if (isReactNative) {
    AsyncStorage.setItem('theme', state.theme).catch((e: unknown) => {
      console.log('Error persisting theme to AsyncStorage:', e);
    });
  } else if (typeof window !== 'undefined' && window.localStorage) {
    window.localStorage.setItem('theme', state.theme);
  }
});
