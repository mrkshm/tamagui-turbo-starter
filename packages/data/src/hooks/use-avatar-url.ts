import { useQuery } from '@tanstack/react-query';
import { tokenService } from '../services/token-service';
import { API_BASE_URL } from '../constants/config';

type UseAvatarUrlOptions = {
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
export function useAvatarUrl(
  avatarPath?: string,
  options: UseAvatarUrlOptions = {}
) {
  // Default options
  const {
    enabled = !!avatarPath,
    staleTime = 1000 * 60 * 50, // 50 minutes (pre-signed URLs last 1 hour)
    gcTime = 1000 * 60 * 60, // 60 minutes
  } = options;

  return useQuery({
    queryKey: ['avatar', avatarPath],
    queryFn: async () => {
      if (!avatarPath) return null;

      // Get a valid token for the current user
      const token = await tokenService.getValidToken('current_user');

      if (!token) {
        throw new Error('No valid authentication token available');
      }

      // Clean the path if it starts with a slash
      const cleanPath = avatarPath.startsWith('/')
        ? avatarPath.substring(1)
        : avatarPath;

      // Construct the URL for the avatar endpoint
      const url = `${API_BASE_URL}/users/avatars/${cleanPath}`;

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
    enabled,
    staleTime,
    gcTime,
  });
}
