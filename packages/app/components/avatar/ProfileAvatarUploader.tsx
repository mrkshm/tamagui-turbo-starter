import { AvatarUploader, AvatarUploaderProps } from './AvatarUploader';
import { useAuth } from '../../provider/auth-provider';

export interface ProfileAvatarUploaderProps
  extends Omit<AvatarUploaderProps, 'entityType' | 'entityId'> {
  /**
   * Optional avatar URL to override the one coming from the current user.
   */
  image?: string;
}

/**
 * Thin wrapper around the generic `AvatarUploader` configured for the current user profile.
 *
 * It automatically pulls the `user` object from the auth context to
 * provide a stable `entityId` and a default `image` (current avatar).
 */
export const ProfileAvatarUploader: React.FC<ProfileAvatarUploaderProps> = ({
  image,
  ...rest
}) => {
  const { user } = useAuth();

  // Fallback to empty string so required param is always present
  const entityId = (user as any)?.id ?? (user as any)?.email ?? '';

  // Prefer explicit prop, otherwise use avatar from user if available
  const resolvedImage = image ?? (user as any)?.avatar_path ?? undefined;

  return (
    <AvatarUploader
      {...rest}
      image={resolvedImage}
      entityType="user"
      entityId={entityId}
    />
  );
};
