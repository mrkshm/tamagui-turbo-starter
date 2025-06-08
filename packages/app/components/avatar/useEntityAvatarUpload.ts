import { useState, useEffect } from 'react';
import { useInteractionState } from '@bbook/utils';
import { DialogState } from './types';

type EntityType = 'user' | 'contact';

interface UseEntityAvatarUploadProps {
  entityType: EntityType;
  entityId: string;
  currentAvatarUrl?: string | null;
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

export function useEntityAvatarUpload({
  entityType,
  entityId,
  currentAvatarUrl,
  onSuccess,
  onError,
}: UseEntityAvatarUploadProps) {
  // State for the dialog
  const [dialogState, setDialogState] = useState<DialogState>('initial');
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(
    currentAvatarUrl || null
  );

  // Dialog interaction state
  const dialogInteraction = useInteractionState();

  // Handle upload progress
  const handleProgress = (progress: number) => {
    setProgress(progress);
  };

  // Handle successful upload
  const handleUploadSuccess = () => {
    setDialogState('initial');
    setPreviewUrl(null);
    setProgress(0);
    setIsLoading(false);
    dialogInteraction.onOut();
    onSuccess?.();
  };

  // Handle upload error
  const handleUploadError = (error: Error) => {
    console.error('Upload error:', error);
    setError(error.message);
    setDialogState('initial');
    setIsLoading(false);
    onError?.(error);
  };

  // Handle delete success
  const handleDeleteSuccess = () => {
    setPreviewUrl(null);
    setDialogState('initial');
    setIsLoading(false);
    dialogInteraction.onOut();
    onSuccess?.();
  };

  // Handle delete error
  const handleDeleteError = (error: Error) => {
    console.error('Delete error:', error);
    setError(error.message);
    setIsLoading(false);
    onError?.(error);
  };

  // Update preview URL when currentAvatarUrl changes
  useEffect(() => {
    setPreviewUrl(currentAvatarUrl || null);
  }, [currentAvatarUrl]);

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
    setPreviewUrl(currentAvatarUrl || null);
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
    previewUrl,
    setPreviewUrl,

    // Handlers
    handleProgress,
    handleUploadSuccess,
    handleUploadError,
    handleDeleteSuccess,
    handleDeleteError,
    validateFileSize,
    handleCancel,
    handleClosePreview,

    // Dialog controls
    dialogInteraction,
  };
}

// Re-export types
export type { DialogState };
