import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useAuth } from '@bbook/app/provider/auth-provider';
import { ProfileMain } from '@bbook/app';
import { Stack, Spinner, Text, Button } from 'tamagui';

export const Route = createFileRoute('/member/profile/')({
  component: RouteComponent,
});

function RouteComponent() {
  const navigate = useNavigate();
  const { logout, user, isLoading } = useAuth();

  const handleLogout = async () => {
    try {
      await logout.mutateAsync();
      navigate({ to: '/auth/login' });
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  if (isLoading) {
    return (
      <Stack flex={1} justifyContent="center" alignItems="center">
        <Spinner size="large" />
      </Stack>
    );
  }

  if (!user) {
    return (
      <Stack flex={1} justifyContent="center" alignItems="center" gap="$4">
        <Text>User not found. Please log in again.</Text>
        <Button onPress={() => navigate({ to: '/auth/login' })}>
          Go to Login
        </Button>
      </Stack>
    );
  }

  const handleUpdateSuccess = (updatedUser: typeof user) => {
    // You can add additional logic here if needed when the profile is updated
    console.log('Profile updated:', updatedUser);
  };

  return (
    <Stack flex={1} padding="$4">
      <ProfileMain user={user} onUpdateSuccess={handleUpdateSuccess} />
      <Button onPress={handleLogout} marginTop="$4" theme="red">
        Logout
      </Button>
    </Stack>
  );
}
