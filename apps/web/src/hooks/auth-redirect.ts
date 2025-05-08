import { useEffect } from 'react';
import { useRouter } from '@tanstack/react-router';
import { useAuth } from '@bbook/app/provider/auth-provider';

/**
 * Handles auth-based redirects globally. Call inside a layout or root component.
 * Optionally, pass an array of routes to ignore (e.g. ['/member', '/landing'])
 */
export function useAuthRedirect(ignorePaths: string[] = []) {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const location = router.state.location.pathname;

  useEffect(() => {
    console.log('Auth redirect effect running', {
      user: user ? 'User exists' : 'No user',
      isLoading,
      location,
      ignorePaths,
    });

    // Don't redirect if we're loading or if the current path is in the ignore list
    if (isLoading || ignorePaths.some((path) => location.startsWith(path))) {
      return;
    }

    // Allow unauthenticated users to access auth routes
    const isAuthRoute = location.startsWith('/auth/');

    if (user) {
      // Authenticated users should be redirected to member area from auth routes
      if (isAuthRoute || location === '/landing') {
        console.log(
          'Authenticated user accessing auth route, redirecting to /member'
        );
        router.navigate({ to: '/member', replace: true });
      }
    } else {
      // Unauthenticated users should be redirected to landing page, except for auth routes
      if (!isAuthRoute && location !== '/landing') {
        console.log('Unauthenticated user, redirecting to /landing');
        router.navigate({ to: '/landing', replace: true });
      }
    }
  }, [user, isLoading, router, location, ignorePaths]);
}
