import { useFonts } from 'expo-font';
import { Redirect, Stack, useSegments, useRouter } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import 'react-native-reanimated';
import { Provider } from '@bbook/app/provider';
import { useAuth } from '@bbook/app/provider/auth-provider';
import { useTranslation } from '@bbook/i18n';
import { initializeStorage, initializeErrorTracking } from '@bbook/data';
import { mobileStorageAdapter } from '../lib/storage-adapter';
import { mobileErrorAdapter } from '../lib/error-adapter';
import * as Linking from 'expo-linking';
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
  const router = useRouter();

  // Handle deep links
  useEffect(() => {
    // Set up deep link handling
    const handleDeepLink = (event: { url: string }) => {
      console.log('Deep link received:', event.url);

      // Extract path from URL for logging purposes
      try {
        const urlObj = new URL(event.url);
        const path = urlObj.pathname;

        // Log the specific path for debugging
        if (path.includes('/auth/verify')) {
          console.log('Received verification deep link');
          // Could add toast message here if desired
          // Toast.show({ title: 'Verifying your account...' });
        } else if (path.includes('/auth/password_reset_confirm')) {
          console.log('Received password reset deep link');
          // Could add toast message here if desired
          // Toast.show({ title: 'Processing password reset...' });
        }
      } catch (error) {
        console.error('Error parsing deep link URL:', error);
      }

      // The actual navigation is handled by Expo Router automatically
    };

    // Add event listener for deep links
    const subscription = Linking.addEventListener('url', handleDeepLink);

    // Check for initial URL (app opened via deep link)
    Linking.getInitialURL().then((url) => {
      if (url) {
        console.log('App opened with deep link:', url);
        // The URL is already handled by Expo Router
      }
    });

    // Clean up
    return () => {
      subscription.remove();
    };
  }, [router]);

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
  const { t } = useTranslation();
  const theme = useTheme();
  const textColor = theme.textPrimary?.val;
  const backgroundColor = theme.background?.val;

  // Return null until auth state is loaded
  if (isLoading) {
    return null;
  }

  // Check which segment we're in
  const inAuthGroup = segments[0] === '(member)';
  const inPublicGroup = segments[0] === '(public)';
  const inAuthRoutes = segments[0] === 'auth';

  // Redirect based on auth state
  if (!user && inAuthGroup) {
    // If user is not logged in and trying to access a protected route
    return <Redirect href="/(public)" />;
  }

  if (user && (inPublicGroup || inAuthRoutes)) {
    // Skip redirects for verification and password reset routes
    // Check if any segment in the current path contains these strings
    const pathString = segments.join('/');
    const isVerifyRoute = pathString.includes('verify');
    const isPasswordResetRoute = pathString.includes('password-reset-confirm');

    if (isVerifyRoute || isPasswordResetRoute) {
      // Allow these routes even when logged in
      return <Stack />;
    }
    // If user is logged in and trying to access a public route
    return <Redirect href="/(member)" />;
  }

  return (
    <Stack
      screenOptions={{
        // Default options for all screens
        headerShown: true,
        headerBackTitle: t('auth:header_back_title'),
      }}
    >
      <Stack.Screen name="(member)" options={{ headerShown: false }} />
      <Stack.Screen
        name="(public)"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="auth"
        options={{
          headerTitle: t('auth:header_title'),
          headerTintColor: textColor,
          headerBackground: () => (
            <HeaderBackground style={{ backgroundColor: backgroundColor }} />
          ),
        }}
      />
      <Stack.Screen name="+not-found" />
    </Stack>
  );
}

// Import the SVG preloader
import { SvgPreloader } from '../components/svg-preloader';
import { HeaderBackground } from '@react-navigation/elements';
import { useTheme } from '@bbook/ui/src';

const Providers = ({ children }: { children: React.ReactNode }) => {
  return (
    <Provider>
      {/* Initialize SVG components early in the tree. 
      This is necessary otherwise components imported 
      from other packages will CRASH the app. */}
      <SvgPreloader />
      <View style={{ flex: 1 }}>{children}</View>
    </Provider>
  );
};
