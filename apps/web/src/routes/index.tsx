import { createFileRoute } from '@tanstack/react-router';
import { Button } from '@bbook/ui';
import { HelloWorld } from '@bbook/app/components/HelloWorld';
import { useTranslation } from '@bbook/i18n';
import { TestCounter } from '@bbook/app/components/TestCounter';
import { YStack } from '@bbook/ui';

export const Route = createFileRoute('/')({
  component: App,
});

function App() {
  const { t } = useTranslation();
  return (
    <YStack backgroundColor="$background" padding="$4">
      <Button
        size="$6"
        theme="green"
        marginBottom="$4"
        onPress={() => alert('Tamagui works!')}
      >
        Tamagui Button from UI Package
      </Button>
      <HelloWorld />
      <p
        style={{
          fontFamily: 'Jura',
          fontSize: 32,
        }}
      >
        {t('common:welcome')}
      </p>
      <TestCounter />
    </YStack>
  );
}
