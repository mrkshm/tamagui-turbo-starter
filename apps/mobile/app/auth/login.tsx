import { YStack } from '@bbook/ui';
import { SafeAreaView } from 'react-native';
import { LoginScreen } from '@bbook/app/components/auth/LoginScreen';
import { Stack, useRouter } from 'expo-router';

export default function Login() {
  const router = useRouter();

  const handleLoginSuccess = (user: any) => {
    console.log('Login success, navigating to member area', user);
    router.replace('/(member)');
  };

  const handleNavigateToSignUp = () => {
    console.log('Navigating to signup');
    router.push('/auth/signup');
  };

  const handleNavigateToWaiting = (email: string) => {
    console.log('Email not verified, navigating to waiting page', email);
    router.push('/auth/waiting');
  };

  const handleNavigateToForgotPassword = () => {
    console.log('Navigating to forgot password');
    router.push('/auth/password-reset');
  };

  return (
    <>
      <Stack.Screen options={{ headerTitle: 'Sign In' }} />
      <SafeAreaView style={{ flex: 1 }}>
        <YStack
          padding="$4"
          gap="$4"
          width="100%"
          flex={1}
          backgroundColor="$background"
        >
          <LoginScreen
            onLoginSuccess={handleLoginSuccess}
            onNavigateToSignUp={handleNavigateToSignUp}
            onNavigateToWaiting={handleNavigateToWaiting}
            onNavigateToForgotPassword={handleNavigateToForgotPassword}
          />
        </YStack>
      </SafeAreaView>
    </>
  );
}
