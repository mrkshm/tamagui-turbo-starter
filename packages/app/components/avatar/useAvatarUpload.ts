import { useState } from 'react';
import { useInteractionState } from '@bbook/utils';
import {
  useUpdateUserAvatar,
  useDeleteUserAvatar,
  useUploadContactAvatar,
  useDeleteContactAvatar,
  useCurrentUser,
  AvatarEntityTypeLiteral,
} from '@bbook/data';
import { DialogState } from './types';

interface UseAvatarUploadOptions {
  entityType: AvatarEntityTypeLiteral;
  entityId: string;
  currentAvatarUrl?: string | null;
}

export function useAvatarUpload({
  entityType,
  entityId,
}: UseAvatarUploadOptions) {
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

  // User refetch (only relevant for user entity)
  const { refetch: refetchUser } = useCurrentUser();

  // Mutations (hooks must be called unconditionally)
  const userUploadMutation = useUpdateUserAvatar({
    onProgress: (progress: number) => setProgress(progress),
    onSuccess: () => {
      if (entityType === 'user') {
        refetchUser();
      }
      setDialogState('initial');
      setPreviewUrl(null);
      setSelectedImageUri(null);
      setSelectedFileName(null);
      setProgress(0);
      setIsLoading(false);
      dialogInteraction.onOut();
    },
    onError: (error: Error) => {
      console.error('Upload error:', error);
      setError(error.message);
      setDialogState('initial');
      setIsLoading(false);
    },
  });
  const contactUploadMutation = useUploadContactAvatar({
    onProgress: (progress: number) => setProgress(progress),
    onSuccess: () => {
      // For contact, just reset UI state
      setDialogState('initial');
      setPreviewUrl(null);
      setSelectedImageUri(null);
      setSelectedFileName(null);
      setProgress(0);
      setIsLoading(false);
      dialogInteraction.onOut();
    },
    onError: (error: Error) => {
      console.error('Upload error:', error);
      setError(error.message);
      setDialogState('initial');
      setIsLoading(false);
    },
  });

  // Wrap upload mutation to unify signature: always accept File
  const uploadMutation = {
    mutateAsync: (file: File) =>
      entityType === 'user'
        ? (userUploadMutation as any).mutateAsync(file)
        : (contactUploadMutation as any).mutateAsync({ id: entityId, file }),
    // Pass-through common fields from the selected mutation
    get status() {
      return (entityType === 'user' ? (userUploadMutation as any) : (contactUploadMutation as any)).status;
    },
  } as {
    mutateAsync: (file: File) => Promise<any>;
    status?: string;
  };

  const deleteUserMutation = useDeleteUserAvatar();
  const deleteContactMutation = useDeleteContactAvatar();

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

      if (entityType === 'user') {
        await (deleteUserMutation as any).mutateAsync();
      } else {
        await (deleteContactMutation as any).mutateAsync(entityId);
      }

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
