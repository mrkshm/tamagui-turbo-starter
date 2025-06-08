interface PaginationState {
  /** Current offset (0-based) */
  offset: number
  /** Number of items per page */
  limit: number
  /** Total number of items available */
  total: number
  /** Items loaded so far */
  loadedItems: number
}

interface PaginationResult extends PaginationState {
  /** If there are more items to load */
  hasMore: boolean
  /** Current page number (1-based) */
  currentPage: number
  /** Total number of pages */
  totalPages: number
  /** Offset for the next page */
  nextOffset: number
  /** If we're currently loading the first page */
  isLoadingFirstPage: boolean
  /** If we're currently loading more items */
  isLoadingMore: boolean
}

interface PaginationOptions {
  /** Initial offset (default: 0) */
  initialOffset?: number
  /** Items per page (default: 20) */
  limit?: number
  /** Total number of items (if known initially) */
  initialTotal?: number
}

/**
 * Creates a pagination state manager
 */
export function createPagination(
  options: PaginationOptions = {}
): PaginationResult {
  const limit = options.limit ?? 20
  const offset = options.initialOffset ?? 0
  const total = options.initialTotal ?? 0
  const loadedItems = offset

  return calculatePagination({
    offset,
    limit,
    total,
    loadedItems,
    isLoadingFirstPage: false,
    isLoadingMore: false,
  })
}

/**
 * Updates pagination state based on new data
 */
export function updatePagination(
  current: PaginationResult,
  newItems: unknown[],
  total?: number
): PaginationResult {
  const newLoadedItems = current.loadedItems + newItems.length
  const newTotal = total ?? current.total
  const newOffset = current.offset + newItems.length

  return calculatePagination({
    offset: newOffset,
    limit: current.limit,
    total: newTotal,
    loadedItems: newLoadedItems,
    isLoadingFirstPage: false,
    isLoadingMore: false,
  })
}

/**
 * Calculates pagination metadata
 */
function calculatePagination(
  state: Omit<PaginationResult, 'hasMore' | 'currentPage' | 'totalPages' | 'nextOffset'>
): PaginationResult {
  const { offset, limit, total, loadedItems, isLoadingFirstPage, isLoadingMore } = state
  
  const totalPages = Math.ceil(total / limit)
  const currentPage = Math.floor(offset / limit) + 1
  const hasMore = offset + loadedItems < total
  const nextOffset = offset + limit

  return {
    offset,
    limit,
    total,
    loadedItems,
    hasMore,
    currentPage,
    totalPages,
    nextOffset,
    isLoadingFirstPage,
    isLoadingMore,
  }
}

/**
 * Creates a function to handle "load more"
 */
export function createLoadMoreHandler(
  pagination: PaginationResult,
  onLoadMore: (nextOffset: number) => void
) {
  return () => {
    if (pagination.hasMore && !pagination.isLoadingMore) {
      onLoadMore(pagination.nextOffset)
    }
  }
}

// Type exports
export type { PaginationState, PaginationResult, PaginationOptions }
