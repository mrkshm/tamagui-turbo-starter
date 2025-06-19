import { useQuery } from '../query';
import { tokenService } from '../services/token-service';
import { API_BASE_URL } from '../constants/config';
import { getUserAvatarUrl } from '../endpoints/user';
import { getContactAvatarUrl } from '../endpoints/contacts';

type UseAvatarUrlArgs = {
  entityType: 'user' | 'contact';
  avatarPath: string;
  enabled?: boolean;
  staleTime?: number;
  gcTime?: number;
};

/**
 * Hook to fetch a pre-signed URL for an avatar image
 * @param avatarPath The path or ID of the avatar
 * @param options Query options
 * @returns The pre-signed URL for the avatar
 */
export function useAvatarUrl({
  entityType,
  avatarPath,
  enabled = true,
  staleTime = 1000 * 60 * 50, // 50 minutes (pre-signed URLs last 1 hour)
  gcTime = 1000 * 60 * 60, // 60 minutes
}: UseAvatarUrlArgs) {
  // Determine if query should run
  const finalEnabled = enabled && !!avatarPath;

  try {
    return useQuery({
      queryKey: ['avatar', entityType, avatarPath],
      queryFn: async () => {
        // Get a valid token for the current user
        const token = await tokenService.getValidToken('current_user');

        if (!token) {
          throw new Error('No valid authentication token available');
        }

        // Clean the path if it starts with a slash
        const cleanPath = avatarPath.startsWith('/')
          ? avatarPath.substring(1)
          : avatarPath;

        const endpointPath =
          entityType === 'user'
            ? getUserAvatarUrl(cleanPath)
            : getContactAvatarUrl(cleanPath);

        const url = `${API_BASE_URL}${endpointPath}`;

        // Fetch the pre-signed URL
        const response = await fetch(url, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error(
            `Failed to fetch avatar URL: ${response.status} ${response.statusText}`
          );
        }

        const data = await response.json();
        console.log('Avatar URL received from API:', data.url);

        // Return the URL exactly as received from the API
        return data.url; // Assuming the API returns { url: "pre-signed-url" }
      },
      enabled: finalEnabled,
      staleTime,
      gcTime,
    });
  } catch (error) {
    console.error('Error in useAvatarUrl:', error);
    return {
      data: null,
      isLoading: false,
      error:
        error instanceof Error
          ? error
          : new Error('Failed to fetch avatar URL'),
      isError: true,
      isSuccess: false,
      isPending: false,
    };
  }
}
