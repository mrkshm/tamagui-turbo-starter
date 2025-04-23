// Import DevTools setup at the very top
// Initialize DevTools before any other imports

import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import 'react-native-reanimated';
import { Provider } from '@bbook/app/provider';
import { useColorScheme } from '@/hooks/useColorScheme';
import {
  useFonts as useJuraFonts,
  Jura_400Regular,
  Jura_700Bold,
} from '@expo-google-fonts/jura';
import {
  useFonts as useInterFonts,
  Inter_400Regular,
  Inter_700Bold,
} from '@expo-google-fonts/inter';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [juraLoaded] = useJuraFonts({
    Jura_400Regular,
    Jura_700Bold,
  });
  const [interLoaded] = useInterFonts({
    Inter_400Regular,
    Inter_700Bold,
  });
  const loaded = juraLoaded && interLoaded;

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <Providers>
      <RootLayoutNav />
    </Providers>
  );
}

const Providers = ({ children }: { children: React.ReactNode }) => {
  return <Provider>{children}</Provider>;
};

function RootLayoutNav() {
  const colorScheme = useColorScheme();
  return (
    <>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style="auto" />
    </>
  );
}
