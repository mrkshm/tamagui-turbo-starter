// Import DevTools setup at the very top
// Initialize DevTools before any other imports

import { useFonts } from 'expo-font';
import { Redirect, Stack, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import 'react-native-reanimated';
import { Provider } from '@bbook/app/provider';
import { useAuth } from '@bbook/app/provider/auth-provider';
import { useColorScheme } from '@/hooks/useColorScheme';
import { initializeStorage, initializeErrorTracking } from '@bbook/data';
import { mobileStorageAdapter } from '../lib/storage-adapter';
import { mobileErrorAdapter } from '../lib/error-adapter';
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
import { View } from 'react-native';

// Initialize adapters
initializeStorage(mobileStorageAdapter);
initializeErrorTracking(mobileErrorAdapter);

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
  const segments = useSegments();

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  // Return null until fonts are loaded
  if (!loaded) {
    return null;
  }

  return (
    <Providers>
      <RootLayoutNav />
      <StatusBar style="auto" />
    </Providers>
  );
}

function RootLayoutNav() {
  const { user, isLoading } = useAuth();
  const segments = useSegments();

  // Return null until auth state is loaded
  if (isLoading) {
    return null;
  }

  // Check which segment we're in
  const inAuthGroup = segments[0] === '(member)';
  const inPublicGroup = segments[0] === '(public)';

  // Redirect based on auth state
  if (!user && inAuthGroup) {
    // If user is not logged in and trying to access a protected route
    return <Redirect href="/(public)" />;
  }

  if (user && inPublicGroup) {
    // If user is logged in and trying to access a public route
    return <Redirect href="/(member)" />;
  }

  return (
    <Stack>
      <Stack.Screen name="(member)" options={{ headerShown: false }} />
      <Stack.Screen name="(public)" options={{ headerShown: false }} />
      <Stack.Screen name="+not-found" />
    </Stack>
  );
}

const Providers = ({ children }: { children: React.ReactNode }) => {
  return <Provider>{children}</Provider>;
};
