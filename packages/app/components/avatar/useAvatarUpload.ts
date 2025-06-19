import { useState } from 'react';
import { useInteractionState } from '@bbook/utils';
import {
  useUpdateUserAvatar,
  useDeleteUserAvatar,
  useUploadContactAvatar,
  useDeleteContactAvatar,
  useCurrentUser,
  AvatarEntityType,
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

  // Mutations depending on entity type
  const baseUploadMutation = (
    entityType === 'user' ? useUpdateUserAvatar : useUploadContactAvatar
  )({
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

  // Wrap upload mutation to unify signature: always accept File
  const uploadMutation = {
    ...baseUploadMutation,
    mutateAsync: (file: File) =>
      entityType === 'user'
        ? (baseUploadMutation as any).mutateAsync(file)
        : (baseUploadMutation as any).mutateAsync({ id: entityId, file }),
  } as typeof baseUploadMutation & {
    mutateAsync: (file: File) => Promise<any>;
  };

  const deleteMutation =
    entityType === 'user' ? useDeleteUserAvatar() : useDeleteContactAvatar();

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
        await (deleteMutation as any).mutateAsync();
      } else {
        await (deleteMutation as any).mutateAsync(entityId);
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
