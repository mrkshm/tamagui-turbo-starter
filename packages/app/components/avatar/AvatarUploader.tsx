// This file is a platform-agnostic implementation that delegates to the appropriate platform-specific version
// The build system will automatically choose between .native.tsx and .web.tsx based on the platform
import React from 'react';

// Export the types that are shared between implementations
export * from './types';

// Export the AvatarUploader component
// React Native and web will automatically use the correct implementation
import { AvatarUploaderProps } from './types';

// Define the component here so it can be properly exported
// This component will be implemented differently in .web.tsx and .native.tsx
export const AvatarUploader: React.FC<AvatarUploaderProps> = () => {
  throw new Error('AvatarUploader implementation not found');
};
