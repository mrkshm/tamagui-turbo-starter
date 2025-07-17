import { useRef } from 'react';
import { Dialog, YStack, XStack, Text, Spinner, Progress } from '@bbook/ui';
import { Trash, Upload, X } from '@bbook/ui';
import { CButton } from '@bbook/ui';
import { useAuth } from '../../provider/auth-provider';
import { AvatarWithUrl } from './AvatarWithUrl';
import { useTranslation } from '@bbook/i18n';
import { useAvatarUpload } from './useAvatarUpload';
import { AvatarUploaderProps, DialogState } from './types';
import { AvatarEntityTypeLiteral } from '@bbook/data';

// Define the DialogContents component
interface DialogContentsProps {
  dialogState: DialogState;
  hasImage: boolean;
  isLoading: boolean;
  error: string | null;
  progress: number;
  previewUrl: string | null;
  currentImageUrl?: string;
  entityType: AvatarEntityTypeLiteral;
  onFileInputClick: () => void;
  onDeleteAvatar: () => void;
  onCancel: () => void;
  onUpload: () => void;
  onClosePreview: () => void;
}

const DialogContents = ({
  dialogState,
  hasImage,
  isLoading,
  error,
  progress,
  previewUrl,
  entityType = 'user',
  currentImageUrl,
  onFileInputClick,
  onDeleteAvatar,
  onCancel,
  onUpload,
  onClosePreview,
}: DialogContentsProps) => {
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

      {/* Initial state - show options to select file */}
      {dialogState === 'initial' && (
        <YStack gap="$4">
          {/* Show current avatar if available */}
          {hasImage && currentImageUrl && (
            <YStack alignItems="center" marginBottom="$4">
              <AvatarWithUrl
                size="md"
                entityType={entityType}
                imagePath={currentImageUrl}
              />
            </YStack>
          )}

          <YStack gap="$4" width="100%">
            <YStack gap="$4" justifyContent="center" alignItems="center">
              <CButton
                variant="primary"
                onPress={onFileInputClick}
                icon={<Upload size={18} />}
              >
                {t('common:choose_file')}
              </CButton>
            </YStack>
          </YStack>

          {/* Show delete button if user has an avatar */}
          {hasImage && (
            <YStack gap="$4" marginTop="$4">
              <CButton
                variant="outline"
                onPress={onDeleteAvatar}
                disabled={isLoading}
                icon={<Trash size={18} />}
              >
                {t('common:delete_avatar')}
              </CButton>
            </YStack>
          )}

          {/* Error message */}
          {error && (
            <YStack
              backgroundColor="$red2"
              padding="$2"
              borderRadius="$2"
              borderColor="$red8"
              borderWidth={1}
              width="100%"
              marginBottom="$4"
            >
              <Text color="$red10" textAlign="center">
                {error}
              </Text>
            </YStack>
          )}

          {/* Cancel button */}
          <YStack gap="$4">
            <CButton onPress={onCancel} icon={<X size={18} />}>
              {t('common:cancel')}
            </CButton>
          </YStack>
        </YStack>
      )}

      {/* Preview state - show selected image and upload/cancel buttons */}
      {dialogState === 'preview' && (
        <YStack gap="$4" alignItems="center" width="100%">
          {/* Preview image */}
          {previewUrl && (
            <YStack alignItems="center" marginBottom="$4">
              <AvatarWithUrl size="lg" imagePath={previewUrl} />
              <Text marginTop="$2" color="$gray10" fontSize="$2">
                {t('common:preview')}
              </Text>
            </YStack>
          )}

          {/* Error message */}
          {error && (
            <YStack
              backgroundColor="$red2"
              padding="$2"
              borderRadius="$2"
              borderColor="$red8"
              borderWidth={1}
              width="100%"
              marginBottom="$4"
            >
              <Text color="$red10" textAlign="center">
                {error}
              </Text>
            </YStack>
          )}

          <XStack gap="$4">
            <CButton
              onPress={onUpload}
              icon={<Upload size={18} />}
              disabled={isLoading}
            >
              {t('common:upload')}
            </CButton>

            <CButton onPress={onClosePreview} disabled={isLoading}>
              {t('common:cancel')}
            </CButton>
          </XStack>
        </YStack>
      )}

      {/* Uploading state - show spinner and progress bar */}
      {dialogState === 'uploading' && (
        <YStack gap="$4" alignItems="center" width="100%">
          <Spinner size="large" color="$primary" />
          <Text>{t('common:uploading')}</Text>

          {error && (
            <YStack
              backgroundColor="$red2"
              padding="$2"
              borderRadius="$2"
              borderColor="$red8"
              borderWidth={1}
              width="100%"
              marginBottom="$4"
            >
              <Text color="$red10" textAlign="center">
                {error}
              </Text>
            </YStack>
          )}

          <YStack width="100%" gap="$2">
            <Progress value={progress} width="100%">
              <Progress.Indicator backgroundColor="$primary" />
            </Progress>
            <Text textAlign="center">{progress}%</Text>
          </YStack>
        </YStack>
      )}
    </YStack>
  );
};

export const AvatarUploader: React.FC<AvatarUploaderProps> = ({
  size = 'md',
  image,
  text,
  circular = true,
  onUploadComplete,
  entityType = 'user',
  entityId,
}) => {
  // Current user info (used to resolve entity id and existing avatar path)
  const { user } = useAuth();

  const {
    dialogState,
    setDialogState,
    error,
    setError,
    progress,
    isLoading,
    setIsLoading,
    previewUrl,
    setPreviewUrl,
    dialogInteraction,
    uploadMutation,
    validateFileSize,
    handleCancel,
    handleClosePreview,
    handleDeleteAvatar,
  } = useAvatarUpload({
    entityType,
    entityId:
      entityType === 'user'
        ? String(entityId ?? user?.id ?? 'current_user')
        : (entityId as string),
  });
  const hasImage = Boolean(user?.avatar_path || image);

  // File input reference
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle file selection
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    console.log('File input changed', event.target.files);
    const files = event.target.files;
    if (!files || files.length === 0) {
      console.log('No files selected');
      return;
    }

    const file = files[0];
    console.log('Selected file:', {
      name: file.name,
      type: file.type,
      size: file.size,
    });

    try {
      // Create a preview URL
      const objectUrl = URL.createObjectURL(file);
      console.log('Created object URL:', objectUrl);
      setPreviewUrl(objectUrl);
      setDialogState('preview');
    } catch (error) {
      console.error('Error creating preview URL:', error);
      setError('Failed to create image preview');
    }
  };

  // Handle file input click
  const handleFileInputClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Handle upload button press
  const handleUpload = async () => {
    if (
      !fileInputRef.current?.files ||
      fileInputRef.current.files.length === 0
    ) {
      setError('No file selected');
      return;
    }

    try {
      setDialogState('uploading');
      setError(null);
      setIsLoading(true);

      const file = fileInputRef.current.files[0];

      // Check file size (max 5MB)
      if (!validateFileSize(file.size)) {
        return;
      }

      console.log('Uploading file:', {
        name: file.name,
        type: file.type,
        size: file.size,
      });

      // Use the file object for upload
      await uploadMutation.mutateAsync(file);

      // Call the onUploadComplete callback if provided
      if (onUploadComplete) {
        onUploadComplete();
      }

      // Clean up the object URL to avoid memory leaks
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    } catch (error) {
      console.error('Upload error:', error);
      setError((error as Error).message);
      setDialogState('initial');
      setIsLoading(false);
    }
  };

  return (
    <>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        onClick={(e) => {
          // Reset the value so the same file can be selected again
          (e.target as HTMLInputElement).value = '';
        }}
        accept="image/png, image/jpeg, image/jpg, image/gif"
        style={{
          position: 'absolute',
          width: '1px',
          height: '1px',
          padding: 0,
          margin: '-1px',
          overflow: 'hidden',
          clip: 'rect(0, 0, 0, 0)',
          whiteSpace: 'nowrap',
          border: 0,
        }}
      />
      <XStack
        onPress={() => {
          if (!dialogInteraction.state) {
            dialogInteraction.onIn();
          }
        }}
      >
        <AvatarWithUrl
          imagePath={image}
          size={size}
          text={text}
          circular={circular}
        />
      </XStack>

      <Dialog
        modal
        open={dialogInteraction.state}
        onOpenChange={(open: boolean) =>
          open ? dialogInteraction.onIn() : dialogInteraction.onOut()
        }
      >
        <Dialog.Portal>
          <Dialog.Overlay
            key="overlay"
            animation="quick"
            opacity={0.5}
            enterStyle={{ opacity: 0 }}
            exitStyle={{ opacity: 0 }}
          />
          <Dialog.Content
            bordered
            elevate
            key="content"
            animation={[
              'quick',
              {
                opacity: {
                  overshootClamping: true,
                },
              },
            ]}
            enterStyle={{ x: 0, y: -20, opacity: 0, scale: 0.9 }}
            exitStyle={{ x: 0, y: 10, opacity: 0, scale: 0.95 }}
            padding="$4"
            maxWidth={500}
            width="90%"
          >
            <DialogContents
              dialogState={dialogState}
              hasImage={hasImage}
              isLoading={isLoading}
              error={error}
              progress={progress}
              previewUrl={previewUrl}
              entityType={entityType}
              currentImageUrl={image}
              onFileInputClick={handleFileInputClick}
              onDeleteAvatar={handleDeleteAvatar}
              onCancel={handleCancel}
              onUpload={handleUpload}
              onClosePreview={handleClosePreview}
            />
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog>
    </>
  );
};
