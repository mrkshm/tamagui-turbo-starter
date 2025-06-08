import { createFileRoute } from '@tanstack/react-router';
import { useContact } from '@bbook/data';
import { ContactMain } from '@bbook/app';
import { Spinner, Text } from '@bbook/ui';

export const Route = createFileRoute('/member/contacts/$contactSlug')({
  component: ContactDetailPage,
});

function ContactDetailPage() {
  const { contactSlug } = Route.useParams();
  const { data: contactResponse, isLoading, error } = useContact(contactSlug);

  if (isLoading) {
    return <Spinner />;
  }

  if (error || !contactResponse) {
    return <Text>Error loading contact: {error?.message}</Text>;
  }

  // Type guard to check if we have a successful response
  if (!contactResponse.success) {
    return (
      <Text>Error: {contactResponse.error || 'Failed to load contact'}</Text>
    );
  }

  const contact = contactResponse.data;
  if (!contact) {
    return <Text>Contact data is not available</Text>;
  }

  return <ContactMain contact={contact} />;
}
