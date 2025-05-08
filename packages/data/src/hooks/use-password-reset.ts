import { useMutation } from '@tanstack/react-query';
import { API_ENDPOINTS } from '../endpoints';
import { apiClient } from '../fetcher';
import { errorTracker } from '../services/error-tracking';
import {
  PasswordResetRequestResponseSchema,
  PasswordResetConfirmResponseSchema,
} from '../schemas/user';
import type {
  PasswordResetRequestPayload,
  PasswordResetRequestResponse,
  PasswordResetConfirmPayload,
  PasswordResetConfirmResponse,
} from '../schemas/user';

// Options type for password reset request hook
type UsePasswordResetRequestMutationOptions = {
  onSuccess?: (response: PasswordResetRequestResponse) => void;
  onError?: (error: Error) => void;
};

/**
 * Hook for requesting a password reset email
 * @param options Success and error callbacks
 * @returns Mutation object for requesting password reset
 */
export const usePasswordResetRequestMutation = (
  options?: UsePasswordResetRequestMutationOptions
) => {
  return useMutation({
    mutationFn: async (data: PasswordResetRequestPayload) => {
      const result = await apiClient.post(
        API_ENDPOINTS.AUTH.PASSWORD_RESET_REQUEST.url,
        PasswordResetRequestResponseSchema,
        data
      );

      if (!result.success) {
        throw result.error;
      }

      return result.data;
    },
    onSuccess: (data) => {
      // Call user-provided success handler
      if (options?.onSuccess) {
        options.onSuccess(data);
      }
    },
    onError: (error) => {
      // Log error
      errorTracker.captureException(
        error instanceof Error ? error : new Error(String(error))
      );

      // Call user-provided error handler
      if (options?.onError) {
        options.onError(
          error instanceof Error ? error : new Error(String(error))
        );
      }
    },
  });
};

// Options type for password reset confirmation hook
type UsePasswordResetConfirmMutationOptions = {
  onSuccess?: (response: PasswordResetConfirmResponse) => void;
  onError?: (error: Error) => void;
};

/**
 * Hook for confirming a password reset with token and new password
 * @param options Success and error callbacks
 * @returns Mutation object for confirming password reset
 */
export const usePasswordResetConfirmMutation = (
  options?: UsePasswordResetConfirmMutationOptions
) => {
  return useMutation({
    mutationFn: async (data: PasswordResetConfirmPayload) => {
      const result = await apiClient.post(
        API_ENDPOINTS.AUTH.PASSWORD_RESET_CONFIRM.url,
        PasswordResetConfirmResponseSchema,
        data
      );

      if (!result.success) {
        throw result.error;
      }

      return result.data;
    },
    onSuccess: (data) => {
      // Call user-provided success handler
      if (options?.onSuccess) {
        options.onSuccess(data);
      }
    },
    onError: (error) => {
      // Log error
      errorTracker.captureException(
        error instanceof Error ? error : new Error(String(error))
      );

      // Call user-provided error handler
      if (options?.onError) {
        options.onError(
          error instanceof Error ? error : new Error(String(error))
        );
      }
    },
  });
};
