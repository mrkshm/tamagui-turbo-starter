import { Text, YStack } from '@bbook/ui';
import { SafeAreaView } from 'react-native';
import { LoginScreen } from '@bbook/app/components/auth/LoginScreen';
import { useRouter } from 'expo-router';

export default function Login() {
  const router = useRouter();
  
  const handleLoginSuccess = (user: any) => {
    console.log('Login success, navigating to member area', user);
    router.replace('/(member)');
  };
  
  const handleNavigateToSignUp = () => {
    console.log('Navigating to signup');
    router.push('/(public)/signup');
  };
  
  const handleNavigateToWaiting = (email: string) => {
    console.log('Email not verified, navigating to waiting page', email);
    router.replace('/(public)/waiting');
  };
  
  return (
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
        />
      </YStack>
    </SafeAreaView>
  );
}
