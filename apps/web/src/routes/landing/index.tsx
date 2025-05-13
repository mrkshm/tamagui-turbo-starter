import { createFileRoute } from '@tanstack/react-router';
import { HelloWorld } from '@bbook/app';
import { useTranslation } from '@bbook/i18n';
import { TestCounter } from '@bbook/app';
import { YStack, Text } from '@bbook/ui';
import { Link } from '@tanstack/react-router';

export const Route = createFileRoute('/landing/')({
  component: App,
});

function App() {
  const { t } = useTranslation();

  return (
    <YStack backgroundColor="$background" padding="$4" minHeight="100vh">
      <Text>{t('common:welcome')}</Text>
      <YStack gap="$2" padding="$2" marginVertical="$4">
        <Link to="/auth/login">{t('common:login')}</Link>
        <Link to="/auth/signup">{t('common:signup')}</Link>
      </YStack>
      <HelloWorld />
      <TestCounter />
    </YStack>
  );
}
