import { createFileRoute, useRouter } from '@tanstack/react-router';
import { useAuth } from '@bbook/app/provider/auth-provider';
import { ContactList } from '@bbook/app/components/contacts/ContactList';
import { SearchAndSortBar, Spinner } from '@bbook/ui';
import { View, YStack, Text } from '@bbook/ui';
import type { SortField } from '@bbook/ui/src/components/inputs/SortControls';
import { useState, useCallback } from 'react';
import { useTranslation } from '@bbook/i18n';
import type {
  Contact,
  SortableField,
  SortOrder,
} from '@bbook/data/src/schemas/contacts';

export const Route = createFileRoute('/member/contacts/')({
  component: RouteComponent,
});

function RouteComponent() {
  const { user, isLoading } = useAuth();
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<SortableField>('display_name');
  const [sortDirection, setSortDirection] = useState<SortOrder>('asc');
  const router = useRouter();

  const handleContactPress = (contact: Contact) => {
    router.navigate({ to: `/member/contacts/${contact.slug}` });
  };
  const sortFields: SortField[] = [
    { id: 'display_name', label: t('common:sort_by.name') },
    { id: 'email', label: t('common:sort_by.email') },
    { id: 'created_at', label: t('common:sort_by.date_added') },
  ];

  const handleSearch = useCallback((text: string) => {
    setSearchTerm(text);
  }, []);

  const handleSortChange = useCallback(
    (field: string, direction: 'asc' | 'desc') => {
      setSortField(field as SortableField);
      setSortDirection(direction);
    },
    []
  );

  if (isLoading) {
    return <Spinner />;
  }

  if (!user) {
    return <Text>{t('contacts:errors.not_found')}</Text>;
  }

  return (
    <YStack flex={1} height="100vh" overflow="hidden">
      <View
        flex={1}
        flexDirection="column"
        $gtMd={{ flexDirection: 'row-reverse' }}
        width="100%"
        height="100%"
        overflow="hidden"
      >
        {/* Left sidebar - Search/Sort */}
        <YStack
          padding="$0"
          width="100%"
          maxWidth="100%"
          $gtMd={{
            padding: '$4',
            width: 320,
            flexShrink: 0,
          }}
          backgroundColor="$background"
          borderRightWidth={1}
          borderRightColor="$borderColor"
          overflowY="auto"
          overflowX="hidden"
        >
          <SearchAndSortBar
            searchValue={searchTerm}
            onSearch={handleSearch}
            sortFields={sortFields}
            selectedSortField={sortField}
            sortDirection={sortDirection}
            onSortChange={handleSortChange}
          />
        </YStack>

        {/* Main content - Contact List */}
        <YStack
          flex={1}
          padding="$0"
          $gtSm={{ padding: '$4' }}
          backgroundColor="$surface"
          overflowY="auto"
          minHeight={0}
          position="relative"
        >
          <ContactList
            searchTerm={searchTerm}
            sortField={sortField}
            sortDirection={sortDirection}
            onPressContact={handleContactPress}
          />
        </YStack>
      </View>
    </YStack>
  );
}
