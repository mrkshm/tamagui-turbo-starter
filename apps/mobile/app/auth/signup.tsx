import { YStack } from '@bbook/ui';
import { SafeAreaView } from 'react-native';
import { SignUpScreen } from '@bbook/app/components/auth/SignUpScreen';
import { useRouter } from 'expo-router';
import { TermsSheet, useTermsSheet } from '../components/TermsSheet';

export default function Signup() {
  const router = useRouter();
  const termsSheet = useTermsSheet();

  const handleSignUpSuccess = (user: any) => {
    console.log('Signup success, navigating to waiting area', user);
    router.push('/auth/waiting');
  };

  const handleNavigateToLogin = () => {
    console.log('Navigating to login');
    router.push('/auth/login');
  };

  const handleNavigateToTerms = () => {
    console.log('Opening terms and conditions sheet');
    termsSheet.onIn();
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

        {/* Terms and Conditions Sheet */}
        <TermsSheet
          open={termsSheet.state}
          onOpenChange={(open) => {
            if (!open) termsSheet.onOut();
          }}
        />
      </YStack>
    </SafeAreaView>
  );
}
