import { useMutation } from '@tanstack/react-query';
import { API_ENDPOINTS } from '../endpoints';
import { apiClient } from '../fetcher';
import { ResendVerificationResponseSchema } from '../schemas/user';
import type { ResendVerificationPayload, ResendVerificationResponse } from '../schemas/user';
import { errorTracker } from '../services/error-tracking';

type UseResendVerificationMutationOptions = {
  onSuccess?: (response: ResendVerificationResponse) => void;
  onError?: (error: Error) => void;
};

export const useResendVerificationMutation = (
  options?: UseResendVerificationMutationOptions
) => {
  return useMutation({
    mutationFn: async (data: ResendVerificationPayload) => {
      const result = await apiClient.post(
        API_ENDPOINTS.AUTH.RESEND_VERIFICATION.url,
        ResendVerificationResponseSchema,
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
