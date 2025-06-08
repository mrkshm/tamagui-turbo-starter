import React from 'react';
import { AvatarWithUrl } from '../avatar/AvatarWithUrl';
import { CButton, Progress } from '@bbook/ui';
import { Dialog, YStack, XStack, Text, Trash, Upload, X } from '@bbook/ui';
import { useTranslation } from '@bbook/i18n';

interface ContactAvatarUploaderProps {
  contactSlug: string;
  currentAvatarUrl: string | null;
  size?: 'sm' | 'md' | 'lg';
  circular?: boolean;
  onUploadComplete: (file: File) => Promise<void>;
  onDeleteAvatar: () => Promise<boolean>;
  onError?: (error: Error) => boolean;
}

// Web-specific Dialog component
const DialogContents = ({
  dialogState,
  hasImage,
  isLoading,
  error,
  progress,
  previewUrl,
  onFileInputClick,
  onDeleteAvatar,
  onCancel,
  onUpload,
  onClosePreview,
  onChooseFromGallery,
  onTakePhoto,
  circular = true,
}: any) => {
  const { t } = useTranslation();

  return (
    <YStack gap="$4" width="100%">
      <Text fontSize="$6" textAlign="center" marginBottom="$4">
        {dialogState === 'initial'
          ? hasImage
            ? t('common:modify_avatar')
            : t('common:upload_avatar')
          : dialogState === 'preview'
            ? t('common:preview')
            : t('common:uploading')}
      </Text>

      {error && (
        <Text color="$red10" textAlign="center">
          {error}
        </Text>
      )}

      <YStack alignItems="center" marginVertical="$4">
        <AvatarWithUrl size="lg" imagePath={previewUrl} circular={circular} />
      </YStack>

      {dialogState === 'uploading' && (
        <YStack gap="$2">
          <Progress value={progress} max={100}>
            <Progress.Indicator animation="bouncy" />
          </Progress>
          <Text textAlign="center">{Math.round(progress)}%</Text>
        </YStack>
      )}

      <XStack gap="$4" justifyContent="center">
        {dialogState === 'preview' ? (
          <>
            <CButton variant="outline" onPress={onCancel} icon={<X />}>
              {t('common:cancel')}
            </CButton>
            <CButton onPress={onUpload} icon={<Upload />}>
              {t('common:upload')}
            </CButton>
          </>
        ) : dialogState === 'initial' ? (
          <>
            {hasImage && (
              <CButton
                variant="outline"
                onPress={onDeleteAvatar}
                icon={<Trash />}
              >
                {t('common:delete')}
              </CButton>
            )}
            <CButton onPress={onFileInputClick} icon={<Upload />}>
              {hasImage ? t('common:change') : t('common:upload')}
            </CButton>
          </>
        ) : null}
      </XStack>
    </YStack>
  );
};

export function ContactAvatarUploader({
  currentAvatarUrl,
  size = 'md',
  circular = true,
  onUploadComplete,
  onDeleteAvatar,
  onError,
}: ContactAvatarUploaderProps) {
  const { t } = useTranslation();
  const [selectedImageUri, setSelectedImageUri] = React.useState<string | null>(
    null
  );
  const [selectedFileName, setSelectedFileName] = React.useState<string | null>(
    null
  );

  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const [isLoading, setIsLoading] = React.useState(false);
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [previewUrl, setPreviewUrl] = React.useState<string | null>(
    currentAvatarUrl || null
  );
  const [error, setError] = React.useState<Error | null>(null);
  const [dialogState, setDialogState] = React.useState('initial');
  const [progress, setProgress] = React.useState(0);

  // Handle dialog open/close
  const handleOpenDialog = () => {
    setIsDialogOpen(true);
    setError(null);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setPreviewUrl(currentAvatarUrl || null);
    setError(null);
  };

  // Handle file selection
  const handleFileInputChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Basic file type validation
    if (!file.type.startsWith('image/')) {
      setError(new Error('Please select an image file'));
      return;
    }

    // File size validation (5MB max)
    const MAX_SIZE = 5 * 1024 * 1024; // 5MB
    if (file.size > MAX_SIZE) {
      setError(new Error('Image size must be less than 5MB'));
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewUrl(e.target?.result as string);
    };
    reader.onerror = () => {
      setError(new Error('Failed to read file'));
    };
    reader.readAsDataURL(file);
  };

  // Handle cancel
  const handleCancel = () => {
    setDialogState('initial');
    setError(null);
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Helper function to convert data URL to File
  const urlToFile = async (url: string, filename: string): Promise<File> => {
    const response = await fetch(url);
    const blob = await response.blob();
    return new File([blob], filename, { type: blob.type });
  };

  // Handle delete
  const handleDelete = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Call the onDeleteAvatar prop to handle the actual deletion
      await onDeleteAvatar();

      // Clear preview and close dialog
      setPreviewUrl(null);
      handleCloseDialog();
    } catch (error) {
      setError(error as Error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle file input click (for web)
  const handleFileInputClick = () => {
    fileInputRef.current?.click();
  };

  // Handle upload
  const handleUpload = async () => {
    if (!previewUrl) return;

    setIsLoading(true);

    try {
      // In a real implementation, you would upload the file to your server here
      // For example:
      // const file = await urlToFile(previewUrl, 'avatar.jpg');
      // await onUploadComplete(file);

      // Simulate upload
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Call onUploadComplete with a dummy file for now
      await onUploadComplete(
        new File([], 'avatar.jpg', { type: 'image/jpeg' })
      );

      // Close dialog on success
      handleCloseDialog();
    } catch (error) {
      setError(error as Error);
      onError?.(error as Error);
    } finally {
      setIsLoading(false);
    }
  };

  // Helper function to convert data URL to File (commented out as it's not used in this version)
  // const dataUrlToFile = async (dataUrl: string, filename: string): Promise<File> => {
  //   const response = await fetch(dataUrl);
  //   const blob = await response.blob();
  //   return new File([blob], filename, { type: blob.type });
  // };

  // Handle preview close
  const handleClosePreview = () => {
    setPreviewUrl(currentAvatarUrl || null);
    setError(null);
  };

  // Avatar size mapping to Tamagui AvatarSize
  const getAvatarSize = (size: string = 'medium'): 'sm' | 'md' | 'lg' => {
    switch (size) {
      case 'sm':
        return 'sm';
      case 'lg':
        return 'lg';
      case 'md':
      default:
        return 'md';
    }
  };

  const avatarSize = getAvatarSize(size);

  return (
    <>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileInputChange}
        accept="image/*"
        style={{ display: 'none' }}
      />

      <AvatarWithUrl
        imagePath={currentAvatarUrl || undefined}
        size={avatarSize}
        circular={circular}
      />

      <Dialog open={isDialogOpen} onOpenChange={handleCloseDialog}>
        <Dialog.Portal>
          <Dialog.Overlay />
          <Dialog.Content>
            <DialogContents
              dialogState={dialogState}
              hasImage={!!currentAvatarUrl || !!previewUrl}
              isLoading={isLoading}
              error={error}
              progress={progress}
              previewUrl={previewUrl}
              onFileInputClick={handleFileInputClick}
              onDeleteAvatar={handleDelete}
              onCancel={handleCancel}
              onUpload={handleUpload}
              onClosePreview={handleClosePreview}
              circular={circular}
            />
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog>
    </>
  );
}
