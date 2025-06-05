import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { API_ENDPOINTS } from '../endpoints';
import { apiClient } from '../fetcher';
import { CheckUsernameResponse } from '../endpoints/user';
import * as v from 'valibot';
import { useDebouncedCallback } from 'use-debounce';

// Schema for username check response
const CheckUsernameResponseSchema = v.object({
  available: v.boolean(),
});

type UseCheckUsernameMutationOptions = {
  onSuccess?: (response: CheckUsernameResponse) => void;
  onError?: (error: Error) => void;
};

/**
 * Hook for checking if a username is available
 * Uses the CHECK_USERNAME endpoint
 */
export const useCheckUsernameMutation = (
  options?: UseCheckUsernameMutationOptions
) => {
  return useMutation({
    mutationFn: async (username: string) => {
      if (!username || username.trim() === '') {
        return { available: false };
      }

      try {
        const result = await apiClient.get(
          API_ENDPOINTS.USER.CHECK_USERNAME.url,
          CheckUsernameResponseSchema,
          { params: { username } }
        );

        if (!result.success) {
          throw result.error;
        }

        return result.data;
      } catch (error) {
        console.error('Username check error:', error);
        throw error instanceof Error ? error : new Error(String(error));
      }
    },
    onSuccess: (data) => {
      if (options?.onSuccess) {
        options.onSuccess(data);
      }
    },
    onError: (error) => {
      console.error('Username check error:', error);
      if (options?.onError) {
        options.onError(
          error instanceof Error ? error : new Error(String(error))
        );
      }
    },
  });
};

/**
 * Hook for checking username availability with debouncing
 */
export const useUsernameCheck = (debounceMs: number = 500) => {
  const [isChecking, setIsChecking] = useState(false);
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [lastCheckedUsername, setLastCheckedUsername] = useState<string>('');

  const checkUsernameMutation = useCheckUsernameMutation({
    onSuccess: (data) => {
      setIsAvailable(data.available);
      setIsChecking(false);
    },
    onError: (err) => {
      setError(err.message);
      setIsAvailable(null);
      setIsChecking(false);
    },
  });

  // Create a debounced version of the username check
  const debouncedMutate = useDebouncedCallback(
    (username: string) => {
      setIsChecking(true);
      checkUsernameMutation.mutate(username);
    },
    debounceMs
  );

  const checkUsername = (username: string) => {
    // Don't check if the username is the same as the last checked one
    if (username === lastCheckedUsername) {
      return;
    }

    // Reset state for new check
    setLastCheckedUsername(username);
    setError(null);
    
    if (!username || username.trim() === '') {
      setIsAvailable(null);
      return;
    }

    // Use the debounced function instead of calling mutate directly
    debouncedMutate(username);
  };

  return {
    isChecking,
    isAvailable,
    error,
    checkUsername,
  };
};
