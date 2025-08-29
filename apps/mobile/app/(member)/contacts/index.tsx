import { Stack, useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useAuth } from '@bbook/app/provider/auth-provider';
import { ContactList } from '@bbook/app/components/contacts/ContactList';
import {
  YStack,
  XStack,
  Button,
  Text,
  Spinner,
  Input,
  ArrowUpAZ,
  ArrowDownAZ,
  ArrowUp01,
  ArrowDown01,
  X,
  H5,
} from '@bbook/ui';
import { useTheme } from '@bbook/ui';
import { HeaderBackground } from '@react-navigation/elements';
import type { Contact } from '@bbook/data/src/schemas/contacts';
import { useTranslation } from '@bbook/i18n';
import { UserNotFound } from '@bbook/app/components/errors/UserNotFound';
import { useCallback, useState, useEffect } from 'react';
import { AnimatePresence } from '@bbook/ui';
import type { SortableField } from '@bbook/data/src/schemas/contacts';
import { ListFilter, Search } from '@bbook/ui';
import { useInteractionState } from '@bbook/utils';

// Panel component for search/sort
function Panel({
  isVisible,
  children,
}: {
  isVisible: boolean;
  children: React.ReactNode;
}) {
  return (
    <YStack
      paddingVertical="$2"
      paddingHorizontal="$3"
      backgroundColor="$background"
      borderBottomWidth={1}
      borderBottomColor="$borderColor"
      animation="quick"
      overflow="hidden"
      height={isVisible ? 'auto' : 0}
      opacity={isVisible ? 1 : 0}
      pointerEvents={isVisible ? 'auto' : 'none'}
    >
      {children}
    </YStack>
  );
}

export default function MemberHome() {
  const { t } = useTranslation();
  const { user, isLoading } = useAuth();
  const theme = useTheme();
  const backgroundColor = theme.background?.val;
  const textColor = theme.textPrimary?.val;
  const router = useRouter();

  // Search state
  const [searchTerm, setSearchTerm] = useState('');
  const {
    state: showSearch,
    onIn: openSearch,
    onOut: closeSearch,
  } = useInteractionState();

  // Sort state
  const [sortField, setSortField] = useState<SortableField>('display_name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const {
    state: showSort,
    onIn: openSort,
    onOut: closeSort,
  } = useInteractionState();

  // Toggle search panel
  const toggleSearch = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (showSearch) {
      closeSearch();
    } else {
      openSearch();
      closeSort();
    }
  }, [showSearch, openSearch, closeSearch, closeSort]);

  // Toggle sort panel
  const toggleSort = useCallback(() => {
    if (showSearch) {
      closeSearch();
    }
    if (showSort) {
      closeSort();
    } else {
      openSort();
    }
  }, [showSearch, showSort, closeSearch, openSort, closeSort]);

  // Handle search with debounce
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = useCallback((text: string) => {
    setSearchTerm(text);
    setIsSearching(true);
  }, []);

  // Clear search
  const clearSearch = useCallback(() => {
    setSearchTerm('');
    setIsSearching(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, []);

  const handleContactPress = (contact: Contact) => {
    router.navigate(`/(member)/contacts/${contact.slug}`);
  };

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchTerm.trim() !== '') {
        // Trigger search here
        console.log('Searching for:', searchTerm);
      }
      setIsSearching(false);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Close sort panel when search term changes
  useEffect(() => {
    if (searchTerm) {
      closeSort();
    }
  }, [searchTerm, closeSort]);

  // Handle sort change
  const handleSortChange = useCallback(
    (field: SortableField, direction: 'asc' | 'desc') => {
      setSortField(field);
      setSortDirection(direction);
      // Don't close the sort panel on selection
    },
    []
  );

  if (isLoading) {
    return (
      <YStack flex={1} alignItems="center" justifyContent="center">
        <Spinner />
      </YStack>
    );
  }

  if (!user) {
    return <UserNotFound />;
  }

  return (
    <YStack flex={1} backgroundColor="$background">
      <Stack.Screen
        options={{
          headerShown: true,
          headerBackground: () => (
            <HeaderBackground style={{ backgroundColor: backgroundColor }} />
          ),
          headerTitle: t('nav:contacts'),
          headerRight: () => (
            <XStack gap="$2" marginRight="$2">
              <Button
                size="$3"
                circular
                onPress={toggleSearch}
                icon={<Search size={20} color={textColor} />}
                backgroundColor={
                  showSearch ? '$backgroundHover' : 'transparent'
                }
                testID="search-button"
              />
              <Button
                size="$3"
                circular
                onPress={toggleSort}
                icon={<ListFilter size={20} color={textColor} />}
                backgroundColor={showSort ? '$backgroundHover' : 'transparent'}
                testID="sort-button"
              />
            </XStack>
          ),
        }}
      />

      {/* Animated Panels Container */}
      <AnimatePresence>
        <YStack width="100%">
          {/* Search Panel */}
          <Panel isVisible={showSearch}>
            <XStack gap="$2" alignItems="center">
              <XStack flex={1} alignItems="center" gap="$2">
                <Input
                  flex={1}
                  value={searchTerm}
                  onChangeText={handleSearch}
                  placeholder={t('contacts:search_placeholder')}
                  autoFocus
                  testID="search-input"
                />
                {searchTerm ? (
                  <Button
                    size="$2"
                    circular
                    onPress={clearSearch}
                    icon={<X size={16} color="$color" />}
                    unstyled
                  />
                ) : null}
              </XStack>
            </XStack>
          </Panel>

          {/* Sort Panel */}
          <Panel isVisible={showSort}>
            <YStack gap="$2" paddingHorizontal="$2">
              <H5 marginBottom="$1">{t('common:sort_by.')}</H5>
              <Button
                size="$2"
                onPress={() =>
                  handleSortChange(
                    'display_name',
                    sortField === 'display_name' && sortDirection === 'asc'
                      ? 'desc'
                      : 'asc'
                  )
                }
                justifyContent="space-between"
              >
                <Text>{t('common:sort_by.name')}</Text>
                {sortField === 'display_name' &&
                  (sortDirection === 'asc' ? <ArrowUpAZ /> : <ArrowDownAZ />)}
              </Button>
              <Button
                size="$2"
                onPress={() =>
                  handleSortChange(
                    'email',
                    sortField === 'email' && sortDirection === 'asc'
                      ? 'desc'
                      : 'asc'
                  )
                }
                justifyContent="space-between"
              >
                <Text>{t('common:sort_by.email')}</Text>
                {sortField === 'email' &&
                  (sortDirection === 'asc' ? <ArrowUpAZ /> : <ArrowDownAZ />)}
              </Button>
              <Button
                size="$2"
                onPress={() =>
                  handleSortChange(
                    'created_at',
                    sortField === 'created_at' && sortDirection === 'asc'
                      ? 'desc'
                      : 'asc'
                  )
                }
                justifyContent="space-between"
              >
                <Text>{t('common:sort_by.date_added')}</Text>
                {sortField === 'created_at' &&
                  (sortDirection === 'asc' ? <ArrowUp01 /> : <ArrowDown01 />)}
              </Button>
              <Button
                size="$2"
                onPress={() =>
                  handleSortChange(
                    'updated_at',
                    sortField === 'updated_at' && sortDirection === 'asc'
                      ? 'desc'
                      : 'asc'
                  )
                }
                justifyContent="space-between"
              >
                <Text>{t('common:sort_by.last_modified')}</Text>
                {sortField === 'updated_at' &&
                  (sortDirection === 'asc' ? <ArrowUp01 /> : <ArrowDown01 />)}
              </Button>
            </YStack>
          </Panel>
        </YStack>
      </AnimatePresence>

      {/* Contact List */}
      <YStack flex={1} position="relative">
        <ContactList
          searchTerm={searchTerm}
          sortField={sortField}
          sortDirection={sortDirection}
          onPressContact={handleContactPress}
        />

        {/* Loading Overlay */}
        {isSearching && (
          <YStack
            position="absolute"
            top={0}
            left={0}
            right={0}
            bottom={0}
            alignItems="center"
            justifyContent="center"
            backgroundColor="$background"
            opacity={0.8}
            zIndex={10}
          >
            <Spinner size="large" color="$color" />
          </YStack>
        )}
      </YStack>
    </YStack>
  );
}
