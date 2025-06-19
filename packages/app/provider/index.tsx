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
import { QueryProvider } from './query-provider';
import { AuthProvider } from './auth-provider';

export function Provider({
  children,
  ...rest
}: Omit<TamaguiProviderProps, 'config'>) {
  return (
    <QueryProvider>
      <TamaguiProvider config={config} {...rest}>
        <ThemeProvider>
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
        </ThemeProvider>
      </TamaguiProvider>
    </QueryProvider>
  );
}
