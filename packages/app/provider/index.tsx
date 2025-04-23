import {
  CustomToast,
  type TamaguiProviderProps,
  ToastProvider,
  isWeb,
  ThemeProvider,
} from '@bbook/ui';
import { ToastViewport } from './ToastViewport';
import { TamaguiProvider } from 'tamagui';
import { config } from '@bbook/config';

export function Provider({
  children,
  ...rest
}: Omit<TamaguiProviderProps, 'config'>) {
  return (
    <TamaguiProvider config={config} {...rest}>
      <ThemeProvider>
        <ToastProvider
          swipeDirection={isWeb ? 'horizontal' : 'vertical'}
          duration={6000}
          native={[]}
        >
          {children}
          <CustomToast />
          <ToastViewport />
        </ToastProvider>
      </ThemeProvider>
    </TamaguiProvider>
  );
}
