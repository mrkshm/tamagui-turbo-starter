// Export types and utilities
export * from './types';
export * from './useAvatarUpload';
export { AvatarWithUrl } from './AvatarWithUrl';

// Platform-specific exports
// We need to use the correct extension-less import pattern
// so the build system can choose the right implementation
export { AvatarUploader } from './AvatarUploader';
