import { Outlet, createRootRoute, Link } from '@tanstack/react-router';
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools';
import { useAuthRedirect } from '../hooks/auth-redirect';
import { useAuth } from '@bbook/app/provider/auth-provider';
import { AppFrame } from '@bbook/app/components/AppFrame';

function RootComponent() {
  // Ignore login paths to prevent redirect race conditions
  useAuthRedirect(['/landing/login']);
  const { user } = useAuth();
  return (
    <AppFrame Link={Link} isMember={user ? true : false}>
      <Outlet />
      <TanStackRouterDevtools />
    </AppFrame>
  );
}

export const Route = createRootRoute({
  component: RootComponent,
});
