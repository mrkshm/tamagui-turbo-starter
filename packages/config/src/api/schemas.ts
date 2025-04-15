import * as v from 'valibot'

export const LoginPayloadSchema = v.object({
  email: v.pipe(v.string(), v.email()),
  password: v.string()
})

export const AuthResponseSchema = v.object({
  token: v.string(),
  refreshToken: v.string(),
  expiresIn: v.number()
})

// Export types generated from schemas
export type LoginPayload = v.InferInput<typeof LoginPayloadSchema>
export type AuthResponse = v.InferInput<typeof AuthResponseSchema>