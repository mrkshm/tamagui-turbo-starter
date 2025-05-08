import { createFileRoute, useRouter } from '@tanstack/react-router';
import { LoginScreen } from '@bbook/app/components/auth/LoginScreen';
import { View } from '@bbook/ui';

export const Route = createFileRoute('/auth/login')({
  component: RouteComponent,
});

function RouteComponent() {
  const router = useRouter();

  const handleLoginSuccess = (user: any) => {
    console.log(
      'Login success in route component, navigating to /member',
      user
    );
    // Programmatically navigate to the member area
    router.navigate({ to: '/member', replace: true });
  };

  const handleNavigateToSignUp = () => {
    console.log('Navigating to signup page');
    router.navigate({ to: '/auth/signup' });
  };

  const handleNavigateToPasswordReset = () => {
    console.log('Navigating to password reset page');
    router.navigate({ to: '/auth/password_reset' });
  };

  const handleNavigateToWaiting = (email: string) => {
    console.log('Email not verified, navigating to waiting page', email);
    router.navigate({ to: '/auth/waiting', search: { email }, replace: true });
  };

  return (
    <View
      backgroundColor="$background"
      minHeight="100vh"
      flex={1}
      alignItems="center"
    >
      <LoginScreen
        onLoginSuccess={handleLoginSuccess}
        onNavigateToSignUp={handleNavigateToSignUp}
        onNavigateToForgotPassword={handleNavigateToPasswordReset}
        onNavigateToWaiting={handleNavigateToWaiting}
      />
    </View>
  );
}
