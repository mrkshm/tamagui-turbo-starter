import { createFileRoute } from '@tanstack/react-router';
import { useAuth } from '@bbook/app/provider/auth-provider';
import { ProfileMain } from '@bbook/app/components/profile/ProfileMain';

export const Route = createFileRoute('/member/profile/')({
  component: RouteComponent,
});

function RouteComponent() {
  const { logout, user, isLoading } = useAuth();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <div>User not found</div>;
  }

  // Spread the user props directly to ProfileMain
  return <ProfileMain user={user} />;
}
