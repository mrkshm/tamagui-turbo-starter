import React from 'react';
import { YStack, XStack, Text, Separator } from '@bbook/ui';
import type { PolymorphicTarget } from '@bbook/data';
import type { ContactImagesProps } from './types';
import ImageGallery from './ImageGallery';

export const ContactImages: React.FC<ContactImagesProps> = ({ orgSlug, contactId }) => {
  const target: PolymorphicTarget = {
    appLabel: 'contacts',
    model: 'contact',
    objId: contactId,
  };
  return (
    <YStack gap="$3" width="100%">
      <XStack alignItems="center" justifyContent="space-between">
        <Text fontSize="$7" fontWeight="600">Images</Text>
      </XStack>
      <Separator />
      <ImageGallery
        orgSlug={orgSlug}
        target={target}
        showUploaderButton
        pageSize={30}
      />
    </YStack>
  );
};
