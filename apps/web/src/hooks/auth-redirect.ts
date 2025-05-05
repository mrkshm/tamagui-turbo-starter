import { useEffect } from 'react';
import { useRouter } from '@tanstack/react-router';
import { useAuth } from '@bbook/app/provider/auth-provider';
import { useQueryClient } from '@tanstack/react-query';

/**
 * Handles auth-based redirects globally. Call inside a layout or root component.
 * Optionally, pass an array of routes to ignore (e.g. ['/member', '/landing'])
 */
export function useAuthRedirect() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const location = router.state.location.pathname;
  const queryClient = useQueryClient();

  useEffect(() => {
    console.log('Auth redirect effect running', { 
      user: user ? 'User exists' : 'No user', 
      isLoading, 
      location 
    });
    
    if (isLoading) return;
    
    if (user && location !== '/member') {
      console.log('Redirecting to /member');
      router.navigate({ to: '/member', replace: true });
    } else if (!user && location !== '/landing') {
      console.log('Redirecting to /landing');
      router.navigate({ to: '/landing', replace: true });
    }
  }, [user, isLoading, router, location]);
  
  // Force a re-check of auth state when this hook is mounted
  useEffect(() => {
    const checkAuth = async () => {
      // Invalidate the current user query to force a refetch
      await queryClient.invalidateQueries({ queryKey: ['currentUser'] });
    };
    
    checkAuth();
  }, [queryClient]);
}
