import React from 'react';
import { Platform } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { Sheet, YStack, XStack, Text, Spinner, Progress } from '@bbook/ui';
import { Trash, Upload, X, Camera } from '@tamagui/lucide-icons';
import { CButton } from '@bbook/ui';
import { useAuth } from '../../provider/auth-provider';
import { AvatarWithUrl } from './AvatarWithUrl';
import { useTranslation } from '@bbook/i18n';
import { useAvatarUpload } from './useAvatarUpload';
import { AvatarUploaderProps, DialogState } from './types';
import { Ionicons } from '@expo/vector-icons';

// Function to get file info and prepare for upload
const getFileInfo = async (uri: string, filename: string) => {
  const fileInfo = await FileSystem.getInfoAsync(uri);
  const extension = filename.split('.').pop()?.toLowerCase();
  const type = extension === 'png' ? 'image/png' : 'image/jpeg';

  if (!fileInfo.exists) {
    throw new Error('File does not exist');
  }

  return {
    uri: Platform.OS === 'android' ? uri : uri.replace('file://', ''),
    name: filename,
    type,
    size: 'size' in fileInfo ? fileInfo.size : 0,
  };
};

// Define the SheetContents component
interface SheetContentsProps {
  dialogState: DialogState;
  hasImage: boolean;
  isLoading: boolean;
  error: string | null;
  progress: number;
  previewUrl: string | null;
  onChooseFromGallery: () => void;
  onTakePhoto: () => void;
  onDeleteAvatar: () => void;
  onCancel: () => void;
  onUpload: () => void;
  onClosePreview: () => void;
  circular?: boolean;
}

const SheetContents = ({
  dialogState,
  hasImage,
  isLoading,
  error,
  progress,
  previewUrl,
  onChooseFromGallery,
  onTakePhoto,
  onDeleteAvatar,
  onCancel,
  onUpload,
  onClosePreview,
}: SheetContentsProps) => {
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

      {/* Initial state - show options to select from gallery or take photo */}
      {dialogState === 'initial' && (
        <YStack gap="$4">
          {/* Show current avatar if available */}
          {hasImage && (
            <YStack alignItems="center" marginBottom="$4">
              <AvatarWithUrl size="md" />
            </YStack>
          )}

          <YStack gap="$4" width="100%">
            <YStack gap="$4" justifyContent="center" alignItems="center">
              <CButton
                variant="primary"
                onPress={onChooseFromGallery}
                icon={<Upload size={18} />}
              >
                {t('common:choose_from_library')}
              </CButton>
              <CButton onPress={onTakePhoto} icon={<Camera size={18} />}>
                {t('common:take_photo')}
              </CButton>
            </YStack>
          </YStack>

          {/* Show delete button if user has an avatar */}
          {hasImage && (
            <YStack gap="$4" marginTop="$4">
              <CButton
                variant="destructive"
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
          {previewUrl && <AvatarWithUrl size="lg" imagePath={previewUrl} />}

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
              icon={
                <Ionicons name="cloud-upload-outline" size={18} color="black" />
              }
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
}) => {
  const {
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
    validateFileSize,
    handleCancel,
    handleClosePreview,
    handleDeleteAvatar,
    uploadMutation,
  } = useAvatarUpload();

  // Check if user has an avatar
  const { user } = useAuth();
  const hasImage = Boolean(user?.avatar_path || image);

  // Handle choosing image from gallery
  const handleChooseFromGallery = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const selectedAsset = result.assets[0];
        const uri = selectedAsset.uri;

        // Generate a filename if not available
        const filename =
          selectedAsset.fileName ||
          `avatar-${Date.now()}.${uri.split('.').pop()?.toLowerCase() || 'jpg'}`;

        setSelectedImageUri(uri);
        setSelectedFileName(filename);
        setPreviewUrl(uri);
        setDialogState('preview');
      }
    } catch (error) {
      console.error('Error picking image:', error);
      setError((error as Error).message);
    }
  };

  // Handle taking a photo with camera
  const handleTakePhoto = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();

      if (status !== 'granted') {
        setError('Camera permission is required to take a photo');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const selectedAsset = result.assets[0];
        const uri = selectedAsset.uri;

        // Generate a filename
        const filename = `avatar-${Date.now()}.${uri.split('.').pop()?.toLowerCase() || 'jpg'}`;

        setSelectedImageUri(uri);
        setSelectedFileName(filename);
        setPreviewUrl(uri);
        setDialogState('preview');
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      setError((error as Error).message);
    }
  };

  // Handle upload button press
  const handleUpload = async () => {
    if (!selectedImageUri || !selectedFileName) {
      setError('No image selected');
      return;
    }

    try {
      setDialogState('uploading');
      setError(null);
      setIsLoading(true);

      console.log('Starting upload process for:', selectedFileName);

      // Get file info and prepare for upload
      const file = await getFileInfo(selectedImageUri, selectedFileName);

      // Check file size (max 5MB)
      if (!validateFileSize(file.size)) {
        return;
      }

      console.log('Uploading file:', {
        name: file.name,
        type: file.type,
        size: file.size,
        uri: file.uri.substring(0, 50) + '...', // Log partial URI to avoid cluttering logs
      });

      // Use the file object for upload
      await uploadMutation.mutateAsync(file as any);

      // Call the onUploadComplete callback if provided
      if (onUploadComplete) {
        onUploadComplete();
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

      <Sheet
        modal
        open={dialogInteraction.state}
        onOpenChange={(open: boolean) =>
          open ? dialogInteraction.onIn() : dialogInteraction.onOut()
        }
        snapPoints={[55, 50, 25]}
        snapPointsMode="percent"
        dismissOnSnapToBottom
        position={0}
        zIndex={100000}
      >
        <Sheet.Overlay opacity={0.4} />
        <Sheet.Handle />
        <Sheet.Frame padding="$4" justifyContent="center" alignItems="center">
          <SheetContents
            dialogState={dialogState}
            hasImage={hasImage}
            isLoading={isLoading}
            error={error}
            progress={progress}
            previewUrl={previewUrl}
            onChooseFromGallery={handleChooseFromGallery}
            onTakePhoto={handleTakePhoto}
            onDeleteAvatar={handleDeleteAvatar}
            onCancel={handleCancel}
            onUpload={handleUpload}
            onClosePreview={handleClosePreview}
          />
        </Sheet.Frame>
      </Sheet>
    </>
  );
};
