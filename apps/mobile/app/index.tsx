import { Text, View } from 'react-native';
import { useTranslation } from '@bbook/i18n';
import { TestCounter } from '@bbook/app';
export default function Index() {
  const { t } = useTranslation();
  return (
    <View
      style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <Text>{t('common:welcome')}</Text>
      <Text>Hello again</Text>
      <TestCounter />
    </View>
  );
}
