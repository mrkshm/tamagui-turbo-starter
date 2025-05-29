# Avatar Upload Functionality

## Overview

The avatar upload system provides a complete solution for handling user avatars in the Turbobook application. It includes components for displaying, uploading, and managing avatar images across both web and mobile platforms.

## Component Organization

All avatar-related components are now organized in the `packages/app/components/avatar` directory for better maintainability:

```
avatar/
├── AvatarUploader.tsx          # Platform-agnostic entry point
├── AvatarUploader.native.tsx    # Native-specific implementation
├── AvatarUploader.web.tsx       # Web-specific implementation
├── AvatarWithUrl.tsx            # Avatar display component
├── types.ts                    # Shared type definitions
└── useAvatarUpload.ts          # Shared hook for upload logic
```

## Components

### 1. AvatarUploader

The `AvatarUploader` component is the main entry point for avatar management. It provides a platform-appropriate interface for users to upload, preview, and delete their avatars.

**Location:** `packages/app/components/avatar/AvatarUploader.tsx`

**Features:**
- **Native Platform:**
  - Camera and gallery access for image selection
  - Image preview with edit options
  - Progress indication during upload
  - Error handling with user-friendly messages
  - Avatar deletion

- **Web Platform:**
  - File input for image selection
  - Image preview before upload
  - Drag and drop support (browser-dependent)
  - Progress indication during upload
  - Error handling with user-friendly messages
  - Avatar deletion

**Props:**
```typescript
interface AvatarUploaderProps {
  size?: 'sm' | 'md' | 'lg';  // Size of the avatar (small, medium, large)
  image?: string;             // Current avatar image path
  text?: string;              // Text to display as fallback
  circular?: boolean;         // Whether the avatar should be circular
  onUploadComplete?: () => void; // Callback after successful upload
}
```

**Usage:**
```tsx
import { AvatarUploader } from '../components/avatar';

// In your component:
<AvatarUploader 
  size="md"
  image={user.avatar_path}
  text={getInitials(user.name)}
  circular
  onUploadComplete={refetchUserData}
/>
```

### 2. AvatarWithUrl

A component that handles the display of avatars, including fetching pre-signed URLs for secure avatar access and fallback to text avatars when no image is available.

**Location:** `packages/app/components/avatar/AvatarWithUrl.tsx`

**Features:**
- Automatic fetching of pre-signed URLs for avatar images
- Graceful fallback to text avatars when images are unavailable
- Handling of loading states with skeleton loaders
- Error handling for failed image loads
- Support for different sizes and shapes (circular/square)

**Props:**
```typescript
interface AvatarWithUrlProps {
  imagePath?: string;     // Path to the avatar image
  size?: 'sm' | 'md' | 'lg';  // Size of the avatar
  text?: string;          // Text to display as fallback
  circular?: boolean;     // Whether the avatar should be circular
  showLoading?: boolean;  // Whether to show loading state
}
```

## Hooks

### 1. useAvatarUpload

A shared hook that handles the core avatar upload logic for both web and native platforms.

**Location:** `packages/app/components/avatar/useAvatarUpload.ts`

**Features:**
- Manages dialog state and transitions
- Handles file selection and validation
- Tracks upload progress
- Manages error states
- Provides methods for all avatar operations (upload, delete, cancel)

**Usage:**
```typescript
const {
  dialogState,
  error,
  progress,
  isLoading,
  previewUrl,
  handleCancel,
  handleClosePreview,
  handleDeleteAvatar,
  uploadMutation
} = useAvatarUpload();
```

### 2. useUpdateUserAvatar

A hook for uploading user avatars to the server.

**Location:** `packages/data/src/hooks/use-update-avatar.ts`

**Features:**
- Handles file upload using FormData
- Provides progress tracking during upload
- Invalidates relevant queries after successful upload
- Error handling and reporting

**Usage:**
```typescript
const updateAvatarMutation = useUpdateUserAvatar({
  onSuccess: (data) => {
    // Handle successful upload
  },
  onError: (error) => {
    // Handle upload error
  },
  onProgress: (progress) => {
    // Update progress state
  }
});

// Later in your code
await updateAvatarMutation.mutateAsync(fileObject);
```

### 3. useDeleteUserAvatar

A hook for deleting user avatars from the server.

**Location:** `packages/data/src/hooks/use-update-avatar.ts`

**Features:**
- Handles avatar deletion API calls
- Invalidates relevant queries after successful deletion
- Error handling and reporting

**Usage:**
```typescript
const deleteAvatarMutation = useDeleteUserAvatar({
  onSuccess: () => {
    // Handle successful deletion
  },
  onError: (error) => {
    // Handle deletion error
  }
});

// Later in your code
await deleteAvatarMutation.mutateAsync();
```

### 4. useInteractionState

A utility hook used for managing dialog open/close state.

**Location:** `packages/utils/src/hooks/useInteractionState.ts`

**Features:**
- Provides a consistent pattern for managing interaction states
- Returns memoized handlers for opening and closing dialogs
- Prevents race conditions with state updates

**Usage:**
```typescript
const dialogInteraction = useInteractionState();

// Use the state
const isOpen = dialogInteraction.state;

// Open the dialog
dialogInteraction.onIn();

// Close the dialog
dialogInteraction.onOut();
```

## Platform-Specific Implementations

### Native (iOS/Android)
- Uses Expo's ImagePicker for camera and gallery access
- Handles file system operations with expo-file-system
- Provides native camera and gallery picker interfaces
- Optimized for touch interactions

### Web
- Uses standard HTML file input
- Supports drag-and-drop file uploads
- Provides file validation and preview
- Responsive design for different screen sizes

## Error Handling

The avatar upload system includes comprehensive error handling:

1. **Visual Feedback:** 
   - Error messages are displayed in the appropriate dialog state
   - Icons and colors indicate error states
   - Loading states prevent multiple submissions

2. **Error Types:**
   - File too large (>5MB)
   - Invalid file type
   - Network errors
   - Server-side validation errors
   - Permission issues (camera/gallery access)

3. **Error Recovery:**
   - Errors are cleared when starting a new operation
   - Users can retry failed uploads
   - Fallback UI is provided when operations fail

## Best Practices

1. **Performance:**
   - Images are automatically resized before upload
   - Previews are generated efficiently using blob URLs
   - Components are memoized to prevent unnecessary re-renders

2. **Accessibility:**
   - All interactive elements have proper ARIA labels
   - Color contrast meets WCAG guidelines
   - Keyboard navigation is fully supported
   - Loading states are announced to screen readers

3. **User Experience:**
   - Clear feedback for all actions
   - Progress indicators for uploads
   - Intuitive iconography
   - Consistent styling with the rest of the app

## Implementation Notes

- Uses React Query for data fetching and cache management
- Avatar URLs are pre-signed for security
- Follows the platform conventions for file picking
- Integrates with the app's theming system
- Supports both touch and mouse interactions
- Includes comprehensive TypeScript types for all props and hooks