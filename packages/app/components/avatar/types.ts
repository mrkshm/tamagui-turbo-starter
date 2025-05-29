// Define the possible dialog states
export type DialogState = 'initial' | 'preview' | 'uploading';

// Common props for both web and native avatar uploaders
export interface AvatarUploaderProps {
  size?: 'sm' | 'md' | 'lg';
  image?: string;
  text?: string;
  circular?: boolean;
  onUploadComplete?: () => void;
}

// Common props for the content components
export interface AvatarContentProps {
  dialogState: DialogState;
  hasImage: boolean;
  isLoading: boolean;
  error: string | null;
  progress: number;
  onUpload: () => void;
  onCancel: () => void;
  onClosePreview: () => void;
  onTakePhoto?: () => void; // Optional for web
  onChooseFromGallery?: () => void; // Optional for web
  onDeleteAvatar?: () => void;
  previewUrl: string | null;
}

// File info structure for both platforms
export interface FileInfo {
  name: string;
  type: string;
  size: number;
  uri?: string; // For native
}
