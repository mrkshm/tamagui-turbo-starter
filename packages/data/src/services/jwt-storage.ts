export interface StorageAdapter {
  getItem: (key: string) => Promise<string | null>;
  setItem: (key: string, value: string) => Promise<void>;
  removeItem: (key: string) => Promise<void>;
}

let storageAdapter: StorageAdapter | null = null;

export function initializeStorage(adapter: StorageAdapter) {
  storageAdapter = adapter;
}

const getJWT = async (userId: string) => {
  if (!storageAdapter) throw new Error('Storage adapter not initialized');
  console.log(`Getting JWT for key: jwt_${userId}`);
  const token = await storageAdapter.getItem(`jwt_${userId}`);
  console.log(`JWT found for key jwt_${userId}: ${!!token}`);
  return token ? { success: true, token } : { success: false, token: null };
};

const storeJWT = async (token: string, userId: string) => {
  if (!storageAdapter) throw new Error('Storage adapter not initialized');
  try {
    console.log(`Storing JWT with key: jwt_${userId}`);
    await storageAdapter.setItem(`jwt_${userId}`, token);
    console.log(`JWT stored successfully with key: jwt_${userId}`);
    return { success: true };
  } catch (error) {
    console.error(`Error storing JWT with key jwt_${userId}:`, error);
    return { success: false };
  }
};

const removeJWT = async (userId: string) => {
  if (!storageAdapter) throw new Error('Storage adapter not initialized');
  try {
    console.log(`Removing JWT with key: jwt_${userId}`);
    await storageAdapter.removeItem(`jwt_${userId}`);
    console.log(`JWT removed successfully with key: jwt_${userId}`);
    return { success: true };
  } catch (error) {
    console.error(`Error removing JWT with key jwt_${userId}:`, error);
    return { success: false };
  }
};

export { getJWT, storeJWT, removeJWT };
