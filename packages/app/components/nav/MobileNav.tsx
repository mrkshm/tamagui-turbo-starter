import { XStack, YStack, H3 } from '@bbook/ui';
import { Settings, Users } from '@tamagui/lucide-icons';
import { useTranslation } from '@bbook/i18n';

export type MobileNavProps = {
  onSettingsPress?: () => void;
  onContactsPress?: () => void;
};

export const MobileNav = ({
  onSettingsPress = () =>
    console.log('Settings pressed but no handler provided'),
  onContactsPress = () =>
    console.log('Contacts pressed but no handler provided'),
}: MobileNavProps) => {
  const { t } = useTranslation();

  return (
    <YStack>
      <XStack
        gap="$3"
        alignItems="center"
        justifyContent="center"
        onPress={onContactsPress}
      >
        <Users />
        <H3>{t('nav:contacts')}</H3>
      </XStack>
      <XStack
        gap="$3"
        alignItems="center"
        justifyContent="center"
        onPress={onSettingsPress}
      >
        <Settings />
        <H3>{t('nav:profile_and_settings')}</H3>
      </XStack>
    </YStack>
  );
};
