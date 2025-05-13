import { createFileRoute, Link } from '@tanstack/react-router';
import { Button, YStack } from '@bbook/ui';
import { useAuth } from '@bbook/app/provider/auth-provider';

export const Route = createFileRoute('/member/')({
  component: RouteComponent,
});

function RouteComponent() {
  const { logout, user, isLoading } = useAuth();

  return (
    <YStack minHeight="100vh" backgroundColor="$background">
      <h1>Welcome to Member Area</h1>
      {user && <p>Logged in as: {user.email}</p>}
      <Link to="/member/profile">Profile</Link>
      <Button
        size="$6"
        theme="red"
        marginTop="$4"
        onPress={() => logout.mutate()}
        disabled={isLoading}
      >
        {isLoading ? 'Logging out...' : 'Logout'}
      </Button>
    </YStack>
  );
}
