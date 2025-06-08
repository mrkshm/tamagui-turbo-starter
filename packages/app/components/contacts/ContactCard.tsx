import { Card, H3, Paragraph, XStack, Avatar, YStack } from '@bbook/ui';

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
        <Avatar circular size="$4">
          <Avatar.Image src={avatarUrl} />
          <Avatar.Fallback backgroundColor="$gray5" />
        </Avatar>
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
