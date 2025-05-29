// Export types and utilities
export * from './types';
export * from './useAvatarUpload';
export { AvatarWithUrl } from './AvatarWithUrl';

// Platform-specific exports
// The build system will automatically choose the right implementation
// based on the platform (.web.tsx or .native.tsx)
import { AvatarUploader as AvatarUploaderImpl } from './AvatarUploader.web';
export { AvatarUploaderImpl as AvatarUploader };
