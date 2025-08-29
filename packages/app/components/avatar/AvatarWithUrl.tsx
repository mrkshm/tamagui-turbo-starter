import { CAvatar } from '@bbook/ui';
import type { AvatarSize } from '@bbook/ui/src/components/CAvatar';
import { useAvatarUrl } from '@bbook/data';
import { useEffect, useMemo, useState } from 'react';

export type AvatarEntityType = 'user' | 'contact';

interface AvatarWithUrlProps {
  /**
   * The path or ID of the avatar
   */
  imagePath?: string;

  /**
   * Size of the avatar
   * @default 'md'
   */
  size?: AvatarSize;

  /**
   * Text to display as fallback
   */
  text?: string;

  /**
   * Whether the avatar should be circular
   * @default true
   */
  circular?: boolean;

  /**
   * Whether to show a loading spinner while fetching the URL
   * @default false
   */
  showLoading?: boolean;
  /**
   * Entity that owns the avatar – affects which backend route is called.
   * @default 'user'
   */
  entityType?: AvatarEntityType;
}

/**
 * Avatar component that automatically fetches a pre-signed URL for the avatar image
 */
export function AvatarWithUrl({
  entityType = 'user',
  imagePath,
  size = 'md',
  text,
  circular = true,
  showLoading = false,
  ...props
}: AvatarWithUrlProps) {
  // IMPORTANT: Always declare all hooks at the top level, before any conditional logic
  // This ensures hooks are always called in the same order

  // Determine if the provided imagePath is already a complete URL (e.g. blob:, data:, file:, http(s):)
  const isDirectUrl = useMemo(() => {
    if (typeof imagePath !== 'string') return false;

    // Check for blob URLs
    if (imagePath.startsWith('blob:')) return true;

    // Check for data URLs
    if (imagePath.startsWith('data:')) return true;

    // Check for local file URLs (React Native ImagePicker / Camera)
    if (imagePath.startsWith('file:')) return true;

    // Check for http/https URLs
    try {
      const url = new URL(imagePath);
      return url.protocol === 'http:' || url.protocol === 'https:';
    } catch {
      return false;
    }
  }, [imagePath]);

  // Always call the hook to keep hook order stable; control execution with `enabled`
  const {
    data: fetchedUrl,
    isLoading,
    error,
  } = useAvatarUrl({
    entityType,
    avatarPath: imagePath ?? '',
    staleTime: 0,
    gcTime: 1000 * 60 * 60,
    // Skip the query entirely when we already have a direct URL or no path
    enabled: !isDirectUrl && !!imagePath,
  });

  // For direct URLs (blob:, data:, http://, https://), use them directly
  // For other cases, use the fetched URL
  const finalUrl = isDirectUrl ? imagePath : fetchedUrl;

  // Track if the image fails to load
  const [imageLoadFailed, setImageLoadFailed] = useState(false);

  // Log URL handling for debugging
  useEffect(() => {
    console.log('Avatar URL handling:', {
      imagePath,
      isDirectUrl,
      finalUrl,
      fetchedUrl,
      type: isDirectUrl ? 'direct' : 'fetched',
      timestamp: new Date().toISOString(),
    });
  }, [imagePath, isDirectUrl, finalUrl, fetchedUrl]);

  // Use the final URL (either direct or fetched)
  const imageUrl = finalUrl;

  // For debugging
  useMemo(() => {
    console.log('AvatarWithUrl render cycle:', {
      imagePath,
      isDirectUrl,
      finalUrl,
      isLoading,
      error: error ? error.message : null,
      imageLoadFailed,
      hasText: !!text,
      timestamp: new Date().toISOString(),
    });

    if (finalUrl) {
      console.log('Final URL type:', typeof finalUrl);
      console.log('Final URL starts with:', finalUrl.substring(0, 50));
    }

    // Reset image load failed state when image path changes
    if (imageLoadFailed && !imagePath) {
      setImageLoadFailed(false);
    }
  }, [
    imagePath,
    finalUrl,
    isLoading,
    error,
    text,
    imageLoadFailed,
    isDirectUrl,
  ]);

  // Determine what to render based on state - but AFTER all hooks are called
  const renderContent = () => {
    // More detailed logging to understand the rendering decision
    console.log('AvatarWithUrl rendering decision:', {
      imagePath, // Debug logging
      imageUrl, // Log the actual URL, not just boolean
      isDirectUrl, // Log if we're using a direct URL
      isLoading,
      error: error ? error.message : null, // Log the error message if any
      imageLoadFailed,
      textProvided: !!text,
      textValue: text,
      timestamp: new Date().toISOString(),
    });

    // Log the first 100 chars of the URL for debugging
    if (imageUrl && typeof imageUrl === 'string') {
      console.log('Image URL type:', typeof imageUrl);
      console.log('Image URL starts with:', imageUrl.substring(0, 100));
    }

    // If no image path or there's an error, show fallback
    if (!imagePath || error || (!isLoading && !imageUrl)) {
      console.log('Rendering fallback avatar');
      return <CAvatar size={size} text={text} circular={circular} {...props} />;
    }

    // If still loading, show fallback
    if (isLoading) {
      console.log('Rendering fallback avatar (loading)');
      return <CAvatar size={size} text={text} circular={circular} {...props} />;
    }

    // Otherwise, render the CAvatar with the pre-signed URL
    console.log('Rendering avatar with image URL:', imageUrl);
    return (
      <CAvatar
        size={size}
        image={imageUrl}
        text={text}
        circular={circular}
        onImageLoadError={() => {
          console.log('Image failed to load:', imageUrl);
          setImageLoadFailed(true);
        }}
        {...props}
      />
    );
  };

  // Return the determined content
  return renderContent();
}
