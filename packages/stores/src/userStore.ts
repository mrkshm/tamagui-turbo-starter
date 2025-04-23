import { proxy, subscribe } from 'valtio';
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

export const userStore = proxy<{ theme: ThemeKey }>({
  theme: getDefaultTheme(),
});

// Hydrate theme from storage on app start
async function hydrateTheme() {
  if (isReactNative) {
    try {
      const stored = await AsyncStorage.getItem('theme');
      console.log('Loaded theme from AsyncStorage:', stored);
      if (stored === 'light' || stored === 'dark') {
        userStore.theme = stored;
      }
    } catch (e) {
      console.log('Error loading theme from AsyncStorage:', e);
    }
  } else if (typeof window !== 'undefined' && window.localStorage) {
    const stored = window.localStorage.getItem('theme');
    console.log('Loaded theme from localStorage:', stored);
    if (stored === 'light' || stored === 'dark') {
      userStore.theme = stored;
    }
  }
}
hydrateTheme();

// Persist theme changes to storage
subscribe(userStore, () => {
  if (isReactNative) {
    AsyncStorage.setItem('theme', userStore.theme)
      .then(() => {
        console.log('Persisted theme to AsyncStorage:', userStore.theme);
      })
      .catch((e: unknown) => {
        console.log('Error persisting theme to AsyncStorage:', e);
      });
  } else if (typeof window !== 'undefined' && window.localStorage) {
    window.localStorage.setItem('theme', userStore.theme);
    console.log('Persisted theme to localStorage:', userStore.theme);
  }
});
