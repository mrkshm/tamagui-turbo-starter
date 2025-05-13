import { Avatar as TamaguiAvatar, Text } from 'tamagui';
import { useMemo } from 'react';

type AvatarSize = 'sm' | 'md' | 'lg';

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
  ...props
}: AvatarProps) => {
  // Get the first two characters for the fallback text
  const fallbackText = useMemo(() => {
    return text.substring(0, 2).toUpperCase();
  }, [text]);

  return (
    <TamaguiAvatar size={sizeMap[size]} circular={circular} {...props}>
      {image ? <TamaguiAvatar.Image src={image} /> : null}
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
