import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { API_ENDPOINTS } from '../endpoints';
import { apiClient } from '../fetcher';
import type {
  LoginPayload,
  LoginResponse,
  SignupPayload,
  SignupResponse,
} from '../schemas/user';
import {
  LoginResponseSchema,
  SignupResponseSchema,
  userSchema,
  EmptyResponseSchema,
} from '../schemas/user';
import { tokenService } from '../services/token-service';
import { errorTracker } from '../services/error-tracking';

type UseLoginMutationOptions = {
  onSuccess?: (response: LoginResponse) => void;
  onError?: (error: Error) => void;
};

export const useLoginMutation = (options?: UseLoginMutationOptions) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (credentials: LoginPayload) => {
      const result = await apiClient.post(
        API_ENDPOINTS.AUTH.LOGIN.url,
        LoginResponseSchema,
        credentials
      );

      if (!result.success) {
        throw result.error;
      }

      // Store tokens
      await tokenService.storeTokens(
        result.data.access,
        result.data.refresh,
        'current_user' // Use consistent key for current user
      );

      return result.data;
    },
    onSuccess: (data) => {
      // Log success for debugging
      console.log('Login successful, invalidating currentUser query');
      console.log('User email:', data.email);

      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['currentUser'] });

      // Set current user data directly for immediate access
      queryClient.setQueryData(['currentUser'], { email: data.email });

      // Set user in error tracking
      errorTracker.setUser(data.email);

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

type UseSignupMutationOptions = {
  onSuccess?: (response: SignupResponse) => void;
  onError?: (error: Error) => void;
};

export const useSignupMutation = (options?: UseSignupMutationOptions) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: SignupPayload) => {
      const result = await apiClient.post(
        API_ENDPOINTS.AUTH.SIGNUP.url,
        SignupResponseSchema,
        data
      );

      if (!result.success) {
        throw result.error;
      }

      // Store tokens
      await tokenService.storeTokens(
        result.data.access,
        result.data.refresh,
        'current_user' // Use consistent key for current user
      );

      return result.data;
    },
    onSuccess: (data) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['currentUser'] });

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

interface CurrentUser {
  email: string;
  [key: string]: any;
}

export const useLogoutMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      console.log('Logging out user');
      // Get current user email
      const currentUser = queryClient.getQueryData<CurrentUser | null>([
        'currentUser',
      ]);
      const userId = currentUser?.email || 'current_user';

      // Get the current token
      const token = await tokenService.getValidToken(userId);

      if (token) {
        try {
          // Call the logout endpoint
          console.log('Calling logout endpoint');
          await apiClient.post(
            API_ENDPOINTS.AUTH.LOGOUT.url,
            EmptyResponseSchema,
            {},
            {
              headers: { Authorization: `Bearer ${token}` },
              skipValidation: true, // No response expected
            }
          );
        } catch (error) {
          console.error('Error calling logout endpoint:', error);
          // Continue with local logout even if API call fails
        }
      }

      // Remove tokens
      console.log('Removing tokens');
      await tokenService.removeTokens(userId);

      return true;
    },
    onSuccess: () => {
      console.log('Logout successful, clearing cache and user data');
      // Clear user from error tracking
      errorTracker.clearUser();

      // Clear user data from cache
      queryClient.setQueryData(['currentUser'], null);
      
      // Clear all queries from cache
      queryClient.clear();
    },
    onError: (error) => {
      errorTracker.captureException(
        error instanceof Error ? error : new Error(String(error))
      );

      // Even if the API call fails, we still want to remove tokens locally
      const currentUser = queryClient.getQueryData<CurrentUser | null>([
        'currentUser',
      ]);
      const userId = currentUser?.email || 'current_user';

      tokenService.removeTokens(userId).catch((e) => {
        console.error('Failed to remove tokens:', e);
      });
    },
  });
};

export const useCurrentUser = () => {
  return useQuery({
    queryKey: ['currentUser'],
    queryFn: async () => {
      console.log('Fetching current user data');
      // Try to get a valid token
      const token = await tokenService.getValidToken('current_user');
      console.log('Token available:', !!token);
      if (!token) return null;

      try {
        // Fetch user profile
        const result = await apiClient.get(
          API_ENDPOINTS.USER.GET_PROFILE_FOR_USER.url,
          userSchema,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        console.log('User profile fetch result:', result.success);
        return result.success ? result.data : null;
      } catch (error) {
        console.error('Error fetching user profile:', error);
        return null;
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: false, // Don't retry if token is invalid
  });
};
