import { useState, useCallback } from 'react';
import { useUpdateUserAvatar } from './use-update-avatar';
import type { User } from '../schemas/user';
import { useQueryClient } from '@tanstack/react-query';

type UseUploadProgressOptions = {
  onSuccess?: (data: User) => void;
  onError?: (error: Error) => void;
};

/**
 * Custom hook for handling avatar uploads with progress tracking
 */
export function useUploadProgress(options?: UseUploadProgressOptions) {
  // Track upload progress
  const [progress, setProgress] = useState(0);
  
  // Get query client for invalidation
  const queryClient = useQueryClient();
  
  // Get the mutation from the original hook
  const mutation = useUpdateUserAvatar({
    onSuccess: (data) => {
      // Set progress to 100% when complete
      setProgress(100);
      
      // Aggressively invalidate all user-related queries to ensure UI updates
      queryClient.invalidateQueries({ queryKey: ['user'] });
      
      // Force refetch of all user-related queries to ensure they update immediately
      // First, invalidate and refetch the current user data
      queryClient.invalidateQueries({ queryKey: ['currentUser'] });
      queryClient.refetchQueries({ queryKey: ['currentUser'] });
      
      // Then, handle avatar-specific queries
      if (data?.avatar_path) {
        // Invalidate and refetch the specific avatar path
        queryClient.invalidateQueries({ queryKey: ['avatar', data.avatar_path] });
        queryClient.refetchQueries({ queryKey: ['avatar', data.avatar_path] });
        
        // Also invalidate any other avatar queries that might exist
        queryClient.invalidateQueries({ 
          predicate: (query) => {
            return query.queryKey[0] === 'avatar' && query.queryKey[1] !== data.avatar_path;
          }
        });
      } else {
        // If no specific path, invalidate all avatar queries
        queryClient.invalidateQueries({ queryKey: ['avatar'] });
      }
      
      // Call the original onSuccess if provided
      if (options?.onSuccess) {
        options.onSuccess(data);
      }
    },
    onError: (error) => {
      // Reset progress on error
      setProgress(0);
      
      // Call the original onError if provided
      if (options?.onError) {
        options.onError(error);
      }
    },
    // Use the progress callback from the hook
    onProgress: (progressValue) => {
      setProgress(progressValue);
    },
  });
  
  // Reset progress
  const resetProgress = useCallback(() => {
    setProgress(0);
  }, []);
  
  return {
    ...mutation,
    progress,
    resetProgress,
  };
}
