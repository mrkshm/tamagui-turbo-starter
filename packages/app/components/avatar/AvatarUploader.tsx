// This file is a platform-agnostic implementation that delegates to the appropriate platform-specific version
// The build system will automatically choose between .native.tsx and .web.tsx based on the platform

// Export the types that are shared between implementations
export * from './types';

// Export the AvatarUploader component for web by default.
// Native implementation will be resolved by aliasing or specific platform build config.

// Define the component here so it can be properly exported
// This component will be implemented differently in .web.tsx and .native.tsx
// Fallback that will never run if platform files exist
export const AvatarUploader: React.FC<any> = () => {
  throw new Error('AvatarUploader implementation not found for this platform');
};
