import type { StorageAdapter } from '@bbook/data';

export const webStorageAdapter: StorageAdapter = {
  getItem: async (key) => {
    console.log(`[Storage] Getting item with key: ${key}`);
    const value = localStorage.getItem(key);
    return value;
  },
  setItem: async (key, value) => {
    console.log(`[Storage] Setting item with key: ${key}`);
    localStorage.setItem(key, value);
    return Promise.resolve();
  },
  removeItem: async (key) => {
    console.log(`[Storage] Removing item with key: ${key}`);
    localStorage.removeItem(key);
    
    // Special handling for auth tokens - when we're removing auth tokens,
    // we'll clear all related tokens to ensure complete logout
    if (key.includes('jwt_') && (key.includes('_access') || key.includes('_refresh'))) {
      console.log('[Storage] Clearing all auth tokens for complete logout');
      // Find all auth-related keys in localStorage
      Object.keys(localStorage).forEach(storageKey => {
        if (storageKey.startsWith('jwt_')) {
          console.log(`[Storage] Also removing: ${storageKey}`);
          localStorage.removeItem(storageKey);
        }
      });
    }
    
    return Promise.resolve();
  },
};
