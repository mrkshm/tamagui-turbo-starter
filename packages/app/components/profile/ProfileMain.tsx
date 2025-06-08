import { Stack, YStack, Text } from '@bbook/ui';
import { User } from '@bbook/data';
import { ProfileEditor } from './ProfileEditor';
import { useToastController } from '@bbook/ui';
import { useUpdateUser } from '@bbook/data';
import { AvatarUploader } from '../avatar';
import { ThemeSwitcher } from '../ThemeSwitcher';

export interface ProfileMainProps {
  user: User;
  onUpdateSuccess?: (updatedUser: User) => void;
}

export function ProfileMain({ user, onUpdateSuccess }: ProfileMainProps) {
  const toast = useToastController();
  const { mutateAsync: updateUser, isPending } = useUpdateUser({
    userId: user.id.toString(),
  });

  const handleProfileUpdate = async (changes: Partial<User>) => {
    try {
      const result = await updateUser(changes);

      if (result.success && result.data) {
        handleUpdateSuccess(result.data);
      } else {
        throw new Error(result.error || 'Failed to update profile');
      }
    } catch (error) {
      handleError(
        error instanceof Error ? error : new Error('Failed to update profile')
      );
    }
  };

  const handleUpdateSuccess = (updatedUser: User) => {
    toast.show('Profile updated successfully!');
    if (onUpdateSuccess) {
      onUpdateSuccess(updatedUser);
    }
  };

  const handleError = (error: Error) => {
    toast.show(error.message || 'Failed to update profile', {
      type: 'error',
    });
  };

  return (
    <YStack gap="$4" padding="$4" flex={1}>
      <Stack>
        <Text fontSize="$8" fontWeight="bold">
          Profile
        </Text>
        <Text color="$gray10" marginTop="$1">
          Update your profile information
        </Text>
      </Stack>

      <AvatarUploader
        image={user?.avatar_path || undefined}
        text={user.username}
      />

      <ProfileEditor
        user={user}
        onSubmit={handleProfileUpdate}
        isPending={isPending}
        onError={handleError}
      />
      <ThemeSwitcher />
    </YStack>
  );
}
