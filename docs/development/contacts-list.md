# Contacts List Implementation Guide

This document outlines the step-by-step implementation of a contacts list view with infinite scroll and search functionality that works across both web and mobile platforms using shared components.

## 1. API Integration Layer

### 1.1 Schema Definitions (Completed)

- **Base Schemas** (`packages/data/src/schemas/api.ts`):

  - `PaginatedApiResponseSchema`: Generic schema for paginated responses
  - `paginationQueryParamsSchema`: Schema for pagination params (`limit`, `offset`)

- **Contact Schemas** (`packages/data/src/schemas/contacts.ts`):
  - `contactSchema`: Validates individual contact objects
  - `paginatedContactsSchema`: Validates paginated contacts response
  - `contactsQueryParamsSchema`: Combines pagination with search

### 1.2 API Client

- Use the existing `apiClient` from `@/fetcher` in `packages/data/src/api/contacts.ts`:

  ```typescript
  import { apiClient } from '@/fetcher';
  import { paginatedContactsSchema } from '../schemas/contacts';
  import type { ContactsQueryParams } from '../schemas/contacts';

  export async function fetchContacts(params: ContactsQueryParams) {
    return apiClient.get('/contacts/', paginatedContactsSchema, { params });
  }
  ```

### 1.3 React Query Hook

- Create `useContacts` hook in `packages/data/src/hooks/useContacts.ts`:

  ```typescript
  import { useInfiniteQuery } from '@tanstack/react-query';
  import { fetchContacts } from '../api/contacts';
  import { ContactsQueryParams } from '../schemas/contacts';

  const ITEMS_PER_PAGE = 20;

  export function useContacts(
    params: Omit<ContactsQueryParams, 'limit' | 'offset'>
  ) {
    return useInfiniteQuery({
      queryKey: ['contacts', params],
      queryFn: async ({ pageParam = 0 }) => {
        return fetchContacts({
          ...params,
          limit: ITEMS_PER_PAGE,
          offset: pageParam * ITEMS_PER_PAGE,
        });
      },
      getNextPageParam: (lastPage, allPages) => {
        const loadedItems = allPages.flatMap((page) => page.items).length;
        return loadedItems < lastPage.count ? allPages.length : undefined;
      },
    });
  }
  ```

### 1.4 Sorting Implementation

- **Sorting Schema** (`packages/data/src/schemas/contacts.ts`):

  - Added `SORTABLE_FIELDS` constant with all sortable fields
  - Created `sortOrderSchema` for 'asc'/'desc' validation
  - Created `sortFieldSchema` for field name validation
  - Updated `contactsQueryParamsSchema` to include sorting parameters

- **Default Sorting**:
  - Default sort field: `display_name`
  - Default sort order: `asc`

### 1.5 Query Parameter Handling

- **Default Values**:

  - `sort_by`: `display_name`
  - `sort_order`: `asc`
  - `limit`: `20`
  - `offset`: `0`
  - `search`: `undefined`

- **React Query Integration**:

  - Include all query params in `queryKey` for proper caching
  - Example: `['contacts', { search, sort_by, sort_order }]`
  - This ensures separate cache entries for different sort/search combinations

- **Parameter Validation**:

  - Validate all query params against their schemas
  - Provide sensible defaults for missing or invalid values
  - Log validation errors in development

- **Web**:
  - Sync search and sort state with URL using `useSearchParams`
  - Example URL: `/contacts?search=john&sort_by=last_name&sort_order=desc`
- **Mobile**:

  - Manage search and sort state with `useState`
  - Consider using a context or state management for complex filter states

- **Common**:
  - Debounce search input (300-500ms)
  - Reset to first page when changing sort order or search query

## 2. Shared UI Components

### 2.1 Contact Card Component

- Create `ContactCard.tsx` in `packages/ui/components/contacts/`
- Design with Tamagui components
- Make it responsive for both web and mobile
- Include avatar, name, email, and organization
- Add touch/click handlers

### 2.2 Sort Controls

- Create `SortControls.tsx` in `packages/ui/components/contacts/`
- Implement a dropdown for both web and mobile using Tamagui's `Select`
- Show current sort field and direction
- Include visual indicators (e.g., arrow up/down)
- Support keyboard navigation and screen readers
- Localize sort field labels

### 2.3 Search and Sort Bar

- Create `SearchAndSortBar.tsx` in `packages/ui/components/contacts/`
- Combine search input and sort controls in a single row
- Make it responsive (stack on mobile)
- Include clear buttons for both search and sort
- Add proper spacing and theming

### 2.4 Loading and Error States

- Create shared components for:
  - Loading spinners
  - Error messages
  - Empty states
  - Retry buttons
- Ensure consistent styling across platforms
- Include appropriate ARIA attributes

### 2.2 Infinite Scroll Implementation

- Implement infinite scroll using `useInfiniteQuery`
- Add a "Load More" button at the bottom of the list
- Show loading indicators when fetching more data
- Handle edge cases (no more items, loading states, errors)

### 2.3 Search Bar Component

- Create `SearchBar.tsx` in `packages/ui/components/common/`
- Implement debounced search
- Include clear button
- Style consistently with Tamagui

## 3. List View Implementation

### 3.0 Shared Logic

- Create `useContactList` hook in `packages/app/hooks/useContactList.ts` (consumes the data layer hooks):

  ```typescript
  export function useContactList() {
    const [search, setSearch] = useState('');
    const [sortBy, setSortBy] = useState<SortableField>('display_name');
    const [sortOrder, setSortOrder] = useState<SortOrder>('asc');

    const contactsQuery = useContacts({
      search,
      sort_by: sortBy,
      sort_order: sortOrder,
    });

    // Handle sort change
    const handleSortChange = (field: SortableField) => {
      if (field === sortBy) {
        // Toggle sort order if clicking the same field
        setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
      } else {
        // New field, default to ascending
        setSortBy(field);
        setSortOrder('asc');
      }
    };

    return {
      search,
      setSearch,
      sortBy,
      sortOrder,
      onSortChange: handleSortChange,
      ...contactsQuery,
    };
  }
  ```

### 3.1 Web Implementation

- Create `ContactsScreen.tsx` in `apps/web/app/contacts/`
- Use the `useContacts` hook
- Implement the list with virtualized rendering for performance
- Add pull-to-refresh functionality
- Handle empty states

### 3.2 Mobile Implementation

- Create `ContactsScreen.tsx` in `apps/mobile/app/contacts/`
- Reuse the same `useContacts` hook
- Use `FlatList` for native performance
- Implement pull-to-refresh
- Handle empty states

## 4. State Management

### 4.1 URL State (Web)

- Sync search state with URL query params
- Use `useSearchParams` from tanstack router
- Handle browser navigation (back/forward)

### 4.2 Local State (Mobile)

- Manage search and pagination with React state
- Use React Navigation params if needed
- Handle deep linking if required

## 5. Performance Optimizations

### 5.1 Infinite Scroll Performance

- Web: Use `@tanstack/react-virtual` with infinite scroll
- Mobile: Use `FlatList` with `onEndReached` and `onEndReachedThreshold`
- Implement `getNextPageParam` in `useInfiniteQuery` for efficient data fetching

### 5.2 Image Optimization

- Use `expo-image` for consistent image handling
- Implement proper image caching
- Use blurhash for placeholders

## 6. Testing

### 6.1 Unit Tests

- Test the `useContacts` hook
- Test data transformation functions
- Test error states

### 6.2 Component Tests

- Test ContactCard rendering
- Test infinite scroll behavior
- Test Search functionality

### 6.3 Integration Tests

- Test infinite scroll loading
- Test search functionality with infinite scroll
- Test error states and empty states

## 7. Accessibility & Localization

### 7.1 Screen Reader Support

- Add proper ARIA labels
- Ensure proper focus management
- Test with VoiceOver/TalkBack

### 7.2 Keyboard Navigation

- Ensure tab order is logical
- Add keyboard shortcuts where appropriate
- Test keyboard-only navigation

## 8. Error Handling

### 8.1 API Errors

- Handle network errors
- Handle 404/500 responses
- Show appropriate error messages

### 8.2 Edge Cases

- Empty search results
- No network connection
- First-time user experience

## 9. Documentation

### 9.1 Component Documentation

- Add JSDoc comments to all components
- Document props and usage examples
- Include TypeScript types

### 9.2 API Documentation

- Document the contacts API endpoint
- Include example requests/responses
- Document error responses

### 9. Future Improvements

### 9.1 Analytics Integration

- Track user interactions with sort controls
- Monitor search terms and result counts
- Analyze most common sort patterns
- (To be implemented in a future phase)

### 10. Performance Monitoring

- Track API response times
- Monitor rendering performance
- Identify slow queries
- (To be implemented in a future phase)

### 10.1 Performance

- Optimize infinite scroll performance
- Add skeleton loaders for better UX
- Optimize re-renders with proper memoization

### 10.2 Features

- Add sorting options
- Implement bulk actions
- Add contact grouping/filtering

## Getting Started

1. Start with the API types and hook
2. Build the ContactCard component
3. Implement the basic list view
4. Add pagination
5. Implement search
6. Handle edge cases and errors
7. Test thoroughly
8. Optimize performance

Remember to test on both web and mobile throughout the development process to ensure consistency.

```

```
