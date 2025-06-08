import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query';
import { useDebounce } from 'use-debounce';
import { ITEMS_PER_PAGE } from '../constants';
import { fetchContacts } from '../contacts';
import type { ContactsQueryParams } from '../schemas/contacts';

/**
 * Hook for fetching contacts with infinite scroll, search, and sorting
 *
 * @param params - Query parameters excluding pagination (limit/offset)
 * @param userId - User ID for authentication (defaults to 'current_user')
 * @returns InfiniteQuery result with contacts data and helper methods
 */
export function useContacts(
  params: Omit<ContactsQueryParams, 'limit' | 'offset'> = {},
  userId: string = 'current_user'
) {
  const [debouncedParams] = useDebounce(params, 300);
  const queryClient = useQueryClient();

  const query = useInfiniteQuery({
    queryKey: [
      'contacts',
      userId,
      debouncedParams.search ?? '',
      debouncedParams.sort_by ?? '',
      debouncedParams.sort_order ?? '',
    ],
    initialPageParam: 0,
    queryFn: async ({ pageParam }) => {
      const result = await fetchContacts(
        {
          ...debouncedParams,
          limit: ITEMS_PER_PAGE,
          offset: pageParam * ITEMS_PER_PAGE,
        },
        userId
      );

      return {
        ...result,
        items: result.items.map((item) => ({
          ...item,
          id: item.slug,
        })),
      };
    },
    getNextPageParam: (lastPage, allPages) => {
      const loadedItems = allPages.flatMap((page) => page.items).length;
      return loadedItems < lastPage.count ? allPages.length : undefined;
    },
    select: (data) => ({
      ...data,
      // Flatten the pages for easier access to all items
      allItems: data.pages.flatMap((page) => page.items),
      // Helper to get the total count
      totalCount: data.pages[0]?.count || 0,
      // Helper to check if there are more items to load
      hasMore: () => {
        const loadedItems = data.pages.flatMap((page) => page.items).length;
        return loadedItems < (data.pages[0]?.count || 0);
      },
    }),
  });

  // Helper to load more items
  const loadMore = () => {
    if (query.data?.hasMore() && !query.isFetchingNextPage) {
      query.fetchNextPage();
    }
  };

  // Helper to refresh the list
  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: ['contacts', userId] });
  };

  return {
    ...query,
    // Data
    contacts: query.data?.allItems || [],
    // Pagination state
    pagination: {
      hasMore: query.data?.hasMore() || false,
      totalCount: query.data?.totalCount || 0,
    },
    // Loading states
    isLoading: query.isPending,
    isLoadingFirstPage: query.isPending && !query.isFetchingNextPage,
    isLoadingMore: query.isFetchingNextPage,
    // Error state
    error: query.error,
    // Actions
    loadMore,
    refresh,
    // Helpers
    isEmpty: !query.data?.allItems?.length,
  };
}
