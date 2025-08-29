import { useCallback, useState } from 'react';
import { View, Button, Platform } from 'react-native';
// @ts-ignore - native-only dependency resolved in Expo
import * as ImagePicker from 'expo-image-picker';
import { useUploadImage, useBulkUploadImages } from '@bbook/data';

export type RNImageUploaderProps = {
  orgSlug: string;
  multiple?: boolean;
  onUploaded?: (imageIds: number[]) => void;
  userId?: string;
};

export function RNImageUploader({ orgSlug, multiple = false, onUploaded, userId = 'current_user' }: RNImageUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const single = useUploadImage(orgSlug, { userId });
  const bulk = useBulkUploadImages(orgSlug, { userId });

  const pickAndUpload = useCallback(async () => {
    setUploading(true);
    try {
      const mediaTypes = (ImagePicker as any)?.MediaType
        ? [(ImagePicker as any).MediaType.image]
        : (ImagePicker as any).MediaTypeOptions.Images;
      const result = await ImagePicker.launchImageLibraryAsync({
        allowsEditing: false,
        allowsMultipleSelection: multiple,
        mediaTypes,
        quality: 1,
      } as any);
      if (result.canceled) return;

      const assets = multiple ? result.assets : [result.assets[0]];

      const form = new FormData();
      for (const asset of assets) {
        const fileUri = asset.uri;
        const name = fileUri.split('/').pop() || `upload-${Date.now()}.jpg`;
        const type = asset.mimeType || 'image/jpeg';
        const uri = fileUri.startsWith('file://') ? fileUri : (Platform.OS === 'ios' ? `file://${fileUri}` : fileUri);
        // Backend expects single under 'file' and multiple under 'files'
        const field = multiple ? 'files' : 'file';
        form.append(field, { uri, name, type } as unknown as Blob);
      }

      if (multiple) {
        const res = await bulk.mutateAsync(form);
        if (res.success) {
          const ids = Array.isArray(res.data) ? res.data.map((item: any) => item?.id).filter(Boolean) : [];
          onUploaded?.(ids as number[]);
        }
      } else {
        const res = await single.mutateAsync(form);
        if (res.success) onUploaded?.([res.data.id]);
      }
    } catch (e) {
      console.error('[RNImageUploader.native] upload error', e);
    } finally {
      setUploading(false);
    }
  }, [multiple, onUploaded, single, bulk]);

  return (
    <View style={{ gap: 8 }}>
      <Button title={uploading ? 'Uploading…' : multiple ? 'Pick Images' : 'Pick Image'} onPress={pickAndUpload} disabled={uploading} />
    </View>
  );
}
