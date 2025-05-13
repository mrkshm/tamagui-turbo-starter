import { YStack } from '@bbook/ui';
import { SafeAreaView } from 'react-native';
import { PasswordReset } from '@bbook/app/components/auth/PasswordReset';
import { PasswordResetSuccess } from '@bbook/app/components/auth/PasswordResetSuccess';
import { useState } from 'react';
import { useRouter } from 'expo-router';

export default function PasswordResetScreen() {
  const router = useRouter();
  const [resetSuccess, setResetSuccess] = useState(false);
  const [resetEmail, setResetEmail] = useState('');

  const handleResetRequestSuccess = (email: string) => {
    console.log('Password reset request successful for email:', email);
    setResetEmail(email);
    setResetSuccess(true);
  };

  const handleNavigateToLogin = () => {
    console.log('Navigating to login page');
    router.push('/auth/login');
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
        {resetSuccess ? (
          <PasswordResetSuccess
            email={resetEmail}
            onBackToLogin={handleNavigateToLogin}
          />
        ) : (
          <PasswordReset
            onResetRequestSuccess={handleResetRequestSuccess}
            onNavigateToLogin={handleNavigateToLogin}
          />
        )}
      </YStack>
    </SafeAreaView>
  );
}
