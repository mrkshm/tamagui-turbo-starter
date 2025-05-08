import { Text, YStack } from '@bbook/ui';
import { SafeAreaView } from 'react-native';
import { SignUpScreen } from '@bbook/app/components/auth/SignUpScreen';
import { useRouter } from 'expo-router';

export default function Signup() {
  const router = useRouter();

  const handleSignUpSuccess = (user: any) => {
    console.log('Signup success, navigating to waiting area', user);
    router.replace('/(public)/waiting');
  };

  const handleNavigateToLogin = () => {
    console.log('Navigating to login');
    router.push('/(public)/login');
  };

  const handleNavigateToTerms = () => {
    console.log('Navigating to terms and conditions');
    // For mobile, we would typically use Linking to open a URL
    // or navigate to a screen within the app
    import('expo-linking').then(Linking => {
      Linking.openURL('https://example.com/terms');
    }).catch(err => {
      console.error('Failed to open terms and conditions:', err);
    });
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
        <SignUpScreen
          onSignUpSuccess={handleSignUpSuccess}
          onNavigateToLogin={handleNavigateToLogin}
          onNavigateToTerms={handleNavigateToTerms}
        />
      </YStack>
    </SafeAreaView>
  );
}
