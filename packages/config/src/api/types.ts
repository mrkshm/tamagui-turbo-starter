import * as v from 'valibot'

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'

export interface ApiEndpoint {
  path: string
  method: HttpMethod
  requiresAuth: boolean
  schema?: {
    request?: v.ObjectSchema<v.ObjectEntries, string | undefined>
    response?: v.ObjectSchema<v.ObjectEntries, string | undefined>
  }
}

export interface ApiResponse<T> {
  data: T
  status: number
  message?: string
}

// Auth Schemas
export const LoginSchema = v.object({
  email: v.pipe(v.string(), v.email()),
  password: v.string()
})

export const AuthResponseSchema = v.object({
  token: v.string(),
  refreshToken: v.string(),
  expiresIn: v.number()
})

// Generated Types
export type LoginPayload = v.InferInput<typeof LoginSchema>
export type AuthResponse = v.InferInput<typeof AuthResponseSchema>