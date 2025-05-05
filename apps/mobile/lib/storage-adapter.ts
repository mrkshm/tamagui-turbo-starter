import { StorageAdapter } from '@bbook/data';
import * as SecureStore from 'expo-secure-store';

// SecureStore only allows alphanumeric characters, '.', '-', and '_'
// We need to sanitize keys to ensure they meet this requirement
const sanitizeKey = (key: string): string => {
  return key.replace(/[^a-zA-Z0-9._-]/g, '_');
};

export const mobileStorageAdapter: StorageAdapter = {
  getItem: async (key) => {
    const sanitizedKey = sanitizeKey(key);
    console.log(
      `Getting item with sanitized key: ${sanitizedKey} (original: ${key})`
    );
    return SecureStore.getItemAsync(sanitizedKey);
  },
  setItem: async (key, value) => {
    const sanitizedKey = sanitizeKey(key);
    console.log(
      `Setting item with sanitized key: ${sanitizedKey} (original: ${key})`
    );
    return SecureStore.setItemAsync(sanitizedKey, value);
  },
  removeItem: async (key) => {
    const sanitizedKey = sanitizeKey(key);
    console.log(
      `Removing item with sanitized key: ${sanitizedKey} (original: ${key})`
    );
    return SecureStore.deleteItemAsync(sanitizedKey);
  },
};
