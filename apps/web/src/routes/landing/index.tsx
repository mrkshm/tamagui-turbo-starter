import { createFileRoute } from '@tanstack/react-router';
import { Button } from '@bbook/ui';
import { HelloWorld } from '@bbook/app/components/HelloWorld';
import { useTranslation } from '@bbook/i18n';
import { TestCounter } from '@bbook/app/components/TestCounter';
import { YStack, Text } from '@bbook/ui';
import { useAuth } from '@bbook/app/provider/auth-provider';

export const Route = createFileRoute('/landing/')({
  component: App,
});

function App() {
  const { t } = useTranslation();
  const { login, isLoading } = useAuth();

  const handleLogin = () => {
    login({
      email: 'john@example.com',
      password: 'password',
    });
  };

  return (
    <YStack backgroundColor="$background" padding="$4">
      <Text>{t('common:welcome')}</Text>
      <Button
        size="$6"
        theme="green"
        marginBottom="$4"
        onPress={() => alert('Tamagui works!')}
      >
        Tamagui Button from UI Package
      </Button>
      <Button
        size="$6"
        theme="blue"
        marginBottom="$4"
        onPress={handleLogin}
        disabled={isLoading}
      >
        {isLoading ? 'Logging in...' : 'Login'}
      </Button>
      <HelloWorld />
      <TestCounter />
    </YStack>
  );
}
