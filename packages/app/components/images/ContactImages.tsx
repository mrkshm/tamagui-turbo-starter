// Platform-agnostic shim that delegates to platform-specific implementations.
// See ContactImages.web.tsx and ContactImages.native.tsx

export * from './types';

export const ContactImages: React.FC<any> = () => {
  throw new Error('ContactImages implementation not found for this platform');
};
