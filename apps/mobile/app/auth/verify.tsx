import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native';
import { YStack } from '@bbook/ui';
import { useVerifyRegistrationMutation, useResendVerificationMutation } from '@bbook/data';
import { VerificationStatus } from '@bbook/app/components/auth/VerificationStatus';
import { useEffect, useState } from 'react';

/**
 * This route handles deep links for email verification.
 * It extracts the token from the URL and processes the verification.
 */
export default function Verify() {
  const router = useRouter();
  const { token } = useLocalSearchParams<{ token: string }>();
  const [userEmail, setUserEmail] = useState<string>('');

  // Verification mutation
  const verifyMutation = useVerifyRegistrationMutation({
    onSuccess: () => {
      setTimeout(() => {
        router.replace('/(member)');
      }, 2000);
    },
  });

  // Resend verification email mutation
  const resendMutation = useResendVerificationMutation({
    onSuccess: (data) => {
      console.log('Verification email resent successfully:', data);
    },
  });

  useEffect(() => {
    if (token) {
      verifyMutation.mutate(token);
      
      // Try to extract email from token (if possible)
      // This is a simple example - in a real app, you might get this from the server response
      try {
        // Extract email from token or other sources if available
        // For now, we'll use a placeholder email that the user can edit
        setUserEmail('user@example.com');
      } catch (error) {
        console.error('Could not extract email from token:', error);
      }
    }
  }, [token, verifyMutation]);

  const handleResendEmail = (email: string) => {
    if (email) {
      resendMutation.mutate({ email });
    }
  };

  const handleContinue = () => {
    router.replace('/(member)');
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <YStack
        padding="$4"
        gap="$4"
        width="100%"
        flex={1}
        backgroundColor="$background"
        justifyContent="center"
        alignItems="center"
      >
        <VerificationStatus
          isLoading={verifyMutation.isPending}
          isSuccess={verifyMutation.isSuccess}
          isError={verifyMutation.isError}
          error={verifyMutation.error as Error | null}
          email={userEmail}
          onResendEmail={handleResendEmail}
          isResendingEmail={resendMutation.isPending}
          resendEmailSuccess={resendMutation.isSuccess}
          resendEmailError={resendMutation.error as Error | null}
          onContinue={handleContinue}
        />
      </YStack>
    </SafeAreaView>
  );
}
