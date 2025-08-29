import { YStack, ScrollView } from '@bbook/ui';
import { Contact } from '@bbook/data';
import { ContactEditor } from './ContactEditor';
import { useToastController } from '@bbook/ui';
import { useTranslation } from '@bbook/i18n';
import { useUpdateContact } from '@bbook/data';
import { ContactAvatarUploader } from '../avatar';
import { TagListContainer } from '../tags/TagListContainer';
import { useAuth } from '../../provider/auth-provider';
import { ContactImages } from '../images/ContactImages';

export interface ContactMainProps {
  contact: Contact;
}

export function ContactMain({ contact }: ContactMainProps) {
  const toast = useToastController();
  const { t } = useTranslation();
  const { mutateAsync: updateContact, isPending } = useUpdateContact(
    contact?.slug || ''
  );

  const { user } = useAuth();

  const handleContactUpdate = async (changes: Partial<Contact>) => {
    try {
      const result = await updateContact(changes);

      if (result.success && result.data) {
        handleUpdateSuccess(result.data);
      } else {
        throw new Error(result.error || t('contacts:errors.update_error'));
      }
    } catch (error) {
      handleError(
        error instanceof Error
          ? error
          : new Error(t('contacts:errors.update_error'))
      );
    }
  };

  const handleUpdateSuccess = (_updatedContact: Contact) => {
    toast.show(t('contacts:success.update_success'));
  };

  const handleError = (error: Error) => {
    toast.show(error.message || t('contacts:errors.update_error'), {
      type: 'error',
    });
  };

  return (
    <ScrollView>
      <YStack
        gap="$4"
        justifyContent="center"
        alignItems="center"
        padding="$4"
        flex={1}
      >
        {/* <Text fontSize="$8" fontWeight="bold">
          {t('contacts:contact_details')}
        </Text>
        <Text color="$gray10" marginTop="$1">
          {t('contacts:update_contact_info')}
        </Text> */}

        {contact.slug && (
          <ContactAvatarUploader
            contactSlug={String(contact.slug)}
            image={contact.avatar_path ?? undefined}
            text={contact.display_name}
            size="lg"
          />
        )}
        <ContactEditor
          contact={contact}
          onSubmit={handleContactUpdate}
          isPending={isPending}
          onError={handleError}
        />
        {user?.org_slug && contact?.id && (
          <TagListContainer
            orgSlug={user.org_slug}
            entityType="contact"
            entityId={contact.id}
            tags={contact.tags ?? undefined}
            editable
          />
        )}
        {user?.org_slug && contact?.id && (
          <ContactImages orgSlug={user.org_slug} contactId={contact.id} />
        )}
      </YStack>
    </ScrollView>
  );
}
