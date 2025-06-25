import { QueryClient, QueryClientConfig } from '@tanstack/react-query';

export {
  QueryClient,
  QueryClientProvider,
  useQuery,
  useMutation,
  useQueryClient,
  useInfiniteQuery,
} from '@tanstack/react-query';

const defaultConfig: QueryClientConfig = {
  defaultOptions: {
    queries: {
      staleTime: 60 * 10 * 1000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
};

export const createQueryClient = (config?: QueryClientConfig) =>
  new QueryClient({
    ...defaultConfig,
    ...config,
    defaultOptions: {
      ...defaultConfig.defaultOptions,
      ...config?.defaultOptions,
    },
  });
