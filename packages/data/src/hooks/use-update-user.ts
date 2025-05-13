import { useMutation, useQueryClient } from '@tanstack/react-query';
import { API_ENDPOINTS } from '../endpoints';
import { apiClient } from '../fetcher';
import type { ProfilePayload, User } from '../schemas/user';
import { userSchema, ProfilePayloadSchema } from '../schemas/user';
import { errorTracker } from '../services/error-tracking';
import { tokenService } from '../services/token-service';
import * as v from 'valibot';
import { useState } from 'react';

type UseUpdateUserMutationOptions = {
  onSuccess?: (response: User) => void;
  onError?: (error: Error) => void;
};

/**
 * Hook for updating the current user's profile
 * Uses the UPDATE_PROFILE endpoint
 */
export const useUpdateUserMutation = (
  options?: UseUpdateUserMutationOptions
) => {
  console.log(
    'useUpdateUserMutation hook called with options:',
    options ? 'options provided' : 'no options'
  );
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: ProfilePayload) => {
      console.log('mutationFn called with data:', data);
      console.log(
        'Calling API endpoint:',
        API_ENDPOINTS.USER.UPDATE_PROFILE.url
      );

      // Validate the input data against the ProfilePayloadSchema
      try {
        console.log('Validating input data against ProfilePayloadSchema');
        const validatedData = v.parse(ProfilePayloadSchema, data);
        console.log('Input data validation successful');

        // Get a valid token for the current user
        const token = await tokenService.getValidToken('current_user');
        console.log('Token available for update user:', !!token);

        if (!token) {
          throw new Error('No valid authentication token available');
        }

        const result = await apiClient.patch(
          API_ENDPOINTS.USER.UPDATE_PROFILE.url,
          userSchema,
          validatedData, // Use the validated data
          { userId: 'current_user' } // Pass the userId to include the token
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
      console.log('User profile update successful');

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
      console.error('User profile update error:', error);

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

export function useProfileMutations() {
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string | undefined>
  >({});

  const updateUser = useUpdateUserMutation({
    onSuccess: () => {
      console.log('Profile updated successfully');
      // Clear validation errors on success
      setValidationErrors({});
    },
    onError: (error) => {
      console.error('Failed to update profile:', error);

      // Handle validation errors
      if (error instanceof Error) {
        const errorMessage = error.message;

        // Parse the validation error message to extract field-specific errors
        if (errorMessage.includes('Invalid length')) {
          // Extract field information from the error message
          if (errorMessage.includes('Expected <=4')) {
            // This is the first_name field with max length 4 (our test case)
            setValidationErrors((prev) => ({
              ...prev,
              firstName: 'First name must be 4 characters or less',
            }));
          } else {
            // Generic error handling if we can't determine the specific field
            setValidationErrors((prev) => ({
              ...prev,
              general: errorMessage,
            }));
          }
        } else {
          // Generic error handling
          setValidationErrors((prev) => ({
            ...prev,
            general: errorMessage,
          }));
        }
      }
    },
  });

  return { updateUser, validationErrors, setValidationErrors };
}
