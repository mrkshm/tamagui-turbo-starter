import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { View } from '@bbook/ui';
import {
  useVerifyRegistrationMutation,
  useResendVerificationMutation,
} from '@bbook/data';
import { VerificationStatus } from '@bbook/app/components/auth/VerificationStatus';
import { useEffect, useState } from 'react';

// Define the search params type for this route
type VerifySearchParams = {
  token: string;
};

export const Route = createFileRoute('/auth/verify')({
  component: RouteComponent,
  validateSearch: (search): VerifySearchParams => {
    // Validate that token exists and is a string
    const token = search.token;
    if (!token || typeof token !== 'string') {
      throw new Error('Token is required and must be a string');
    }
    return { token };
  },
});

function RouteComponent() {
  const navigate = useNavigate();
  const { token } = Route.useSearch();
  const [userEmail, setUserEmail] = useState<string>('');

  // Verification mutation
  const verifyMutation = useVerifyRegistrationMutation({
    onSuccess: () => {
      // Wait a moment before navigating to give user time to see success message
      setTimeout(() => {
        navigate({ to: '/member', replace: true });
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
    navigate({ to: '/member', replace: true });
  };

  return (
    <View
      backgroundColor="$background"
      minHeight="100vh"
      flex={1}
      alignItems="center"
      justifyContent="center"
    >
      <View width="100%" maxWidth={500} padding="$4">
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
      </View>
    </View>
  );
}
