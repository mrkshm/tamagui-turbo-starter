import React, { useCallback } from 'react';
import { View } from 'react-native';
import { RNImageUploader } from './RNImageUploader.native';
import { RNImageGallery } from './RNImageGallery.native';
import { useBulkAttachImages, type PolymorphicTarget } from '@bbook/data';
import type { ContactImagesProps } from './types';

export const ContactImages: React.FC<ContactImagesProps> = ({ orgSlug, contactId }) => {
  const target: PolymorphicTarget = { appLabel: 'contacts', model: 'contact', objId: contactId };
  const { mutateAsync: bulkAttach } = useBulkAttachImages(orgSlug, target);

  const handleUploaded = useCallback(
    async (ids: number[]) => {
      if (!ids?.length) return;
      try {
        await bulkAttach(ids);
      } catch (e) {
        console.error('[ContactImages.native] bulkAttach failed', e);
      }
    },
    [bulkAttach]
  );

  return (
    <View style={{ gap: 12 }}>
      <RNImageUploader orgSlug={orgSlug} multiple onUploaded={handleUploaded} />
      <RNImageGallery orgSlug={orgSlug} target={target} />
    </View>
  );
};
