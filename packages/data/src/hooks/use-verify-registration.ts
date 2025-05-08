import { useMutation } from '@tanstack/react-query';
import { API_ENDPOINTS } from '../endpoints';
import { apiClient } from '../fetcher';
import { VerifyRegistrationResponseSchema } from '../schemas/user';
import type { VerifyRegistrationResponse } from '../schemas/user';
import { tokenService } from '../services/token-service';
import { errorTracker } from '../services/error-tracking';

type UseVerifyRegistrationMutationOptions = {
  onSuccess?: (response: VerifyRegistrationResponse) => void;
  onError?: (error: Error) => void;
};

export const useVerifyRegistrationMutation = (
  options?: UseVerifyRegistrationMutationOptions
) => {
  return useMutation({
    mutationFn: async (token: string) => {
      const result = await apiClient.get(
        `${API_ENDPOINTS.AUTH.VERIFY_REGISTRATION.url}?token=${token}`,
        VerifyRegistrationResponseSchema
      );

      if (!result.success) {
        throw result.error;
      }

      // Store tokens after successful verification
      await tokenService.storeTokens(
        result.data.access,
        result.data.refresh,
        'current_user' // Use consistent key for current user
      );

      return result.data;
    },
    onSuccess: (data) => {
      // Set user in error tracking
      // We don't have the email in the response, but we can set the user based on other data
      errorTracker.setUser('verified_user');

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
