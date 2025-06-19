import { memo } from 'react';
import { YStack } from 'tamagui';
import { SearchInput } from './SearchInput';
import {
  SortControls,
  type SortDirection,
  type SortField,
} from './SortControls';

export interface SearchAndSortBarProps {
  /**
   * Current search value
   */
  searchValue: string;

  /**
   * Callback when search value changes (debounced)
   */
  onSearch: (text: string) => void;

  /**
   * Available fields to sort by
   */
  sortFields: SortField[];

  /**
   * Currently selected sort field
   */
  selectedSortField: string;

  /**
   * Current sort direction
   */
  sortDirection: SortDirection;

  /**
   * Callback when sort field or direction changes
   */
  onSortChange: (field: string, direction: SortDirection) => void;

  /**
   * Debounce time in milliseconds for search input
   * @default 400
   */
  debounceMs?: number;
}

/**
 * SearchAndSortBar component that combines search input and sort controls
 * Optimized for web with search on top and sort controls below
 */
export const SearchAndSortBar = memo(
  ({
    searchValue,
    onSearch,
    sortFields,
    selectedSortField,
    sortDirection,
    onSortChange,
    debounceMs = 400,
  }: SearchAndSortBarProps) => {
    return (
      <YStack
        gap="$2"
        borderBottomWidth={1}
        borderBottomColor="$borderColor"
        width="100%"
        maxWidth="100%"
      >
        <SearchInput
          testID="search-input"
          value={searchValue}
          onSearch={onSearch}
          placeholder="Search contacts..."
          debounceMs={debounceMs}
        />
        <SortControls
          fields={sortFields}
          selectedField={selectedSortField}
          direction={sortDirection}
          onSortChange={onSortChange}
        />
      </YStack>
    );
  }
);

SearchAndSortBar.displayName = 'SearchAndSortBar';
