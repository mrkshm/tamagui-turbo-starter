import type { ApiEndpoint } from './types'
import { LoginPayloadSchema, AuthResponseSchema } from './schemas'

export const API_ENDPOINTS = {
  auth: {
    login: {
      path: '/auth/login',
      method: 'POST',
      requiresAuth: false,
      schema: {
        request: LoginPayloadSchema,
        response: AuthResponseSchema
      }
    } satisfies ApiEndpoint,
    
    refresh: {
      path: '/auth/refresh',
      method: 'POST',
      requiresAuth: true,
    } satisfies ApiEndpoint
  },
  
  users: {
    profile: {
      path: '/users/profile',
      method: 'GET',
      requiresAuth: true,
    } satisfies ApiEndpoint
  }
} as const

export type ApiEndpoints = typeof API_ENDPOINTS