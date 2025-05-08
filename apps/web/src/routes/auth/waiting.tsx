import {
  createFileRoute,
  useNavigate,
  useSearch,
} from '@tanstack/react-router';
import { View } from '@bbook/ui';
import { WaitingForActivation } from '@bbook/app/components/auth/WaitingForActivation';
import { useAuth } from '@bbook/app/provider/auth-provider';
import { useState } from 'react';

export const Route = createFileRoute('/auth/waiting')({
  component: RouteComponent,
});

function RouteComponent() {
  const navigate = useNavigate();
  const search = useSearch({ from: '/auth/waiting' }) as { email?: string };
  const { resendVerification } = useAuth();
  const [isResending, setIsResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  const [resendError, setResendError] = useState<string | null>(null);

  const email = search.email || '';

  const handleResendVerification = async () => {
    if (!email) {
      setResendError('Email is missing. Please go back to signup.');
      return;
    }

    setIsResending(true);
    setResendError(null);
    setResendSuccess(false);

    resendVerification.mutate(
      { email },
      {
        onSuccess: () => {
          setResendSuccess(true);
          setIsResending(false);
        },
        onError: (error: any) => {
          console.error('Error resending verification:', error);
          setResendError(
            'Failed to resend verification email. Please try again.'
          );
          setIsResending(false);
        },
      }
    );
  };

  return (
    <View
      backgroundColor="$background"
      minHeight="100vh"
      flex={1}
      alignItems="center"
    >
      <WaitingForActivation
        email={email}
        onTryAgain={handleResendVerification}
        isResending={isResending}
        resendSuccess={resendSuccess}
        resendError={resendError}
        onBackToSignup={() => navigate({ to: '/auth/signup' })}
      />
    </View>
  );
}
