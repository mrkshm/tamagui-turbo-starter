import { Card, H3, Paragraph, XStack, YStack } from '@bbook/ui';
import { AvatarWithUrl } from '../avatar/AvatarWithUrl';

interface ContactCardProps {
  displayName: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  avatarUrl?: string;
  onPress?: () => void;
}

export function ContactCard({
  displayName,
  email,
  firstName,
  lastName,
  avatarUrl,
  onPress,
}: ContactCardProps) {
  return (
    <Card
      elevate
      size="$4"
      bordered
      animation="bouncy"
      pressStyle={{ scale: 0.975 }}
      onPress={onPress}
    >
      <XStack gap="$4" alignItems="center" p="$3">
        <AvatarWithUrl
          entityType="contact"
          size="md"
          imagePath={avatarUrl}
          text={displayName}
          circular
        />
        <YStack flex={1} gap="$1">
          <H3 size="$5" numberOfLines={1}>
            {displayName}
          </H3>
          {(firstName || lastName) && (
            <Paragraph color="$color11">
              {[firstName, lastName].filter(Boolean).join(' ')}
            </Paragraph>
          )}
          {email && <Paragraph color="$color10">{email}</Paragraph>}
        </YStack>
      </XStack>
    </Card>
  );
}
