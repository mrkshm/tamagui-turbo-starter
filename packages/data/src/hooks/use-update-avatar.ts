import { useMutation, useQueryClient } from '@tanstack/react-query';
import { API_ENDPOINTS } from '../endpoints';
import type { User } from '../schemas/user';
import { errorTracker } from '../services/error-tracking';
import { tokenService } from '../services/token-service';
import { API_BASE_URL } from '../constants/config';

type UseUpdateUserAvatarOptions = {
  onSuccess?: (response: User) => void;
  onError?: (error: Error) => void;
  onProgress?: (progress: number) => void; // Progress callback (0-100)
};

/**
 * Hook for updating the current user's avatar
 * Uses the CHANGE_AVATAR endpoint
 */
export const useUpdateUserAvatar = (options?: UseUpdateUserAvatarOptions) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (file: File) => {
      console.log(
        'Starting avatar upload with file:',
        file.name,
        file.type,
        file.size
      );

      // FOR DEBUG PURPOSES: Force an error for testing error handling
      // DONT FORGET to comment out this block when done testing (doh)
      // if (true) {
      //   console.log('Simulating an upload error for testing');
      //   throw new Error(
      //     'Avatar upload failed: Image format not supported or file is corrupted'
      //   );
      // }

      // Get a valid token for the current user
      const token = await tokenService.getValidToken('current_user');

      if (!token) {
        throw new Error('No valid authentication token available');
      }

      // Create a new FormData object
      const formData = new FormData();

      // Add the file with the field name 'file' as expected by the backend
      formData.append('file', file, file.name);

      // Log FormData for debugging
      console.log('FormData created with file:', file.name);

      // Use XMLHttpRequest for progress tracking
      const apiUrl = `${API_BASE_URL}${API_ENDPOINTS.USER.CHANGE_AVATAR.url}`;
      console.log('Uploading to URL:', apiUrl);

      // Create a promise that will resolve with the response data
      const uploadPromise = new Promise<any>((resolve, reject) => {
        const xhr = new XMLHttpRequest();

        // Set up progress tracking
        xhr.upload.addEventListener('progress', (event) => {
          if (event.lengthComputable) {
            const progress = Math.round((event.loaded / event.total) * 100);
            console.log(`Upload progress: ${progress}%`);

            // Call the progress callback if provided
            if (options?.onProgress) {
              options.onProgress(progress);
            }
          }
        });

        // Set up completion handler
        xhr.addEventListener('load', () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            // Success
            try {
              const response = JSON.parse(xhr.responseText);
              resolve(response);
            } catch (error) {
              reject(new Error(`Failed to parse response: ${error}`));
            }
          } else {
            // Error
            reject(
              new Error(
                `Upload failed: ${xhr.status} ${xhr.statusText} - ${xhr.responseText}`
              )
            );
          }
        });

        // Set up error handler
        xhr.addEventListener('error', () => {
          reject(new Error('Network error during upload'));
        });

        // Set up abort handler
        xhr.addEventListener('abort', () => {
          reject(new Error('Upload aborted'));
        });

        // Open and send the request
        xhr.open('POST', apiUrl);
        xhr.setRequestHeader('Authorization', `Bearer ${token}`);
        xhr.send(formData);
      });

      // Wait for the upload to complete
      const responseData = await uploadPromise;
      console.log('Direct fetch success:', responseData);
      return responseData;
    },
    onSuccess: (data: User) => {
      // Invalidate user queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['user'] });

      // Call the onSuccess callback if provided
      if (options?.onSuccess) {
        options.onSuccess(data);
      }
    },
    onError: (error: Error) => {
      // Log the error
      errorTracker.captureException(error, {
        extra: { context: 'useUpdateUserAvatar' },
      });

      // Call the onError callback if provided
      if (options?.onError) {
        options.onError(error);
      }
    },
  });
};

/**
 * Hook for deleting the current user's avatar
 * Uses the DELETE_AVATAR endpoint
 */
export const useDeleteUserAvatar = (options?: UseUpdateUserAvatarOptions) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      console.log('Starting avatar deletion');

      // Get a valid token for the current user
      const token = await tokenService.getValidToken('current_user');

      if (!token) {
        throw new Error('No valid authentication token available');
      }

      // Use direct fetch for better control over the request
      const apiUrl = `${API_BASE_URL}${API_ENDPOINTS.USER.DELETE_AVATAR.url}`;
      console.log('Deleting avatar at URL:', apiUrl);

      const directResponse = await fetch(apiUrl, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('Direct fetch response for delete:', {
        status: directResponse.status,
        statusText: directResponse.statusText,
      });

      if (!directResponse.ok) {
        const errorText = await directResponse.text();
        console.error('Direct fetch error for delete:', errorText);
        throw new Error(
          `Delete failed: ${directResponse.status} ${directResponse.statusText} - ${errorText}`
        );
      }

      const responseData = await directResponse.json();
      console.log('Direct fetch success for delete:', responseData);
      return responseData;
    },
    onSuccess: (data: User) => {
      console.log('Avatar deletion successful in hook, invalidating queries');

      // Invalidate all user-related queries
      queryClient.invalidateQueries({ queryKey: ['currentUser'] });
      queryClient.invalidateQueries({ queryKey: ['user'] });

      // Also invalidate any avatar-related queries
      queryClient.invalidateQueries({ queryKey: ['avatar'] });

      // Force immediate refetch of critical queries
      queryClient.refetchQueries({ queryKey: ['currentUser'] });

      // Call the onSuccess callback if provided
      if (options?.onSuccess) {
        options.onSuccess(data);
      }
    },
    onError: (error: Error) => {
      // Log the error
      errorTracker.captureException(error, {
        extra: { context: 'useDeleteUserAvatar' },
      });

      // Call the onError callback if provided
      if (options?.onError) {
        options.onError(error);
      }
    },
  });
};
