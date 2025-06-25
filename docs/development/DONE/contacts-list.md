# Contacts List Implementation Guide

This document outlines the step-by-step implementation of a contacts list view with infinite scroll and search functionality that works across both web and mobile platforms using shared components.

## 1. Mobile Implementation ✅

### 1.1 Mobile Contacts Screen

- [x] **Header Icons**:
  - Added search and sort icons in the header using Expo Vector Icons
  - Toggle panels when clicked
  - Show active state with background highlight
  - Icons: `Search` and `ListFilter` from Tamagui Lucide Icons

- [x] **Search Panel**:
  - Slides down from the header with smooth animation
  - Includes a search input with auto-focus
  - Updates search term in real-time with debouncing
  - Uses Tamagui's `AnimatePresence` for enter/exit animations

- [x] **Sort Panel**:
  - Slides down from the header with smooth animation
  - Shows sort options (Name, Email, Date Added, Last Modified)
  - Displays sort direction indicators with appropriate icons
    - `ArrowUpAZ`/`ArrowDownAZ` for text fields
    - `ArrowUp01`/`ArrowDown01` for date fields
  - Updates sort field and direction when selected
  - Only one panel visible at a time
  - Maintains sort panel visibility after selection for better UX

- [x] **ContactList**:
  - Simplified to only handle display logic
  - Accepts search and sort props from parent
  - No longer manages search/sort state internally
  - Uses `useContactList` hook for data fetching

- [x] **Type Safety**:
  - Added proper TypeScript types for all props and state
  - Fixed type issues with `SortableField`
  - Improved type safety for sort direction ('asc' | 'desc')
  - Type-safe event handlers and callbacks

### 1.2 Mobile-Specific Patterns

- [x] **Mobile-Specific Patterns**:
  - Slide-down panels for search/sort with proper touch handling
  - Visual feedback for active states using theme colors
  - Proper touch targets (minimum 44x44px)
  - Dismiss panels when tapping outside
  - Maintains scroll position when switching between panels
  - Optimized keyboard behavior with `autoFocus` on search input
  - Proper safe area insets handling

- [x] **Performance**:
  - Optimized re-renders with `useCallback` for event handlers
  - Minimal state updates with batched updates
  - Efficient list rendering with `FlatList`
  - Memoized components with `React.memo` where appropriate
  - Smooth animations with Tamagui's `AnimatePresence`
  - Optimized panel transitions with proper layout management
  - Used `useInteractionState` for consistent state management

## 2. Web Implementation ✅

### 2.1 Web Contacts Page

- [x] **Responsive Layout**:
  - Sidebar with search/sort controls on desktop
  - Full-width layout on mobile with collapsible panels
  - Proper scrolling behavior for both sidebar and content
  - Fixed header with consistent spacing

- [x] **Search & Sort**:
  - Integrated `SearchAndSortBar` component
  - Debounced search input with clear button
  - Sort controls with visual indicators
  - Responsive behavior for all screen sizes

- [x] **Contact List**:
  - Infinite scroll with loading states
  - Smooth scrolling behavior
  - Loading overlay during search/sort operations
  - Empty state and error handling

- [x] **Recent Fixes**:
  - Fixed sort panel auto-dismiss on selection
  - Improved loading overlay visibility
  - Fixed responsive layout issues
  - Ensured proper scrolling in both sidebar and main content
  - Added proper TypeScript types for all props

## 3. API Integration Layer ✅

### 1.1 Schema Definitions 

- [x] **Base Schemas** (`packages/data/src/schemas/api.ts`):

  - [x] `PaginatedApiResponseSchema`: Generic schema for paginated responses
  - [x] `paginationQueryParamsSchema`: Schema for pagination params (`limit`, `offset`)

- [x] **Contact Schemas** (`packages/data/src/schemas/contacts.ts`):
  - [x] `contactSchema`: Validates individual contact objects
  - [x] `paginatedContactsSchema`: Validates paginated contacts response
  - [x] `contactsQueryParamsSchema`: Combines pagination with search

### 3.1 API Client ✅

- [x] Use the existing `apiClient` from `./fetcher` in `packages/data/src/contacts.ts`
- [x] Implement `fetchContacts` with proper typing and error handling
- [x] Define `PaginatedContactsResponse` interface

```typescript
import { apiClient } from './fetcher';
import { paginatedContactsSchema } from './schemas/contacts';
import type { ContactsQueryParams } from './schemas/contacts';

export interface PaginatedContactsResponse {
  items: Contact[];
  count: number;
}

export async function fetchContacts(
  params: ContactsQueryParams
): Promise<PaginatedContactsResponse> {
  const response = await apiClient.get('/contacts/', paginatedContactsSchema, {
    params,
  });

  // Ensure we have a valid response that matches our interface
  if ('items' in response && 'count' in response) {
    return {
      items: response.items as Contact[],
      count: response.count as number,
    };
  }

  throw new Error('Invalid response format from contacts API');
}
```

### 1.3 Constants 

- [x] Created `constants.ts` in `packages/data/src/`
- [x] Added `ITEMS_PER_PAGE` constant with documentation

```typescript
/**
 * Default number of items to show per page in paginated lists
 */
export const ITEMS_PER_PAGE = 20;
```

### 1.4 React Query Hooks 

#### 1.4.1 Base Hook

- [x] Created `useContacts` hook in `packages/data/src/hooks/useContacts.ts`
- [x] Implemented infinite scroll with proper pagination
- [x] Added TypeScript types for query parameters and responses
- [x] Integrated with `fetchContacts` API client

```typescript
import { useInfiniteQuery } from '@tanstack/react-query';
import { ITEMS_PER_PAGE } from '../constants';
import { fetchContacts, PaginatedContactsResponse } from '../contacts';
import type { ContactsQueryParams } from '../schemas/contacts';

export function useContacts(
  params: Omit<ContactsQueryParams, 'limit' | 'offset'>
) {
  return useInfiniteQuery<
    PaginatedContactsResponse,
    Error,
    PaginatedContactsResponse,
    [string, typeof params],
    number
  >({
    queryKey: ['contacts', params],
    initialPageParam: 0,
    queryFn: async ({ pageParam }) => {
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

#### 1.4.2 Pagination Utility 

- [x] Created reusable pagination utility in `packages/utils/src/pagination.ts`
- [x] Implemented `usePagination` hook in `packages/utils/src/hooks/usePagination.ts`
- [x] Added TypeScript types for pagination state and options
- [x] Designed for reuse across different paginated endpoints

```typescript
// Example usage
const { items, pagination, updateItems, hasMore, loadMore, isLoading } =
  usePagination<Contact>({
    limit: 20,
  });
```

#### 1.4.3 Combined Hook 

- [x] Created `useContactList` hook in `packages/data/src/hooks/useContactList.ts`
- [x] Combined `useContacts` with `usePagination` for a simpler API
- [x] Added proper TypeScript types and error handling
- [x] Implemented loading states and pagination controls

```typescript
// Example usage
const {
  contacts,
  isLoading,
  isLoadingMore,
  error,
  isEmpty,
  hasMore,
  loadMore,
} = useContactList({
  search: searchTerm,
  sort_by: 'display_name',
  sort_order: 'asc',
});
```

### 1.5 Sorting Implementation 

- [x] **Sorting Schema** (`packages/data/src/schemas/contacts.ts`):
  - [x] Added `SORTABLE_FIELDS` constant with all sortable fields
  - [x] Created `sortOrderSchema` for 'asc'/'desc' validation
  - [x] Created `sortFieldSchema` for field name validation
  - [x] Updated `contactsQueryParamsSchema` to include sorting parameters

- [x] **Default Sorting**:
  - [x] Default sort field: `display_name`
  - [x] Default sort order: `asc`

- [x] **UI Integration**:
  - [x] Integrated with `SearchAndSortBar` component
  - [x] Added visual indicators for sort direction
  - [x] Implemented sort change handlers
  - [x] Added proper TypeScript types for sort fields
  - [x] Validated sort fields against schema

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

## 2. UI Components 

### 2.1 Search and Sort Bar

- [x] **SearchAndSortBar Component** (`packages/ui/src/components/inputs/SearchAndSortBar.tsx`):
  - [x] Combines search and sort controls in a single component
  - [x] Responsive layout (collapsible panels on mobile)
  - [x] Type-safe props and callbacks
  - [x] Integration with `useContactList` hook

- [x] **Search Functionality**:
  - [x] Debounced search input
  - [x] Clear button to reset search
  - [x] Loading states during search

- [x] **Sort Functionality**:
  - [x] Dropdown for sort field selection
  - [x] Toggle for sort direction (asc/desc)
  - [x] Visual indicators for current sort state

### 2.2 Contact List

- [x] **ContactList Component** (`packages/app/components/contacts/ContactList.tsx`):
  - [x] Integrates with `useContactList` hook
  - [x] Handles loading and error states
  - [x] Implements infinite scroll
  - [x] Responsive layout for different screen sizes

- [x] **State Management**:
  - [x] Search term state
  - [x] Sort field and direction state
  - [x] Pagination state
  - [x] Loading and error states

- [x] **Type Safety**:
  - [x] Proper TypeScript types for all props and state
  - [x] Validation of sort fields against schema
  - [x] Type-safe event handlers

### 2.1 Icon System 

- [x] **Implementation Details**:
  - Created a minimal icon system in `packages/ui/src/icons`
  - Used Expo Vector Icons for cross-platform compatibility
  - Implemented a simple API with size and color props
  - Added support for both web and mobile platforms
  - Added proper TypeScript types for all icons
  - Ensured proper integration with Tamagui theming

- [x] **Key Features**:
  - Direct import of Ionicons from `@expo/vector-icons`
  - Consistent API across all icon components
  - Support for Tamagui size tokens
  - Proper handling of SVG rendering in React Native
  - Delayed rendering to prevent initialization issues

- [x] **Example Usage**:
  ```tsx
  import { Ionicons } from '@expo/vector-icons';
  // ...
  <Ionicons name="settings-outline" size={24} color="black" />
  ```

### 2.2 Recent Improvements and Fixes

### 2.1 API Response Handling

- [x] **Fixed API Response Parsing**:

  - Now handles both direct and wrapped response formats:
    - Direct: `{ items: [...], count: N }`
    - Wrapped: `{ data: { items: [...], count: N }, success: true }`
  - Added comprehensive error handling and logging

- [x] **Schema Validation**:
  - Updated `contactSchema` to use `v.nullish()` for all optional fields
  - Properly handles `null` and `undefined` values from the API
  - Added missing fields like `organization` to the schema

### 2.2 Authentication

- [x] **User Authentication**:
  - Added `userId` parameter to API calls
  - Ensures proper JWT token handling
  - Defaults to 'current_user' if not provided

### 2.3 Debugging and Logging

- [x] **Enhanced Logging**:
  - Added detailed logging throughout the data flow
  - Logs API requests, responses, and state changes
  - Helps with debugging and monitoring

### 2.4 Type Safety

- [x] **Improved TypeScript Types**:
  - Fixed type issues in `ContactList` component
  - Properly handle optional fields with `null | undefined`
  - Added type guards for API responses

## 3. Implementation Decisions

### 3.1 Mobile UI Behavior

- **Panel Management**:
  - Only one panel (search/sort) visible at a time
  - Opening a panel automatically closes the other
  - Panels appear as thin boxes below the header bar
  - Search input auto-focuses when panel opens

### 3.2 State Management

- **URL Parameters** (web only):
  - Search query: `?q=search+term`
  - Sort field: `?sort=display_name`
  - Sort order: `?order=asc|desc`
- **Default Sort**: `display_name` ascending
- **No persistence** of user preferences

### 3.3 Performance

- **Debounce Delay**: 400ms for search input
- **Virtualization**:
  - Mobile: `FlatList` for efficient rendering
  - Web: `react-virtual` for virtualized lists
- **Page Size**: 7 items per page

### 3.4 Error Handling

- **Empty Results**: "No contacts matched your search" message
- **Loading States**:
  - Spinner overlays existing results during loading
  - No content shift during pagination
- **API Errors**:
  - Toast notification for errors
  - Last good state remains visible
  - Error message: "There was an error searching your contacts. Please try again later."

### 3.5 Responsive Breakpoints

- **Mobile**: < 768px
- **Tablet**: 768px - 1023px
- **Desktop**: 1024px+

## 4. Component Architecture: Search and Sort

### 4.1 Design Principles

- **Reusability**: Components should be generic enough to work with any model
- **Separation of Concerns**: UI components should be decoupled from business logic
- **Consistency**: Follow existing patterns in the codebase (e.g., `CInput` component)
- **Type Safety**: Full TypeScript support with proper type definitions
- **Accessibility**: Built-in support for keyboard navigation and screen readers

### 4.2 Component Structure

#### SearchInput (`packages/ui/components/inputs/SearchInput.tsx`)

A generic search input component with the following features:

```typescript
interface SearchInputProps {
  // Core functionality
  value: string;
  onChangeText: (text: string) => void;

  // Customization
  placeholder?: string;
  debounceMs?: number;
  autoFocus?: boolean;
  testID?: string;

  // Styling
  size?: 'small' | 'medium' | 'large';
  variant?: 'default' | 'minimal';
}
```

#### SortControls (`packages/ui/components/inputs/SortControls.tsx`)

A generic sort control component that can be used with any sortable data:

```typescript
interface SortOption {
  value: string;
  label: string;
}

interface SortControlsProps {
  // Sort configuration
  options: SortOption[];
  value: string;
  direction: 'asc' | 'desc';

  // Event handlers
  onSortChange: (value: string) => void;
  onDirectionChange: (direction: 'asc' | 'desc') => void;

  // UI
  size?: 'small' | 'medium' | 'large';
  variant?: 'dropdown' | 'segmented';
  testID?: string;
}
```

#### SearchAndSortBar (`packages/ui/components/layout/SearchAndSortBar.tsx`)

A responsive container that combines search and sort controls:

```typescript
interface SearchAndSortBarProps {
  // Components to render
  searchComponent: React.ReactNode;
  sortComponent: React.ReactNode;

  // Layout options
  stackOnMobile?: boolean;
  mobileIconsOnly?: boolean;

  // Spacing
  gap?: number | string;
  padding?: number | string;
}
```

### 4.3 Implementation Strategy 

1. **Built Generic Components**
   - Implemented `SearchInput` with core functionality 
   - Implemented `SortControls` with sort options 
   - Tested components in isolation with mock data 
- [x] **Created Reusable Components**
  - Designed components to be generic and reusable across models 
  - Used TypeScript generics where appropriate for type safety 
  - Ensured consistent API across components 
- [x] **Built Responsive Layout**
  - Implemented `SearchAndSortBar` with responsive behavior 
  - Added mobile-specific UI patterns (bottom sheets, panels) 
  - Ensured smooth transitions between states 
- [x] **Integrated with Data Layer**
  - Components work with `useContactList` hook 
  - Handles URL state synchronization on web 
  - Uses local state on mobile 
  - Resets pagination when search/sort changes 

## 5. Implementation: Search and Sort Functionality 

### 5.1 Search Functionality 

- [x] **SearchInput Component**:
  - Created reusable `SearchInput` component in `packages/ui/src/components/inputs/SearchInput.tsx`
  - Based on `CInput` with consistent styling
  - Includes clear button and search icon
  - Implements debounced search (400ms default)
  - Supports both web and mobile platforms
  - Full TypeScript support with proper types

- [x] **Mobile-Specific UI**:
  - Search icon in header that toggles search bar visibility
  - Collapsible search panel that appears below header
  - Auto-focus on mobile when search panel opens
  - Optimized mobile keyboard with search button

- [x] **Desktop-Specific UI**:
  - Persistent search bar in the header
  - Supports keyboard shortcuts (ESC to clear)
  - Auto-focus on page load (configurable)
  - Responsive design that adapts to container width

### 5.2 Sort Functionality 

- [x] **SortControls Component**:
  - Created `SortControls` component in `packages/ui/src/components/inputs/SortControls.tsx`
  - Dropdown/select for sort field selection
  - Shows current sort field and direction
  - Supports all sortable fields from schema
  - Visual indicators for sort direction (ascending/descending)
  - Type-safe with proper TypeScript types

- [x] **Mobile-Specific UI**:
  - Sort icon in header that opens sort options
  - Bottom sheet for sort options on mobile
  - Larger touch targets for better mobile interaction
  - Visual feedback for selected sort option

- [x] **Desktop-Specific UI**:
  - Dropdown menu next to search bar
  - Keyboard navigation support (arrow keys, Enter, Escape)
  - Hover states and tooltips
  - Clean, consistent styling with Tamagui theme

### 5.3 Responsive Layout 

- [x] **SearchAndSortBar Component**:
  - Implemented in `packages/ui/src/components/inputs/SearchAndSortBar.tsx`
  - Responsive container that adapts to screen size
  - Desktop: Single row layout (search + sort side by side)
  - Mobile: Header icons with expandable panels
  - Smooth transitions between states
  - Clean, consistent styling with Tamagui tokens
  - Type-safe with proper TypeScript types
  - Accessible with proper ARIA attributes

### 5.4 Internationalization

- [x] **Translation Support**:
  - Added translation keys for all UI text
  - Separate namespaces for common and contacts-specific strings
  - Properly formatted dates and numbers according to locale
  - RTL layout support

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
