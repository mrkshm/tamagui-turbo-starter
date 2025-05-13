import { useTranslation } from '@bbook/i18n';
import { TestCounter } from '@bbook/app';
import { Text, YStack } from '@bbook/ui';
import { HelloWorld } from '@bbook/app';
import { SafeAreaView } from 'react-native';
import { useTheme } from '@bbook/ui';
import { Link, Stack } from 'expo-router';

export default function Index() {
  const { t } = useTranslation();
  const theme = useTheme();

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
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
          <TestCounter />
          <HelloWorld />
          <YStack gap="$2" backgroundColor="$background">
            <Link href="/auth/login">
              <Text>Login</Text>
            </Link>
            <Link href="/auth/signup">
              <Text>Sign Up</Text>
            </Link>
          </YStack>
        </YStack>
      </SafeAreaView>
    </>
  );
}
