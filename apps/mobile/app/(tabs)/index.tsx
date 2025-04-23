import { useTranslation } from '@bbook/i18n';
import { TestCounter } from '@bbook/app';
import { Text, YStack } from '@bbook/ui';
import { HelloWorld } from '@bbook/app';
import { SafeAreaView } from 'react-native';

export default function Index() {
  const { t } = useTranslation();

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <YStack
        padding="$4"
        gap="$4"
        width="100%"
        flex={1}
        backgroundColor="$background"
      >
        <Text>{t('common:welcome')}</Text>
        <Text
          fontFamily="$heading"
          fontSize="$6"
          fontWeight="$5"
          color="$success"
          paddingTop="$6"
        >
          This text should have style...
        </Text>
        <TestCounter />
        <HelloWorld />
      </YStack>
    </SafeAreaView>
  );
}
