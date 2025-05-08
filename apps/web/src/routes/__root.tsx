import { Outlet, createRootRoute } from '@tanstack/react-router';
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools';
import { useAuthRedirect } from '../hooks/auth-redirect';

function RootComponent() {
  // Ignore login paths to prevent redirect race conditions
  useAuthRedirect(['/landing/login']);
  return (
    <>
      <Outlet />
      <TanStackRouterDevtools />
    </>
  );
}

export const Route = createRootRoute({
  component: RootComponent,
});
