import { Stack, YStack, Text } from '@bbook/ui';
import { Contact } from '@bbook/data';
import { ContactEditor } from './ContactEditor';
import { useToastController } from '@bbook/ui';

import { useUpdateContact } from '@bbook/data';

export interface ContactMainProps {
  contact: Contact;
}

export function ContactMain({ contact }: ContactMainProps) {
  const toast = useToastController();
  const { mutateAsync: updateContact, isPending } = useUpdateContact(
    contact?.slug || ''
  );

  const handleContactUpdate = async (changes: Partial<Contact>) => {
    try {
      const result = await updateContact(changes);

      if (result.success && result.data) {
        handleUpdateSuccess(result.data);
      } else {
        throw new Error(result.error || 'Failed to update contact');
      }
    } catch (error) {
      handleError(
        error instanceof Error ? error : new Error('Failed to update contact')
      );
    }
  };

  const handleUpdateSuccess = (updatedContact: Contact) => {
    toast.show('Contact updated successfully!');
  };

  const handleError = (error: Error) => {
    toast.show(error.message || 'Failed to update contact', {
      type: 'error',
    });
  };

  return (
    <YStack gap="$4" padding="$4" flex={1}>
      <Stack>
        <Text fontSize="$8" fontWeight="bold">
          Contact Details
        </Text>
        <Text color="$gray10" marginTop="$1">
          Update contact information
        </Text>
      </Stack>

      <ContactEditor
        contact={contact}
        onSubmit={handleContactUpdate}
        isPending={isPending}
        onError={handleError}
      />
    </YStack>
  );
}
