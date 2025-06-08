import { YStack, Text } from '@bbook/ui';
import { useTranslation } from '@bbook/i18n';

export function UserNotFound() {
  const { t } = useTranslation();
  return (
    <YStack flex={1} alignItems="center" justifyContent="center">
      <Text>{t('errors:user_not_found')}</Text>
    </YStack>
  );
}
