import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { isReactNative } from '@bbook/utils';

export type ThemeKey = 'light' | 'dark';

const isThemeKey = (value: any): value is ThemeKey =>
  value === 'light' || value === 'dark';

function setThemeFromStorage(
  storedTheme: string | null,
  set: (v: { theme: ThemeKey }) => void
) {
  if (isThemeKey(storedTheme)) {
    set({ theme: storedTheme });
  } else {
    set({ theme: 'light' }); // fallback
  }
}

// Platform detection
function getDefaultTheme(): ThemeKey {
  return 'light';
}

// Accept any string as theme, but only allow ThemeKey values for the UI (cast as needed)
export interface ThemeStore {
  theme: ThemeKey;
  setTheme: (theme: ThemeKey) => void;
  hydrate: () => Promise<void>;
}

// Create the store
const createThemeStore = () => {
  return create<ThemeStore>((set) => ({
    theme: getDefaultTheme(),
    setTheme: (theme) => set({ theme }),
    hydrate: async () => {
      if (isReactNative()) {
        try {
          const storedTheme = await AsyncStorage.getItem('theme');
          setThemeFromStorage(storedTheme, set);
        } catch (e) {
          console.log('Error loading theme from AsyncStorage:', e);
        }
      } else if (typeof window !== 'undefined' && window.localStorage) {
        const storedTheme = window.localStorage.getItem('theme');
        setThemeFromStorage(storedTheme, set);
      }
    },
  }));
};

// Export the theme store directly as a module-level singleton
export const useThemeStore = createThemeStore();

// Hydrate on import
useThemeStore.getState().hydrate();

// Persist theme changes to storage
useThemeStore.subscribe((state: ThemeStore) => {
  if (isReactNative()) {
    AsyncStorage.setItem('theme', state.theme).catch((e: unknown) => {
      console.log('Error persisting theme to AsyncStorage:', e);
    });
  } else if (typeof window !== 'undefined' && window.localStorage) {
    window.localStorage.setItem('theme', state.theme);
  }
});
