# API Setup and Data Fetching in Turbobook Monorepo

## Architecture Overview

The Turbobook monorepo implements a robust and type-safe API layer with the following key features:

1. **Modular Endpoint Structure**: API endpoints are organized by domain (auth, user, etc.)
2. **Type-Safe API Calls**: Using TypeScript and Valibot for runtime validation
3. **React Query Integration**: For data fetching, caching, and state management
4. **Adapter Pattern**: For platform-specific implementations

## Key Components

### 1. Endpoint Definitions

Endpoints are defined in a modular way, organized by domain:

**Location:** `packages/data/src/endpoints/index.ts`

```typescript
import { HTTP_METHODS } from '../constants/constants';

export interface Endpoint<RequestType = any, ResponseType = any> {
  url: string;
  method: HTTP_METHODS;
  requiresAuth: boolean;
  requestType?: RequestType;
  responseType?: ResponseType;
}

// Import and re-export all endpoint modules
export { userEndpoints } from './user';
export { authEndpoints } from './auth';

// Combine all endpoints into a single object for easy access
export const API_ENDPOINTS = {
  USER: userEndpoints,
  AUTH: authEndpoints,
};
```

**Domain-specific endpoints:** `packages/data/src/endpoints/auth.ts`

```typescript
import { HTTP_METHODS } from '../constants/constants';
import { Endpoint } from './index';
import {
  LoginPayload,
  LoginResponse,
  SignupPayload,
  SignupResponse,
} from '../schemas/user';

export const authEndpoints = {
  SIGNUP: {
    url: '/auth/register',
    method: HTTP_METHODS.POST,
    requiresAuth: false,
    requestType: {} as SignupPayload,
    responseType: {} as SignupResponse,
  },
  LOGIN: {
    url: '/token/pair',
    method: HTTP_METHODS.POST,
    requiresAuth: false,
    requestType: {} as LoginPayload,
    responseType: {} as LoginResponse,
  } as Endpoint<LoginPayload, LoginResponse>,
};
```

### 2. Schema Definitions with Valibot

Valibot is used for runtime validation of API requests and responses:

**Location:** `packages/data/src/schemas/user.ts`

```typescript
import * as v from 'valibot';

// Define the user schema with all possible fields from the API
export const userSchema = v.object({
  id: v.union([v.string(), v.number()]),
  email: v.string(),
  first_name: v.optional(v.string()),
  last_name: v.optional(v.string()),
  username: v.optional(v.string()),
  location: v.optional(v.string()),
  about: v.optional(v.string()),
  avatar_path: v.optional(v.nullable(v.string())),
  notification_preferences: v.optional(v.object({})),
  created_at: v.optional(v.string()),
});

// Generate TypeScript type from the schema
export type User = v.InferInput<typeof userSchema>;

// Login payload schema with validation
export const LoginPayloadSchema = v.object({
  email: v.pipe(v.string(), v.email()),
  password: v.string(),
});
export type LoginPayload = v.InferInput<typeof LoginPayloadSchema>;

// Login response schema
export const LoginResponseSchema = v.object({
  email: v.string(),
  access: v.string(),
  refresh: v.string(),
});
export type LoginResponse = v.InferInput<typeof LoginResponseSchema>;
```

### 3. API Client

A centralized API client handles all HTTP requests with built-in validation:

**Location:** `packages/data/src/fetcher.ts`

```typescript
import { safeParse } from 'valibot';
import { BASE_URL } from './constants/config';
import { errorTracker } from './services/error-tracking';

type RequestOptions = {
  headers?: Record<string, string>;
  skipValidation?: boolean;
};

export const apiClient = {
  async get(url: string, schema: any, options?: RequestOptions) {
    return fetchWithValidation('GET', url, schema, undefined, options);
  },
  
  async post(url: string, schema: any, data: any, options?: RequestOptions) {
    return fetchWithValidation('POST', url, schema, data, options);
  },
  
  // Other methods (PUT, DELETE, etc.)
};

async function fetchWithValidation(method: string, url: string, schema: any, data?: any, options?: RequestOptions) {
  try {
    // Make the API request
    const response = await fetch(`${BASE_URL}${url}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      body: data ? JSON.stringify(data) : undefined,
    });
    
    // Handle non-2xx responses
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    // Parse the response
    const responseData = await response.json();
    
    // Skip validation if requested
    if (options?.skipValidation) {
      return { success: true, data: responseData };
    }
    
    // Validate the response against the schema
    const result = safeParse(schema, responseData);
    
    if (!result.success) {
      return {
        success: false,
        error: new Error('Invalid response schema'),
        validationErrors: result.issues,
      };
    }
    
    return { success: true, data: result.output };
  } catch (error) {
    // Track errors
    errorTracker.captureException(
      error instanceof Error ? error : new Error(String(error))
    );
    
    return { success: false, error };
  }
}
```

### 4. React Query Hooks

React Query is used for data fetching, caching, and state management:

**Location:** `packages/data/src/hooks/use-data-query.ts`

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../fetcher';
import { API_ENDPOINTS } from '../endpoints';

// Example of a query hook
export function useUserProfile(userId: string) {
  return useQuery({
    queryKey: ['userProfile', userId],
    queryFn: async () => {
      const result = await apiClient.get(
        `${API_ENDPOINTS.USER.GET_PROFILE.url}/${userId}`,
        userSchema
      );
      
      if (!result.success) {
        throw result.error;
      }
      
      return result.data;
    },
  });
}

// Example of a mutation hook
export function useUpdateProfile() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: UpdateProfilePayload) => {
      const result = await apiClient.patch(
        API_ENDPOINTS.USER.UPDATE_PROFILE.url,
        UpdateProfileResponseSchema,
        data
      );
      
      if (!result.success) {
        throw result.error;
      }
      
      return result.data;
    },
    onSuccess: (data, variables) => {
      // Invalidate and refetch relevant queries
      queryClient.invalidateQueries({ queryKey: ['userProfile', data.id] });
    },
  });
}
```

## Type-Safety with Valibot and TypeScript

The API layer uses a combination of Valibot and TypeScript to ensure type safety at both compile-time and runtime:

### Compile-Time Type Safety

1. **Schema-Derived Types**: TypeScript types are derived from Valibot schemas using `v.InferInput<>`
2. **Endpoint Typing**: Endpoints are typed with request and response types
3. **API Client Typing**: The API client enforces correct types for requests and responses

### Runtime Validation

1. **Request Validation**: Validates outgoing requests against schemas before sending
2. **Response Validation**: Validates incoming responses against schemas
3. **Error Handling**: Provides detailed validation errors for debugging

### Example of the Type Flow

```typescript
// 1. Define the schema with Valibot
const UserSchema = v.object({
  id: v.number(),
  name: v.string(),
});

// 2. Derive TypeScript type
type User = v.InferInput<typeof UserSchema>;

// 3. Type the endpoint
const userEndpoint = {
  GET_USER: {
    url: '/users/:id',
    method: HTTP_METHODS.GET,
    requiresAuth: true,
    responseType: {} as User,
  } as Endpoint<undefined, User>,
};

// 4. Use in a type-safe hook
function useUser(id: number) {
  return useQuery({
    queryKey: ['user', id],
    queryFn: async () => {
      // Type-safe API call
      const result = await apiClient.get(
        `/users/${id}`,
        UserSchema
      );
      
      return result.data; // Typed as User
    },
  });
}
```

## Best Practices

### 1. Endpoint Organization

- Group endpoints by domain (auth, user, posts, etc.)
- Use consistent naming conventions
- Document each endpoint with comments

### 2. Schema Design

- Define schemas in a way that matches the API exactly
- Use optional fields for partial data
- Add validation rules (email, min/max length, etc.) where appropriate

### 3. Error Handling

- Implement consistent error handling across all API calls
- Track errors with the error tracking service
- Provide user-friendly error messages

### 4. Caching Strategy

- Set appropriate cache times for different types of data
- Invalidate related queries when data changes
- Use optimistic updates for better UX

## Customizing for Your Backend

1. **Update Base URL**: Set your API base URL in `packages/data/src/constants/config.ts`

2. **Define Your Endpoints**: Create or modify endpoint files in `packages/data/src/endpoints/`

3. **Create Schemas**: Define schemas that match your API in `packages/data/src/schemas/`

4. **Implement Hooks**: Create custom hooks for your specific data needs