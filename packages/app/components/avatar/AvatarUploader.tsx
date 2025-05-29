// This file is a platform-agnostic implementation that delegates to the appropriate platform-specific version
// The build system will automatically choose between .native.tsx and .web.tsx based on the platform

// Export the types that are shared between implementations
export * from './types';

// Platform-specific implementations are imported directly where needed
// This avoids the circular dependency
