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
import { useColorScheme } from 'react-native';

export function Provider({
  children,
  ...rest
}: Omit<TamaguiProviderProps, 'config'>) {
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? 'dark' : 'light';
  return (
    <TamaguiProvider config={config} {...rest}>
      <ThemeProvider defaultTheme={theme}>
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
