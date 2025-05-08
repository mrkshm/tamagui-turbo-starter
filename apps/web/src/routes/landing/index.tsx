import { createFileRoute } from '@tanstack/react-router';
import { HelloWorld } from '@bbook/app/components/HelloWorld';
import { useTranslation } from '@bbook/i18n';
import { TestCounter } from '@bbook/app/components/TestCounter';
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
        <Link to="/auth/login">Login</Link>
        <Link to="/auth/signup">Sign Up</Link>
      </YStack>
      <HelloWorld />
      <TestCounter />
    </YStack>
  );
}
