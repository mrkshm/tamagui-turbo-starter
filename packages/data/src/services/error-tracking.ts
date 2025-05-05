import { LogLevel } from '../constants/errors';
import { devmode } from '../constants/config';
type ErrorContext = Record<string, unknown>;

interface ErrorPayload {
  message: string;
  userMessage: string;
  logLevel: LogLevel;
  tags?: Record<string, string>;
  context?: ErrorContext;
  userId?: string;
}

// Creating error payload with user context
export const createUserErrorPayload = (
  error: Error,
  userId: string,
  userMessage: string
): ErrorPayload => ({
  message: error.message,
  userMessage,
  logLevel: LogLevel.ERROR,
  userId,
  context: {
    errorName: error.name,
    stack: error.stack,
    timestamp: new Date().toISOString(),
  },
});

const formatErrorLog = (payload: ErrorPayload): string[] => [
  `[Error Tracked] ${payload.logLevel.toUpperCase()}`,
  `Message: ${payload.message}`,
  `User Message: ${payload.userMessage}`,
  `User ID: ${payload.userId || 'Not provided'}`,
  `Context: ${JSON.stringify(payload.context, null, 2)}`,
];

// Define the adapter interface
export interface ErrorTrackingAdapter {
  captureException: (error: Error, context?: ErrorContext) => void;
  captureMessage: (
    message: string,
    logLevel?: LogLevel,
    context?: ErrorContext
  ) => void;
  setUser: (userId: string, userData?: Record<string, unknown>) => void;
  clearUser: () => void;
}

// Default console implementation
const consoleAdapter: ErrorTrackingAdapter = {
  captureException: (error, context) => {
    if (devmode) {
      console.error('[Error Tracking]', error, context);
    }
  },
  captureMessage: (message, logLevel = LogLevel.INFO, context) => {
    if (devmode) {
      console.log(`[${logLevel}]`, message, context);
    }
  },
  setUser: (userId, userData) => {
    if (devmode) {
      console.log('[Error Tracking] Set user:', userId, userData);
    }
  },
  clearUser: () => {
    if (devmode) {
      console.log('[Error Tracking] Cleared user');
    }
  },
};

// Adapter management
let adapter: ErrorTrackingAdapter = consoleAdapter;

export function initializeErrorTracking(customAdapter: ErrorTrackingAdapter) {
  adapter = customAdapter;
}

// The error tracker service that uses the adapter
export const errorTracker = {
  captureError: (payload: ErrorPayload) => {
    // Always log to console in dev mode
    if (devmode) {
      const logLines = formatErrorLog(payload);
      console.error(...logLines);
    }

    // Create an error to capture the stack trace
    const error = new Error(payload.message);
    adapter.captureException(error, payload.context);

    return payload;
  },

  captureException: (error: Error, context?: ErrorContext) => {
    adapter.captureException(error, context);
  },

  captureMessage: (
    message: string,
    logLevel: LogLevel = LogLevel.INFO,
    context?: ErrorContext
  ) => {
    adapter.captureMessage(message, logLevel, context);
  },

  setUser: (userId: string, userData?: Record<string, unknown>) => {
    adapter.setUser(userId, userData);
  },

  clearUser: () => {
    adapter.clearUser();
  },
};
