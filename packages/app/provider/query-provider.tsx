import { QueryClient, QueryClientProvider } from '@bbook/data';
import { ReactNode, useEffect, useState } from 'react';
import { Platform } from 'react-native';

export function QueryProvider({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => {
    console.log('Initializing QueryClient...');
    return new QueryClient({
      defaultOptions: {
        queries: {
          staleTime: 60 * 1000, // 1 minute
          gcTime: 5 * 60 * 1000, // 5 minutes
          retry: 1,
          refetchOnWindowFocus: false,
          retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
        },
      },
    });
  });

  // Log when the provider is mounted
  useEffect(() => {
    console.log('QueryProvider mounted on platform:', Platform.OS);
    return () => {
      console.log('QueryProvider unmounting...');
    };
  }, []);

  try {
    return (
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    );
  } catch (error) {
    console.error('Error in QueryProvider:', error);
    // Return children without the provider in case of error
    // This ensures the app doesn't crash completely
    return <>{children}</>;
  }
}
