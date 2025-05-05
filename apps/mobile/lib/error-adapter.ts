import type { ErrorTrackingAdapter } from '@bbook/data';
import { LogLevel } from '@bbook/data';

// A simple console-based implementation for development
// In production, you would integrate with a service like Sentry
export const mobileErrorAdapter: ErrorTrackingAdapter = {
  captureException: (error, context) => {
    console.error('[Error]', error, context);
  },
  captureMessage: (message, logLevel = LogLevel.INFO, context) => {
    console.log(`[${logLevel}]`, message, context);
  },
  setUser: (userId, userData) => {
    console.log('[User Set]', userId, userData);
  },
  clearUser: () => {
    console.log('[User Cleared]');
  },
};
