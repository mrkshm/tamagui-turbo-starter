import { apiClient } from './fetcher';
import { paginatedContactsSchema } from './schemas/contacts';
import type { ContactsQueryParams, Contact } from './schemas/contacts';

export interface PaginatedContactsResponse {
  items: Contact[];
  count: number;
}

/**
 * Fetches contacts with pagination, search, and sorting
 *
 * @param params - Query parameters for filtering, sorting and pagination
 * @param userId - User ID for authentication (defaults to 'current_user')
 * @returns Paginated contacts response with items and total count
 */
export async function fetchContacts(
  params: ContactsQueryParams,
  userId: string = 'current_user'
): Promise<PaginatedContactsResponse> {
  console.log('fetchContacts: starting request', { params, userId });

  try {
    const response = await apiClient.get(
      '/contacts/',
      paginatedContactsSchema,
      {
        params,
        userId, // Pass userId for authentication
      }
    );

    console.log('fetchContacts: raw response', response);

    // Check if response is wrapped in a data property (API format)
    if (
      response &&
      typeof response === 'object' &&
      'data' in response &&
      typeof response.data === 'object' &&
      response.data !== null
    ) {
      const data = response.data as any;

      // Check if the data has the expected structure
      if ('items' in data && 'count' in data) {
        const result = {
          items: data.items as Contact[],
          count: data.count as number,
        };

        console.log('fetchContacts: returning data', {
          itemsCount: result.items.length,
          totalCount: result.count,
        });

        return result;
      }
    }

    // Direct format check
    if ('items' in response && 'count' in response) {
      const result = {
        items: response.items as Contact[],
        count: response.count as number,
      };

      console.log('fetchContacts: returning data (direct format)', {
        itemsCount: result.items.length,
        totalCount: result.count,
      });

      return result;
    }

    console.error('fetchContacts: invalid response format', response);
    // Handle error case
    throw new Error('Invalid response format from contacts API');
  } catch (error) {
    console.error('fetchContacts: error', error);
    throw error;
  }
}
