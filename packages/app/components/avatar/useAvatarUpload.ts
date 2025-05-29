import { useState } from 'react';
import { useInteractionState } from '@bbook/utils';
import {
  useUpdateUserAvatar,
  useDeleteUserAvatar,
  useCurrentUser,
} from '@bbook/data';
import { DialogState } from './types';

export function useAvatarUpload() {
  // State for the dialog
  const [dialogState, setDialogState] = useState<DialogState>('initial');
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  // Selected image state
  const [selectedImageUri, setSelectedImageUri] = useState<string | null>(null);
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Dialog interaction state
  const dialogInteraction = useInteractionState();

  // User data and mutations
  const { data: userData, refetch: refetchUser } = useCurrentUser();
  const uploadMutation = useUpdateUserAvatar({
    onProgress: (progress) => setProgress(progress),
    onSuccess: () => {
      refetchUser();
      setDialogState('initial');
      setPreviewUrl(null);
      setSelectedImageUri(null);
      setSelectedFileName(null);
      setProgress(0);
      setIsLoading(false);
      dialogInteraction.onOut();
    },
    onError: (error) => {
      console.error('Upload error:', error);
      setError(error.message);
      setDialogState('initial');
      setIsLoading(false);
    },
  });

  const deleteMutation = useDeleteUserAvatar();

  // Validate file size
  const validateFileSize = (size: number): boolean => {
    if (size > 5 * 1024 * 1024) {
      setError('Image is too large (max 5MB)');
      setDialogState('preview');
      setIsLoading(false);
      return false;
    }
    return true;
  };

  // Handle cancel button press
  const handleCancel = () => {
    dialogInteraction.onOut();
  };

  // Handle preview close
  const handleClosePreview = () => {
    setDialogState('initial');
    setPreviewUrl(null);
    setSelectedImageUri(null);
    setSelectedFileName(null);
  };

  // Handle delete avatar
  const handleDeleteAvatar = async () => {
    try {
      setIsLoading(true);
      setError(null);

      await deleteMutation.mutateAsync();

      // Success case
      setIsLoading(false);
      dialogInteraction.onOut();
    } catch (error) {
      console.error('Delete error:', error);
      setError((error as Error).message);
      setIsLoading(false);
    }
  };

  return {
    // State
    dialogState,
    setDialogState,
    error,
    setError,
    progress,
    isLoading,
    setIsLoading,
    selectedImageUri,
    setSelectedImageUri,
    selectedFileName,
    setSelectedFileName,
    previewUrl,
    setPreviewUrl,
    dialogInteraction,

    // Methods
    validateFileSize,
    handleCancel,
    handleClosePreview,
    handleDeleteAvatar,
    uploadMutation,
  };
}
