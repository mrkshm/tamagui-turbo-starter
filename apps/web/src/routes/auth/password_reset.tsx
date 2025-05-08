import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { View } from '@bbook/ui';
import { PasswordReset } from '@bbook/app/components/auth/PasswordReset';
import { PasswordResetSuccess } from '@bbook/app/components/auth/PasswordResetSuccess';
import { useState } from 'react';

export const Route = createFileRoute('/auth/password_reset')({
  component: RouteComponent,
});

function RouteComponent() {
  const navigate = useNavigate();
  const [resetSuccess, setResetSuccess] = useState(false);
  const [resetEmail, setResetEmail] = useState('');

  const handleResetRequestSuccess = (email: string) => {
    console.log('Password reset request successful for email:', email);
    setResetEmail(email);
    setResetSuccess(true);
  };

  const handleNavigateToLogin = () => {
    console.log('Navigating to login page');
    navigate({ to: '/auth/login' });
  };

  return (
    <View
      backgroundColor="$background"
      minHeight="100vh"
      flex={1}
      alignItems="center"
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
    </View>
  );
}
