import { Text, View } from 'react-native';
import { HelloWorld } from '@bbook/app';
import { useTranslation } from '@bbook/i18n';
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
      <Text>{t('welcome')}</Text>
      <HelloWorld />
    </View>
  );
}
