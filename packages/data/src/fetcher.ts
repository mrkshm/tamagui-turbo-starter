import { BaseSchema, BaseIssue } from 'valibot';
import { ValidationResult, createValidator } from './validator';
import { HTTP_METHODS } from './constants/constants';
import { API_BASE_URL } from './constants/config';
import { tokenService } from './services/token-service';
import { LogLevel } from './constants/errors';
import { errorTracker } from './services/error-tracking';

async function addJWTToHeaders(
  headers: Headers,
  userId?: string
): Promise<void> {
  if (!userId) return;

  const token = await tokenService.getValidToken(userId);
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }
}

type FetcherOptions = RequestInit & {
  skipAuth?: boolean;
  skipValidation?: boolean;
  timeout?: number;
  retries?: number;
  validateRequest?: boolean;
  requestSchema?: BaseSchema<unknown, unknown, BaseIssue<unknown>>;
  userId?: string;
  params?: Record<string, string | number | boolean | undefined>;
  skipStringify?: boolean;
};

class FetchError extends Error {
  constructor(
    message: string,
    public status?: number,
    public data?: unknown
  ) {
    super(message);
    this.name = 'FetchError';
  }
}

async function handleResponseError(
  response: Response,
  userId?: string
): Promise<never> {
  const errorData = await response.json().catch(() => null);

  if (response.status === 401 && userId) {
    // Try to refresh token
    const refreshSuccess = await tokenService.refreshToken(userId);
    if (!refreshSuccess) {
      errorTracker.captureError({
        message: 'Authentication failed',
        userMessage: 'Failed to authenticate request',
        logLevel: LogLevel.ERROR,
        context: {
          status: response.status,
          errorData,
          timestamp: new Date().toISOString(),
        },
      });
      throw new FetchError('Authentication failed', response.status, errorData);
    }
    // Caller should retry the request
    throw new FetchError('Token refreshed, please retry', 401, {
      shouldRetry: true,
    });
  }

  errorTracker.captureError({
    message: `HTTP error! status: ${response.status}`,
    userMessage: 'Request failed',
    logLevel: LogLevel.ERROR,
    context: {
      status: response.status,
      errorData,
      timestamp: new Date().toISOString(),
    },
  });

  throw new FetchError(
    `HTTP error! status: ${response.status}`,
    response.status,
    errorData
  );
}

export async function fetcher<T>(
  url: string | URL,
  responseSchema: BaseSchema<unknown, T, BaseIssue<unknown>>,
  options: FetcherOptions = {}
): Promise<ValidationResult<T>> {
  const {
    timeout = 5000,
    retries = 3,
    validateRequest = false,
    requestSchema,
    userId,
    params,
    ...fetchOptions
  } = options;

  const urlObj = new URL(
    url instanceof URL
      ? url.toString()
      : `${API_BASE_URL}${url.startsWith('/') ? url : `/${url}`}`
  );

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        urlObj.searchParams.append(key, value.toString());
      }
    });
  }

  let attemptCount = 0;

  while (attemptCount < retries) {
    const headers = new Headers(options.headers);
    if (!options.skipAuth) {
      await addJWTToHeaders(headers, userId);
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      // Validate request body if schema provided
      if (validateRequest && requestSchema && options.body) {
        const validator = createValidator(requestSchema);
        const result = validator(
          typeof options.body === 'string'
            ? JSON.parse(options.body)
            : options.body
        );
        if (!result.success) {
          throw new FetchError('Invalid request body', undefined, result.error);
        }
      }

      const response = await fetch(urlObj.toString(), {
        ...fetchOptions,
        headers,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        await handleResponseError(response, userId);
      }

      const data = await response.json();

      // FOR VALIDATION ERRORS IN DEV UNCOMMENT THE FOLLOWING LINE
      // console.log('Response:', JSON.stringify(data, null, 2));

      // Skip validation if requested
      if (options.skipValidation) {
        return { success: true, data };
      }

      // Validate response
      const validator = createValidator(responseSchema);
      const validationResult = validator(data);

      if (!validationResult.success) {
        console.error('[Validation Error]:', {
          error: validationResult.error,
          issues: validationResult.error.issues,
          failedAt: validationResult.error.issues.map((issue) =>
            Array.isArray(issue.path)
              ? issue.path.map((p) => p.key).join('.')
              : 'unknown'
          ),
        });
      }

      return validationResult;
    } catch (error) {
      clearTimeout(timeoutId);

      if (error instanceof FetchError) {
        if (
          error.status === 401 &&
          typeof error.data === 'object' &&
          error.data &&
          'shouldRetry' in error.data &&
          attemptCount < retries - 1
        ) {
          attemptCount++;
          continue;
        }
        throw error;
      }

      if (error instanceof Error) {
        throw new FetchError(error.message, undefined, {
          type: error.name,
          message: error.message,
        });
      }

      throw new FetchError('Unknown error occurred');
    }
  }

  throw new FetchError('Max retries exceeded');
}

// Helper functions for common operations
export const apiClient = {
  get: <T>(
    url: string,
    schema: BaseSchema<unknown, T, BaseIssue<unknown>>,
    options?: FetcherOptions
  ) => fetcher<T>(url, schema, { method: HTTP_METHODS.GET, ...options }),

  post: <T>(
    url: string,
    schema: BaseSchema<unknown, T, BaseIssue<unknown>>,
    data: unknown,
    options?: FetcherOptions
  ) =>
    fetcher<T>(url, schema, {
      method: HTTP_METHODS.POST,
      body: options?.skipStringify ? (data as BodyInit) : JSON.stringify(data),
      headers: {
        'Content-Type': options?.skipStringify
          ? 'multipart/form-data'
          : 'application/json',
        ...options?.headers,
      },
      ...options,
    }),

  patch: <T>(
    url: string,
    schema: BaseSchema<unknown, T, BaseIssue<unknown>>,
    data: unknown,
    options?: FetcherOptions
  ) =>
    fetcher<T>(url, schema, {
      method: HTTP_METHODS.PATCH,
      body: options?.skipStringify ? (data as BodyInit) : JSON.stringify(data),
      headers:
        data instanceof FormData
          ? options?.headers // Let the browser set the correct boundary
          : {
              'Content-Type': 'application/json',
              ...options?.headers,
            },
      ...options,
    }),

  delete: <T>(
    url: string,
    schema: BaseSchema<unknown, T, BaseIssue<unknown>>,
    options?: FetcherOptions
  ) => fetcher<T>(url, schema, { method: HTTP_METHODS.DELETE, ...options }),
};
