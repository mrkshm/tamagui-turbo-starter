import { XStack, H3 } from '@bbook/ui';
import { Settings } from '@tamagui/lucide-icons';
import { useTranslation } from '@bbook/i18n';

export type MobileNavProps = {
  onSettingsPress?: () => void;
};

export const MobileNav = ({
  onSettingsPress = () =>
    console.log('Settings pressed but no handler provided'),
}: MobileNavProps) => {
  const { t } = useTranslation();

  return (
    <XStack
      gap="$3"
      alignItems="center"
      justifyContent="center"
      onPress={onSettingsPress}
    >
      <Settings />
      <H3>{t('nav:profile_and_settings')}</H3>
    </XStack>
  );
};
