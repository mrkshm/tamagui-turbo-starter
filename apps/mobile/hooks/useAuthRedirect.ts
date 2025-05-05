import { useEffect } from 'react';
import { useRouter, useSegments } from 'expo-router';
import { useAuth } from '@bbook/app/provider/auth-provider';

type AuthRedirectProps = {
  requireAuth: boolean;
};

export function useAuthRedirect({ requireAuth }: AuthRedirectProps) {
  const { user, isLoading } = useAuth();
  const isAuthenticated = !!user;
  const router = useRouter();
  const segments = useSegments();

  // Add debug logs to track state changes
  useEffect(() => {
    console.log(
      `[Auth Debug] isLoading=${isLoading}, isAuthenticated=${isAuthenticated}, requireAuth=${requireAuth}, segments=${segments.join('/')}`
    );

    if (isLoading) return;

    if (requireAuth && !isAuthenticated) {
      console.log(
        '[Auth Redirect] Unauthenticated user in protected route, redirecting to public'
      );
      // Force a hard navigation instead of a replace
      router.push('/(public)');
    }

    if (!requireAuth && isAuthenticated) {
      console.log(
        '[Auth Redirect] Authenticated user in public route, redirecting to member'
      );
      // Force a hard navigation instead of a replace
      router.push('/(member)');
    }
  }, [isAuthenticated, isLoading, requireAuth, router, segments]);
}
