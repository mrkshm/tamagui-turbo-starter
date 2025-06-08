import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { isReactNative } from '@bbook/utils';
import {
  UserApiResponse,
  useUpdateUser,
  type UseMutationResult,
  type ProfilePayload,
} from '@bbook/data';

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
  syncWithBackend: (themeValue: ThemeKey) => void;
}

// Create the store
const createThemeStore = () => {
  return create<ThemeStore>((set, get) => ({
    theme: getDefaultTheme(),
    setTheme: (theme) => {
      set({ theme });
      // Sync with backend when theme changes
      get().syncWithBackend(theme);
    },
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
    syncWithBackend: () => {
      // This will be implemented by the useThemeSync hook
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

// Create a hook to sync theme with backend
// Return type explicitly defined to avoid TypeScript inference issues
export const useThemeSync = (): UseMutationResult<
  UserApiResponse,
  Error,
  Partial<ProfilePayload>
> => {
  // Create mutation using the new hook. We don't need userId here; the hook
  // defaults to `current_user` which is correct for theme preference changes.
  const mutation = useUpdateUser();

  // Wire the store so every local theme change is sent to the backend.
  useThemeStore.setState({
    syncWithBackend: (themeValue: ThemeKey) => {
      console.log('syncWithBackend called with theme:', themeValue);
      mutation.mutate({ preferred_theme: themeValue });
    },
  });

  // Expose the full mutation object so callers can inspect status or trigger
  // manual syncs if they like.
  return mutation;
};
