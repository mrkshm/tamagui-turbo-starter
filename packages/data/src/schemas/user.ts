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
  preferred_language: v.string(),
  preferred_theme: v.string(),
  finished_onboarding: v.boolean(),
  email_verified: v.boolean(),
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
  detail: v.string(),
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

export const VerifyRegistrationResponseSchema = v.object({
  detail: v.string(),
  access: v.string(),
  refresh: v.string(),
});
export type VerifyRegistrationResponse = v.InferInput<
  typeof VerifyRegistrationResponseSchema
>;

// Schema for login error responses when email is not verified
export const LoginErrorResponseSchema = v.object({
  detail: v.string(),
  email_verified: v.boolean(),
});
export type LoginErrorResponse = v.InferInput<typeof LoginErrorResponseSchema>;

// Schema for resend verification email request
export const ResendVerificationPayloadSchema = v.object({
  email: v.pipe(v.string(), v.email()),
});
export type ResendVerificationPayload = v.InferInput<
  typeof ResendVerificationPayloadSchema
>;

// Schema for resend verification email response
export const ResendVerificationResponseSchema = v.object({
  detail: v.string(),
});
export type ResendVerificationResponse = v.InferInput<
  typeof ResendVerificationResponseSchema
>;

export const EmptyResponseSchema = v.object({});
export type EmptyResponse = v.InferInput<typeof EmptyResponseSchema>;

// Schema for password reset request
export const PasswordResetRequestPayloadSchema = v.object({
  email: v.pipe(v.string(), v.email()),
});
export type PasswordResetRequestPayload = v.InferInput<
  typeof PasswordResetRequestPayloadSchema
>;

// Schema for password reset request response
export const PasswordResetRequestResponseSchema = v.object({
  detail: v.string(),
});
export type PasswordResetRequestResponse = v.InferInput<
  typeof PasswordResetRequestResponseSchema
>;

// Schema for password reset confirmation
export const PasswordResetConfirmPayloadSchema = v.pipe(
  v.object({
    token: v.string(),
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
export type PasswordResetConfirmPayload = v.InferInput<
  typeof PasswordResetConfirmPayloadSchema
>;

// Schema for password reset confirmation response
export const PasswordResetConfirmResponseSchema = v.object({
  detail: v.string(),
});
export type PasswordResetConfirmResponse = v.InferInput<
  typeof PasswordResetConfirmResponseSchema
>;

export const ProfilePayloadSchema = v.object({
  first_name: v.optional(v.pipe(v.string(), v.maxLength(50), v.trim())),
  last_name: v.optional(v.pipe(v.string(), v.maxLength(50), v.trim())),
  location: v.optional(v.pipe(v.string(), v.maxLength(100), v.trim())),
  about: v.optional(v.pipe(v.string(), v.maxLength(5000), v.trim())),
  preferred_language: v.optional(v.pipe(v.string(), v.maxLength(20), v.trim())),
  preferred_theme: v.optional(v.pipe(v.string(), v.maxLength(20), v.trim())),
});
export type ProfilePayload = v.InferInput<typeof ProfilePayloadSchema>;
