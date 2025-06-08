// packages/app/components/contacts/ContactList.web.tsx
import { useContacts } from '@bbook/data/src/hooks/useContacts';
import { ContactCard } from './ContactCard';
import { Spinner, Text, YStack } from '@bbook/ui';
import { useInView } from 'react-intersection-observer';
import { useEffect } from 'react';
import type {
  Contact,
  SortableField,
  SortOrder,
} from '@bbook/data/src/schemas/contacts';

interface ContactListProps {
  searchTerm?: string;
  sortField?: SortableField;
  sortDirection?: SortOrder;
  onPressContact: (contact: Contact) => void;
}

export function ContactList({
  searchTerm = '',
  sortField = 'display_name',
  sortDirection = 'asc',
  onPressContact,
}: ContactListProps) {
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

  const [inViewRef, inView] = useInView({
    threshold: 0.1,
    triggerOnce: false,
  });

  // Load more when the sentinel comes into view
  useEffect(() => {
    if (inView && hasMore && !isLoading && !isLoadingMore) {
      loadMore();
    }
  }, [inView, hasMore, isLoading, isLoadingMore, loadMore]);

  // Show loading spinner during initial load
  if (isLoading && isEmpty) return <Spinner size="large" />;
  if (error) return <Text>Error loading contacts: {error.message}</Text>;
  if (isEmpty) return <Text>No contacts found</Text>;

  // Show loading overlay during search or sort operations
  const showLoadingOverlay = isLoading && !isLoadingMore;
  return (
    <YStack gap="$2" position="relative">
      {/* Loading overlay that appears during search or sort operations */}
      {showLoadingOverlay && (
        <YStack
          position="absolute"
          top={0}
          left={0}
          right={0}
          bottom={0}
          zIndex={10}
          backgroundColor="rgba(0,0,0,0.2)"
          alignItems="center"
          justifyContent="center"
          pointerEvents="auto"
        >
          <YStack
            backgroundColor="$background"
            padding="$6"
            borderRadius="$4"
            elevation="$4"
            alignItems="center"
            justifyContent="center"
            gap="$2"
          >
            <Spinner size="large" color="$primary" />
          </YStack>
        </YStack>
      )}

      {contacts.map((contact: Contact) => {
        return (
          <YStack // any focusable element will do
            key={contact.slug || contact.email || contact.display_name}
            role="button"
            tabIndex={0}
            onPress={() => onPressContact(contact)}
            style={{ outline: 'none', textDecoration: 'none' }}
          >
            <ContactCard
              key={contact.slug || contact.email || contact.display_name}
              displayName={contact.display_name}
              firstName={contact.first_name || undefined}
              lastName={contact.last_name || undefined}
              email={contact.email || undefined}
              avatarUrl={contact.avatar_path || undefined}
            />
          </YStack>
        );
      })}

      {/* Loading indicator at the bottom - only show when loading more and has more to load */}
      {isLoadingMore && hasMore && (
        <div ref={inViewRef}>
          <YStack padding="$4" alignItems="center">
            <Spinner size="small" />
          </YStack>
        </div>
      )}

      {/* Sentinel element to trigger loading more */}
      {!isLoadingMore && hasMore && (
        <div ref={inViewRef} style={{ height: 1 }} />
      )}
    </YStack>
  );
}
