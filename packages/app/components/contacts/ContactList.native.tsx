import { useContacts } from '@bbook/data/src/hooks/useContacts';
import { ContactCard } from './ContactCard';
import { Spinner, Text, YStack } from '@bbook/ui';
import { FlatList, ListRenderItem } from 'react-native';
import { LinkComponent } from 'utils/types';
import type {
  Contact,
  SortableField,
  SortOrder,
} from '@bbook/data/src/schemas/contacts';

interface ContactListProps {
  searchTerm?: string;
  sortField?: SortableField;
  sortDirection?: SortOrder;
  Link?: LinkComponent;
  onPressContact: (contact: Contact) => void;
}

export function ContactList({
  searchTerm = '',
  sortField = 'display_name',
  sortDirection = 'asc',
  Link,
  onPressContact,
}: ContactListProps) {
  // No need for local state as we receive everything via props

  // Use the contact list hook with search and sort parameters
  const {
    contacts = [],
    isLoading,
    isLoadingMore,
    error,
    isEmpty,
    pagination: { hasMore },
    loadMore,
  } = useContacts({
    search: searchTerm,
    sort_by: sortField,
    sort_order: sortDirection,
  });

  if (isLoading && isEmpty) return <Spinner size="large" />;
  if (error) return <Text>Error loading contacts: {error.message}</Text>;
  if (isEmpty) return <Text>No contacts found</Text>;

  const renderItem: ListRenderItem<Contact> = ({ item: contact }) => {
    return (
      <ContactCard
        key={contact.slug || contact.email || contact.display_name}
        displayName={contact.display_name}
        firstName={contact.first_name || undefined}
        lastName={contact.last_name || undefined}
        email={contact.email || undefined}
        avatarUrl={contact.avatar_path || undefined}
        onPress={() => onPressContact(contact)}
      />
    );
  };

  return (
    <YStack flex={1}>
      <FlatList
        data={contacts}
        renderItem={renderItem}
        keyExtractor={(item) => item.slug || item.email || item.display_name}
        contentContainerStyle={{ padding: 16, gap: 8 }}
        onEndReached={() => {
          if (hasMore && !isLoadingMore) {
            loadMore();
          }
        }}
        onEndReachedThreshold={0.5}
        ListFooterComponent={
          hasMore && isLoadingMore ? (
            <YStack padding="$4" alignItems="center">
              <Spinner size="small" />
            </YStack>
          ) : null
        }
        ListEmptyComponent={
          <YStack padding="$4" alignItems="center">
            <Text>No contacts found</Text>
          </YStack>
        }
      />
    </YStack>
  );
}
