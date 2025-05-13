import { H1, Text, YStack } from '@bbook/ui';
import { ScrollView } from 'react-native';
import { useTranslation } from '@bbook/i18n';

export function TermsAndConditions() {
  const { t } = useTranslation();

  const rawContent = t('terms:content', { returnObjects: true });
  const content = Array.isArray(rawContent) ? rawContent : [];

  return (
    <ScrollView style={{ flex: 1, width: '100%' }}>
      <YStack backgroundColor="$background" width="100%" gap="$4">
        <H1>{t('terms:title')}</H1>
        {content.map((item, index) => (
          <Text key={index}>{item}</Text>
        ))}
      </YStack>
    </ScrollView>
  );
}

export default TermsAndConditions;
