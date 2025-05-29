import { CAvatar } from '@bbook/ui';
import type { AvatarSize } from '@bbook/ui/src/components/CAvatar';
import { useAvatarUrl } from '@bbook/data';
import { useMemo, useState } from 'react';

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
}

/**
 * Avatar component that automatically fetches a pre-signed URL for the avatar image
 */
export function AvatarWithUrl({
  imagePath,
  size = 'md',
  text,
  circular = true,
  showLoading = false,
  ...props
}: AvatarWithUrlProps) {
  // IMPORTANT: Always declare all hooks at the top level, before any conditional logic
  // This ensures hooks are always called in the same order
  
  // Fetch the pre-signed URL for the avatar - use refetchOnMount and refetchOnWindowFocus
  const { data: imageUrl, isLoading, error } = useAvatarUrl(imagePath, {
    // Ensure we refetch when component mounts or window gets focus
    staleTime: 0, // Consider data stale immediately
    gcTime: 1000 * 60 * 60, // Still keep it cached for an hour
  });
  
  // Track if the image fails to load - always declare this hook regardless of conditions
  const [imageLoadFailed, setImageLoadFailed] = useState(false);

  // For debugging
  useMemo(() => {
    console.log('AvatarWithUrl render cycle:', { 
      imagePath, 
      imageUrl, 
      isLoading, 
      error,
      hasText: !!text,
      textValue: text
    });
    
    // Reset image load failed state when image path changes
    if (imageLoadFailed && !imagePath) {
      setImageLoadFailed(false);
    }
  }, [imagePath, imageUrl, isLoading, error, text, imageLoadFailed]);

  // Determine what to render based on state - but AFTER all hooks are called
  const renderContent = () => {
    // More detailed logging to understand the rendering decision
    console.log('AvatarWithUrl rendering decision:', { 
      imagePath, // Log the actual path, not just boolean
      imageUrl,  // Log the actual URL, not just boolean
      isLoading, 
      error: error ? error.message : null, // Log the error message if any
      imageLoadFailed,
      textProvided: !!text,
      textValue: text
    });
    
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
