import { useRouter, createFileRoute } from '@tanstack/react-router';
import { View } from '@bbook/ui';
import { SignUpScreen } from '@bbook/app/components/auth/SignUpScreen';
import { useInteractionState } from '@bbook/utils';
import { TermsDialog } from '../../components/TermsDialog';

export const Route = createFileRoute('/auth/signup')({
  component: RouteComponent,
});

function RouteComponent() {
  const router = useRouter();
  const termsDialog = useInteractionState();

  const handleSignupSuccess = (response: any) => {
    console.log(
      'Signup success in route component, navigating to waiting page',
      response
    );
    // Programmatically navigate to the waiting page with email in query params
    router.navigate({
      to: '/auth/waiting',
      search: { email: response.email || '' },
      replace: true,
    });
  };

  const handleNavigateToLogin = () => {
    console.log('Navigating to login page');
    router.navigate({ to: '/auth/login' });
  };

  const handleNavigateToTerms = () => {
    console.log('Opening terms and conditions dialog');
    termsDialog.onIn();
  };

  return (
    <View
      backgroundColor="$background"
      minHeight="100vh"
      flex={1}
      alignItems="center"
    >
      <SignUpScreen
        onSignUpSuccess={handleSignupSuccess}
        onNavigateToLogin={handleNavigateToLogin}
        onNavigateToTerms={handleNavigateToTerms}
      />

      {/* Terms and Conditions Dialog */}
      <TermsDialog
        open={termsDialog.state}
        onOpenChange={(open) => {
          if (!open) termsDialog.onOut();
        }}
      />
    </View>
  );
}
