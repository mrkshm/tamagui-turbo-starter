# Authentication in Turbobook Monorepo

## Architecture Overview

The authentication system in this monorepo uses a cross-platform approach with the following key components:

1. **React Query for State Management**: built-in caching, loading states, and error handling.
2. **Centralized AuthProvider**: A shared provider that works across web and mobile.
3. **Platform-Specific Adapters**: For storage (JWT tokens) and error tracking.
4. **Modular API Structure**: Separate endpoint definitions for auth, user, etc.

## Key Components

### 1. Auth Provider

**Location:** `packages/app/provider/auth-provider.tsx`

The AuthProvider serves as the central hub for authentication state and functions:

```tsx
export function AuthProvider({ children }: { children: ReactNode }) {
  const { data: user, isLoading } = useCurrentUser();
  const loginMutation = useLoginMutation();
  const signupMutation = useSignupMutation();
  const logoutMutation = useLogoutMutation();

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login: loginMutation.mutate,
    signup: signupMutation.mutate,
    logout: logoutMutation.mutate,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
```

### 2. Authentication Hooks

**Location:** `packages/data/src/hooks/use-auth-query.ts`

React Query hooks for authentication operations:

```tsx
// Login mutation
export const useLoginMutation = (options?: UseLoginMutationOptions) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (credentials: LoginPayload) => {
      // API call and token storage
    },
    onSuccess: (data) => {
      // Update cache and error tracking
      queryClient.invalidateQueries({ queryKey: ['currentUser'] });
      queryClient.setQueryData(['currentUser'], { email: data.email });
    },
  });
};

// Current user query
export const useCurrentUser = () => {
  return useQuery({
    queryKey: ['currentUser'],
    queryFn: async () => {
      // Get token and fetch user profile
      const token = await tokenService.getValidToken('current_user');
      if (!token) return null;

      // Fetch user profile with token
      const result = await apiClient.get(
        API_ENDPOINTS.USER.GET_PROFILE_FOR_USER.url,
        userSchema,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      return result.success ? result.data : null;
    },
  });
};
```

### 3. Token Management

**Location:** `packages/data/src/services/token-service.ts`

Handles JWT token storage, retrieval, and refresh:

```typescript
export const tokenService: TokenService = {
  getValidToken: async (userId: string) => {
    // Check if token exists and is valid
    // Refresh if needed
  },
  storeTokens: async (accessToken, refreshToken, userId) => {
    // Store tokens securely
  },
  removeTokens: async (userId: string) => {
    // Remove tokens on logout
  },
};
```

### 4. Platform Adapters

#### Web Storage Adapter

**Location:** `apps/web/src/lib/storage-adapter.ts`

```typescript
export const webStorageAdapter: StorageAdapter = {
  getItem: async (key) => localStorage.getItem(key),
  setItem: async (key, value) => localStorage.setItem(key, value),
  removeItem: async (key) => localStorage.removeItem(key),
};
```

#### Mobile Storage Adapter (Example)

**Location:** `apps/mobile/src/lib/storage-adapter.ts`

```typescript
export const mobileStorageAdapter: StorageAdapter = {
  getItem: async (key) => SecureStore.getItemAsync(key),
  setItem: async (key, value) => SecureStore.setItemAsync(key, value),
  removeItem: async (key) => SecureStore.deleteItemAsync(key),
};
```

## Authentication Flow

### Web (Tanstack Router)

**Location:** `apps/web/src/hooks/auth-redirect.ts`

```typescript
export function useAuthRedirect() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const location = router.state.location.pathname;

  useEffect(() => {
    if (isLoading) return;
    if (user && location !== '/member') {
      router.navigate({ to: '/member', replace: true });
    } else if (!user && location !== '/landing') {
      router.navigate({ to: '/landing', replace: true });
    }
  }, [user, isLoading, router, location]);
}
```

### Mobile (Expo Router)

**Location:** `apps/mobile/app/_layout.tsx`

```tsx
export default function RootLayout() {
  const { user, isLoading } = useAuth();
  const segments = useSegments();

  // Wait until auth state is loaded
  if (isLoading) return null;

  // Check if user is authenticated
  const isAuthenticated = !!user;

  // Check which segment the user is trying to access
  const isInAuthGroup = segments[0] === '(auth)';
  const isInAppGroup = segments[0] === '(app)';

  if (!isAuthenticated && isInAppGroup) {
    // Redirect unauthenticated users to the auth group
    return <Redirect href="/(auth)/login" />;
  }

  if (isAuthenticated && isInAuthGroup) {
    // Redirect authenticated users to the app group
    return <Redirect href="/(app)/home" />;
  }

  return <Stack />;
}
```

## Customizing for Your Backend

To adapt this authentication system to your backend:

1. **Update Endpoints**: Modify the URLs in `packages/data/src/endpoints/auth.ts` and `packages/data/src/endpoints/user.ts`

2. **Update Schemas**: Adjust the request/response schemas in `packages/data/src/schemas/user.ts` to match your API

3. **Configure Token Handling**: If your backend uses a different token mechanism, update the token service

4. **Set Up Platform Adapters**: Ensure you initialize the appropriate storage adapter in each platform

## Best Practices

1. **Keep Tokens Secure**: Use SecureStore for mobile and HttpOnly cookies where possible for web

2. **Handle Token Refresh**: Implement proper token refresh logic to maintain sessions

3. **Error Handling**: Provide clear error messages for authentication failures

4. **Loading States**: Always handle loading states in your UI to prevent flashing content

5. **Testing**: Write tests for your authentication flows to ensure they work as expected return <Redirect href="/(public)" />;
   }
   if (user && inPublicGroup) {
   return <Redirect href="/(member)" />;
   }

return (
<Stack>
<Stack.Screen name="(member)" options={{ headerShown: false }} />
<Stack.Screen name="(public)" options={{ headerShown: false }} />
<Stack.Screen name="+not-found" />
</Stack>
);
}

```

## Notes

- The `user` value comes from our Zustand store (`@bbook/stores/src/userStore`).
- The `loading` flag ensures we don't redirect until hydration is complete.
- This pattern works for both login and logout flows.
- You **do not** need to use `useEffect` or imperative navigation for redirects.

## Troubleshooting

- If redirects don't work, ensure you are not using multiple Zustand store instances (see our monorepo setup and Metro config docs).
- Always wait for the `loading` flag to be `false` before rendering or redirecting.

## References

- [Expo Router Auth Docs](https://docs.expo.dev/router/advanced/authentication/)
- [Zustand Docs](https://docs.pmnd.rs/zustand/getting-started/introduction)
- [Expo Monorepo Guide](https://docs.expo.dev/guides/monorepos/)
```
