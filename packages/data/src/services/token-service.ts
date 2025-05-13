// lib/services/tokenService.ts
import { getJWT, storeJWT, removeJWT } from './jwt-storage';
import { TokenRefreshResponseSchema } from '../schemas/user';
import { errorTracker } from './error-tracking';
import { safeParse } from 'valibot';
import { LogLevel } from '../constants/errors';
import { API_BASE_URL } from '../constants/config';
import { authEndpoints } from '../endpoints/auth';

export interface TokenService {
  getValidToken: (userId: string) => Promise<string | null>;
  refreshToken: (userId: string) => Promise<boolean>;
  storeTokens: (
    accessToken: string,
    refreshToken: string,
    userId: string
  ) => Promise<boolean>;
  removeTokens: (userId: string) => Promise<void>;
}

// Helper to check token expiration
const isTokenExpired = (token: string): boolean => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return Date.now() >= payload.exp * 1000;
  } catch {
    return true;
  }
};

async function makeRequest(url: string, token: string) {
  try {
    const response = await fetch(`${API_BASE_URL}${url}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        refresh: token,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    const result = safeParse(TokenRefreshResponseSchema, data);

    if (!result.success) {
      throw new Error('Invalid response schema');
    }

    return result.output;
  } catch (error) {
    errorTracker.captureError({
      message: 'Token refresh failed',
      userMessage: 'Failed to refresh authentication',
      logLevel: LogLevel.ERROR,
      context: {
        error,
        timestamp: new Date().toISOString(),
      },
    });
    return null;
  }
}

export const tokenService: TokenService = {
  getValidToken: async (userId: string) => {
    const tokenResult = await getJWT(`${userId}_access`);
    if (!tokenResult.success || !tokenResult.token) return null;

    // Check if token is expired
    if (isTokenExpired(tokenResult.token)) {
      const refreshSuccess = await tokenService.refreshToken(userId);
      if (!refreshSuccess) return null;

      // Get new token after refresh
      const newTokenResult = await getJWT(`${userId}_access`);
      return newTokenResult.success && newTokenResult.token
        ? newTokenResult.token
        : null;
    }

    return tokenResult.token;
  },

  refreshToken: async (userId: string) => {
    const currentToken = await getJWT(`${userId}_refresh`);
    if (!currentToken.success || !currentToken.token) return false;

    const refreshResult = await makeRequest(
      authEndpoints.REFRESH_TOKEN.url,
      currentToken.token
    );

    if (!refreshResult) return false;

    // Store the new tokens
    const storeResult = await tokenService.storeTokens(
      refreshResult.access,
      refreshResult.refresh,
      userId
    );

    return storeResult;
  },

  storeTokens: async (
    accessToken: string,
    refreshToken: string,
    userId: string
  ) => {
    // Store access token
    const accessResult = await storeJWT(accessToken, `${userId}_access`);
    if (!accessResult.success) return false;

    // Store refresh token
    const refreshResult = await storeJWT(refreshToken, `${userId}_refresh`);
    return refreshResult.success;
  },

  removeTokens: async (userId: string) => {
    console.log(`Removing tokens for user: ${userId}`);
    try {
      // Log the keys we're trying to remove for debugging
      console.log(
        `Removing tokens with keys: jwt_${userId}_access and jwt_${userId}_refresh`
      );

      await removeJWT(`${userId}_access`);
      await removeJWT(`${userId}_refresh`);

      // Also try with 'current_user' as the key since that's what we use in login
      if (userId !== 'current_user') {
        console.log('Also removing tokens for current_user');
        await removeJWT('current_user_access');
        await removeJWT('current_user_refresh');
      }

      console.log('Tokens removed successfully');
      return Promise.resolve();
    } catch (error) {
      console.error('Error removing tokens:', error);
      return Promise.reject(error);
    }
  },
};
