import { useTranslation } from '@bbook/i18n';
import { TestCounter } from '@bbook/app';
import { Text, YStack, Button } from '@bbook/ui';
import { HelloWorld } from '@bbook/app';
import { SafeAreaView } from 'react-native';
import { useAuth } from '@bbook/app/provider/auth-provider';
import { useTheme } from '@bbook/ui';

export default function Index() {
  const { t } = useTranslation();
  const theme = useTheme();
  const { login, isLoading } = useAuth();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.background?.val }}>
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
        <Button
          size="$6"
          theme="blue"
          onPress={() => login({
            email: 'john@example.com',
            password: 'password',
          })}
          disabled={isLoading}
        >
          {isLoading ? 'Logging in...' : 'Login'}
        </Button>
        <TestCounter />
        <HelloWorld />
      </YStack>
    </SafeAreaView>
  );
}
