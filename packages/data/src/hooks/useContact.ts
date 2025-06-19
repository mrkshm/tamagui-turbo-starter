import {
  useQuery,
  useMutation,
  useQueryClient,
  UseQueryResult,
} from '@tanstack/react-query';
import { tokenService } from '../services/token-service';
import {
  type Contact,
  type ContactApiResponse,
  contactSchema,
} from '../schemas/contacts';
import { apiClient } from '../fetcher';
import { API_BASE_URL } from '../constants/config';
import { API_ENDPOINTS } from '../endpoints';

// Query keys
export const contactQueryKeys = {
  all: ['contacts'] as const,
  lists: () => [...contactQueryKeys.all, 'list'] as const,
  list: (filters: Record<string, unknown> = {}) =>
    [...contactQueryKeys.lists(), { filters }] as const,
  details: () => [...contactQueryKeys.all, 'detail'] as const,
  detail: (id: string) => [...contactQueryKeys.details(), id] as const,
};

// Types
export type ContactQueryResult = UseQueryResult<ContactApiResponse, Error>;

interface UseContactOptions {
  enabled?: boolean;
  onSuccess?: (response: ContactApiResponse) => void;
  onError?: (error: Error) => void;
  userId?: string;
}

// Type guard for successful response
// Type guards
export function isSuccessResponse(
  response: ContactApiResponse
): response is Extract<ContactApiResponse, { success: true }> {
  return response.success;
}
export function isErrorResponse(
  response: ContactApiResponse
): response is Extract<ContactApiResponse, { success: false }> {
  return !response.success;
}

/**
 * Hook to fetch a single contact by slug
 */
export function useContact(
  slug: string,
  {
    enabled = true,
    onSuccess,
    onError,
    userId = 'current_user',
  }: UseContactOptions = {}
): ContactQueryResult {
  type QueryFnData = ContactApiResponse;

  const queryOptions: any = {
    queryKey: contactQueryKeys.detail(slug),
    queryFn: async (): Promise<QueryFnData> => {
      try {
        const token = await tokenService.getValidToken(userId);
        if (!token) {
          throw new Error('No valid authentication token available');
        }

        // The API returns a plain Contact object
        // Use contactSchema to validate it
        const validationResult = await apiClient.get<Contact>(
          API_ENDPOINTS.CONTACTS.GET_CONTACT.url(slug),
          contactSchema,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        // apiClient.get returns a ValidationResult<T> which is already
        // in the format { success: true, data: T } or { success: false, error: ... }
        // This matches our ContactApiResponse type
        return validationResult as unknown as ContactApiResponse;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Failed to load contact';
        return {
          success: false as const,
          error: errorMessage,
          data: null,
        };
      }
    },
    enabled: enabled && !!slug,
  };

  if (onSuccess) {
    queryOptions.onSuccess = onSuccess;
  }
  if (onError) {
    queryOptions.onError = onError;
  }

  return useQuery<ContactApiResponse, Error>(queryOptions);
}

/**
 * Types and hooks for contact mutations
 */
type UpdateContactVariables = Partial<
  Omit<Contact, 'id' | 'created_at' | 'updated_at'>
>;

interface UseUpdateContactOptions {
  userId?: string;
}

export function useUpdateContact(
  slug: string,
  { userId = 'current_user' }: UseUpdateContactOptions = {}
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      updates: UpdateContactVariables
    ): Promise<ContactApiResponse> => {
      try {
        const token = await tokenService.getValidToken(userId);
        if (!token) {
          throw new Error('No valid authentication token available');
        }

        const result = await apiClient.patch<Contact>(
          `/contacts/${slug}/`,
          contactSchema,
          updates,
          { skipAuth: false, userId }
        );

        if (!result.success) {
          throw new Error('Failed to update contact');
        }

        return {
          success: true as const,
          data: result.data,
        };
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Failed to update contact';
        return {
          success: false as const,
          error: errorMessage,
          data: null,
        };
      }
    },
    onSuccess: (data) => {
      queryClient.setQueryData(contactQueryKeys.detail(slug), data);
      queryClient.invalidateQueries({ queryKey: contactQueryKeys.lists() });
    },
  });
}

interface UseUploadContactAvatarOptions {
  userId?: string;
  /** Optional progress callback (0-100) */
  onProgress?: (progress: number) => void;
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

// Duplicate useDeleteContactAvatar removed to avoid redeclaration
/*
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['deleteContactAvatar'],
    mutationFn: async (id: string) => {
      const token = await tokenService.getValidToken('current_user');
      if (!token) {
        throw new Error('No valid authentication token available');
      }

      const response = await fetch(`${API_BASE_URL}/api/v1/contacts/${id}/avatar`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || 'Failed to delete avatar');
      }

      const result = await response.json();
      return result.avatar_path as string | null;
    },
    onSuccess: (_, id) => {
      // Invalidate queries for this contact and contact lists
      queryClient.invalidateQueries({ queryKey: contactQueryKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: contactQueryKeys.lists() });
    },
  });
}

*/

export function useUploadContactAvatar({
  userId = 'current_user',
  onProgress,
  onSuccess: externalSuccess,
  onError: externalError,
}: UseUploadContactAvatarOptions = {}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['uploadContactAvatar', userId],
    mutationFn: async ({ id, file }: { id: string; file: File }) => {
      const formData = new FormData();
      formData.append('file', file);

      const token = await tokenService.getValidToken('current_user');
      if (!token) {
        throw new Error('No valid authentication token available');
      }

      // We cannot get granular upload progress with fetch; notify start (0) and finish (100)
      onProgress?.(0);

      const response = await fetch(`${API_BASE_URL}/contacts/${id}/avatar/`, {        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || 'Failed to upload avatar');
      }

      const result = await response.json();
      onProgress?.(100);
      return result.avatar_path;
    },
    onSuccess: (avatarPath, { id }) => {
      queryClient.setQueryData<Contact | undefined>(
        contactQueryKeys.detail(id),
        (old) => (old ? { ...old, avatar_path: avatarPath } : undefined)
      );
      queryClient.invalidateQueries({ queryKey: contactQueryKeys.lists() });
      externalSuccess?.();
    },
    onError: (error: Error) => {
      externalError?.(error);
    },
  });
}

interface UseDeleteContactAvatarOptions {
  userId?: string;
}

export function useDeleteContactAvatar({
  userId = 'current_user',
}: UseDeleteContactAvatarOptions = {}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['deleteContactAvatar', userId],
    mutationFn: async (id: string) => {
      const token = await tokenService.getValidToken(userId);
      if (!token) {
        throw new Error('No valid authentication token available');
      }

      const response = await fetch(
        `${API_BASE_URL}/api/v1/contacts/${id}/avatar`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || 'Failed to delete avatar');
      }
    },
    onSuccess: (_, id) => {
      queryClient.setQueryData<Contact | undefined>(
        contactQueryKeys.detail(id),
        (old) => (old ? { ...old, avatar_path: null } : undefined)
      );
      queryClient.invalidateQueries({ queryKey: contactQueryKeys.lists() });
    },
  });
}
