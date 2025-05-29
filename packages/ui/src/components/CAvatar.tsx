import { Avatar as TamaguiAvatar, Text } from 'tamagui';
import { useMemo } from 'react';
import { AVATAR_URL_PATTERN } from '../config/constants';

export type AvatarSize = 'sm' | 'md' | 'lg';

type AvatarProps = {
  /**
   * Size of the avatar
   * @default 'lg'
   */
  size?: AvatarSize;
  /**
   * Image source URL
   */
  image?: string;
  /**
   * Text to display as fallback
   * @default 'UK'
   */
  text?: string;
  /**
   * Whether the avatar should be circular
   * @default true
   */
  circular?: boolean;
  /**
   * Callback when image fails to load
   */
  onImageLoadError?: () => void;
};

// Size mapping to Tamagui size tokens
const sizeMap = {
  sm: '$4',
  md: '$6',
  lg: '$8',
} as const;

// Font size mapping based on avatar size
const fontSizeMap = {
  sm: '$4',
  md: '$5',
  lg: '$6',
} as const;

export const CAvatar = ({
  size = 'md',
  image,
  text = 'UK',
  circular = true,
  onImageLoadError,
  ...props
}: AvatarProps) => {
  // Get the first two characters for the fallback text
  const fallbackText = useMemo(() => {
    return text.substring(0, 2).toUpperCase();
  }, [text]);

  // Comprehensive logging of all props and derived values
  console.log('CAvatar received props:', {
    size,
    image,
    text,
    circular,
    onImageLoadError: !!onImageLoadError,
    allProps: { ...props }
  });
  
  console.log('CAvatar derived values:', {
    fallbackText,
    sizeValue: sizeMap[size],
    fontSizeValue: fontSizeMap[size]
  });

  // Handle different types of image URLs
  let imageUrl = image;

  if (image) {
    // Case 1: It's already a full URL (e.g., pre-signed URL from R2)
    if (image.startsWith('http://') || image.startsWith('https://')) {
      imageUrl = image;
    }
    // Case 2: It's a user ID or path that should use the avatar endpoint
    else if (image.startsWith('/')) {
      // Remove leading slash if present
      const cleanPath = image.startsWith('/') ? image.substring(1) : image;
      imageUrl = `${AVATAR_URL_PATTERN}/${cleanPath}`;
    }
    // Case 3: It's a simple ID or filename
    else {
      imageUrl = `${AVATAR_URL_PATTERN}/${image}`;
    }
  }

  console.log('CAvatar processed image URL:', imageUrl);

  return (
    <TamaguiAvatar size={sizeMap[size]} circular={circular} {...props}>
      {imageUrl ? (
        <TamaguiAvatar.Image
          src={imageUrl}
          alt={fallbackText}
          onError={() => {
            console.log('Image failed to load in CAvatar:', imageUrl);
            onImageLoadError?.();
          }}
        />
      ) : null}
      <TamaguiAvatar.Fallback
        backgroundColor="$secondary"
        flex={1}
        alignItems="center"
        justifyContent="center"
      >
        <Text color="$onSecondary" fontSize={fontSizeMap[size]}>
          {fallbackText}
        </Text>
      </TamaguiAvatar.Fallback>
    </TamaguiAvatar>
  );
};

// Example usage:
// <Avatar size="md" image="https://example.com/avatar.jpg" />
// <Avatar size="lg" text="John Doe" />
// <Avatar size="sm" icon={<User size={16} color="$textSecondary" />} />
