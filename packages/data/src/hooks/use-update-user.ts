import { useMutation, useQueryClient } from '@tanstack/react-query';
import { API_ENDPOINTS } from '../endpoints';
import { apiClient } from '../fetcher';
import type { ProfilePayload, User } from '../schemas/user';
import { userSchema } from '../schemas/user';
import { tokenService } from '../services/token-service';
import { errorTracker } from '../services/error-tracking';

export type UserApiResponse = {
  success: boolean;
  data: User | null;
  error?: string;
};

interface UseUpdateUserOptions {
  userId?: string;
}

/**
 * Patch the current (or given) user with partial updates.
 * Mirrors the behaviour of useUpdateContact for API consistency.
 */
export function useUpdateUser({
  userId = 'current_user',
}: UseUpdateUserOptions = {}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (updates: ProfilePayload): Promise<UserApiResponse> => {
      try {
        const token = await tokenService.getValidToken(userId);
        if (!token) {
          throw new Error('No valid authentication token available');
        }

        const result = await apiClient.patch<User>(
          API_ENDPOINTS.USER.UPDATE_PROFILE.url,
          userSchema,
          updates,
          { userId }
        );

        if (!result || typeof result !== 'object') {
          throw new Error('Invalid response from server');
        }

        if (!result.success) {
          throw new Error('Failed to update contact');
        }

        return {
          success: true as const,
          data: result.data,
        };
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        errorTracker.captureException(
          error instanceof Error ? error : new Error(message)
        );
        return {
          success: false as const,
          data: null,
          error: message,
        };
      }
    },
    onSuccess: (data) => {
      if (data.success && data.data) {
        queryClient.setQueryData(['currentUser'], data.data);
      }
    },
  });
}
