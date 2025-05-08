import {
  CustomToast,
  type TamaguiProviderProps,
  ToastProvider,
  isWeb,
  TamaguiProvider,
  ThemeProvider,
} from '@bbook/ui';
import { ToastViewport } from './ToastViewport';
import { config } from '@bbook/ui';
import { QueryClientProvider, createQueryClient } from '@bbook/data';
import { AuthProvider } from './auth-provider';

// Create a client
const queryClient = createQueryClient();

export function Provider({
  children,
  ...rest
}: Omit<TamaguiProviderProps, 'config'>) {
  return (
    <TamaguiProvider config={config} {...rest}>
      <ThemeProvider>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <ToastProvider
              swipeDirection={isWeb ? 'horizontal' : 'vertical'}
              duration={6000}
              native={[]}
            >
              {children}
              <CustomToast />
              <ToastViewport />
            </ToastProvider>
          </AuthProvider>
        </QueryClientProvider>
      </ThemeProvider>
    </TamaguiProvider>
  );
}
