import { useState, useCallback } from 'react';
import { createPagination, updatePagination } from '../pagination';
import type { PaginationOptions, PaginationResult } from '../pagination';

export function usePagination<T = unknown>(options: PaginationOptions = {}) {
  const [pagination, setPagination] = useState(() => createPagination(options));
  const [items, setItems] = useState<T[]>([]);
  const [isLoadingFirstPage, setIsLoadingFirstPage] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // Update pagination when new data is received
  const updateItems = useCallback((newItems: T[], total?: number, replace: boolean = false) => {
    setPagination((prev) => updatePagination(prev, newItems, total));
    
    // Either replace all items or append to existing items
    setItems((prev) => replace ? [...newItems] : [...prev, ...newItems]);
    
    setIsLoadingFirstPage(false);
    setIsLoadingMore(false);
    
    // Log for debugging
    console.log('usePagination.updateItems', { 
      newItemsCount: newItems.length, 
      total, 
      replace
    });
  }, []);

  // Reset pagination (e.g., when filters change)
  const reset = useCallback(
    (newOptions: Partial<PaginationOptions> = {}) => {
      setPagination(createPagination({ ...options, ...newOptions }));
      setItems([]);
      setIsLoadingFirstPage(false);
      setIsLoadingMore(false);
    },
    [options]
  );

  // Set loading states
  const setLoading = useCallback((isFirstPage: boolean) => {
    if (isFirstPage) {
      setIsLoadingFirstPage(true);
      setIsLoadingMore(false);
    } else {
      setIsLoadingFirstPage(false);
      setIsLoadingMore(true);
    }
  }, []);

  // Create a load more handler
  const handleLoadMore = useCallback(
    (onLoadMore: (nextOffset: number) => void) => {
      return () => {
        if (pagination.hasMore && !isLoadingMore) {
          setIsLoadingMore(true);
          onLoadMore(pagination.nextOffset);
        }
      };
    },
    [pagination, isLoadingMore]
  );

  return {
    items,
    pagination,
    updateItems,
    reset,
    setLoading,
    handleLoadMore,
    // Helpers
    hasMore: pagination.hasMore,
    isLoading: isLoadingFirstPage || isLoadingMore,
    isLoadingFirstPage,
    isLoadingMore,
    isEmpty: items.length === 0,
  };
}

export type { PaginationResult };
