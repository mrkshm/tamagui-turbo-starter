import { API_ENDPOINTS } from '../endpoints';
import { apiClient } from '../fetcher';
import { UpdateUsernameSchema, UpdateUsernameResponseSchema, UpdateUsernameResponse } from '../schemas/user';
import { errorTracker } from '../services/error-tracking';
import { tokenService } from '../services/token-service';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import * as v from 'valibot';

type UseUpdateUsernameMutationOptions = {
  onSuccess?: (response: UpdateUsernameResponse) => void;
  onError?: (error: Error) => void;
};

/**
 * Hook for updating the current user's username
 * Uses the UPDATE_USERNAME endpoint
 */
export const useUpdateUsernameMutation = (
  options?: UseUpdateUsernameMutationOptions
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (username: string) => {
      console.log('useUpdateUsernameMutation called with username:', username);

      try {
        // Validate the username
        const validatedData = v.parse(UpdateUsernameSchema, { username });
        console.log('Username validation successful');

        // Get a valid token for the current user
        const token = await tokenService.getValidToken('current_user');
        console.log('Token available for update username:', !!token);

        if (!token) {
          throw new Error('No valid authentication token available');
        }

        // Make the API call to update username - only send the username field
        const result = await apiClient.patch(
          API_ENDPOINTS.USER.UPDATE_USERNAME.url,
          UpdateUsernameResponseSchema, // Use the proper response schema
          validatedData, // Just send the validated username object
          {
            userId: 'current_user',
          }
        );

        if (!result.success) {
          throw result.error;
        }

        return result.data;
      } catch (error) {
        console.error('Validation or API error:', error);
        throw error instanceof Error ? error : new Error(String(error));
      }
    },
    onSuccess: (data) => {
      // Log success for debugging
      console.log('Username update successful', data);

      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['currentUser'] });
      
      // Update the cache with the new user data
      queryClient.setQueryData(['currentUser'], data);

      // Call user-provided success handler
      if (options?.onSuccess) {
        options.onSuccess(data);
      }
    },
    onError: (error) => {
      console.error('Username update error:', error);

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
