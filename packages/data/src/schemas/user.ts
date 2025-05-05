import * as v from 'valibot';

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
export type User = v.InferInput<typeof userSchema>;

export const SignupPayloadSchema = v.pipe(
  v.object({
    email: v.pipe(v.string(), v.email()),
    password: v.string(),
    password_confirm: v.string(),
  }),
  v.forward(
    v.partialCheck(
      [['password'], ['password_confirm']],
      (input) => input.password === input.password_confirm,
      'The two passwords do not match.'
    ),
    ['password_confirm']
  )
);
export type SignupPayload = v.InferInput<typeof SignupPayloadSchema>;

export const SignupResponseSchema = v.object({
  access: v.string(),
  refresh: v.string(),
});
export type SignupResponse = v.InferInput<typeof SignupResponseSchema>;

export const LoginPayloadSchema = v.object({
  email: v.pipe(v.string(), v.email()),
  password: v.string(),
});
export type LoginPayload = v.InferInput<typeof LoginPayloadSchema>;

export const LoginResponseSchema = v.object({
  email: v.string(),
  access: v.string(),
  refresh: v.string(),
});
export type LoginResponse = v.InferInput<typeof LoginResponseSchema>;

export const TokenRefreshResponseSchema = v.object({
  access: v.string(),
  refresh: v.string(),
});
export type TokenRefreshResponse = v.InferInput<
  typeof TokenRefreshResponseSchema
>;

export const EmptyResponseSchema = v.object({});
export type EmptyResponse = v.InferInput<typeof EmptyResponseSchema>;
