import { createFileRoute } from '@tanstack/react-router';
import { Button } from '@bbook/ui';
import { useAuth } from '@bbook/app/provider/auth-provider';

export const Route = createFileRoute('/member/')({ 
  component: RouteComponent,
});

function RouteComponent() {
  const { logout, user, isLoading } = useAuth();
  
  return (
    <div>
      <h1>Welcome to Member Area</h1>
      {user && <p>Logged in as: {user.email}</p>}
      <Button
        size="$6"
        theme="red"
        marginTop="$4"
        onPress={() => logout()}
        disabled={isLoading}
      >
        {isLoading ? 'Logging out...' : 'Logout'}
      </Button>
    </div>
  );
}
