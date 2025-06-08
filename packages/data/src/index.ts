// Export services
export * from './services/jwt-storage';
export * from './services/token-service';
export * from './services/error-tracking';

// Export schemas
export * from './schemas/user';
export * from './schemas/contacts';

// Export constants
export * from './constants/errors';
export * from './constants/config';

// Export endpoints
export * from './endpoints';

// Export React Query and hooks
export * from './query';
export type { UseMutationResult } from '@tanstack/react-query';

// Auth hooks
export * from './hooks/use-auth-query';
export * from './hooks/use-verify-registration';
export * from './hooks/use-resend-verification';
export * from './hooks/use-password-reset';

// User hooks
export * from './hooks/use-update-user';
export * from './hooks/use-update-avatar';
export * from './hooks/use-avatar-url';
export * from './hooks/use-upload-progress';
export * from './hooks/use-check-username';
export * from './hooks/use-update-username';

// Contact hooks and types
export {
  useContact,
  useUpdateContact,
  useUploadContactAvatar,
  useDeleteContactAvatar,
} from './hooks/useContact';
export type { Contact } from './schemas/contacts';
