import { H1, Text, YStack, Button } from '@bbook/ui';
import { useAuth } from '@bbook/app/provider/auth-provider';
import { useTranslation } from '@bbook/i18n';
import { MobileNav } from '@bbook/app';
import { Stack, useRouter } from 'expo-router';

export default function MemberHome() {
  const { user, logout, isLoading } = useAuth();
  const { t } = useTranslation();
  const router = useRouter();

  const handleSettingsPress = () => {
    router.push('/(member)/profile');
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false, title: 'Dashboard' }} />
      <YStack
        padding="$4"
        gap="$4"
        width="100%"
        flex={1}
        backgroundColor="$background"
      >
        <H1>Hello World - Member Area</H1>
        <Text>Debug info:</Text>
        <Text>User: {user ? JSON.stringify(user) : 'null'}</Text>
        {isLoading ? (
          <Text>{t('common:loading')}</Text>
        ) : user ? (
          <Button
            height="$6"
            theme="red"
            onPress={() => {
              // Call logout function
              logout.mutate();
            }}
          >
            Logout
          </Button>
        ) : null}
      </YStack>
      <MobileNav onSettingsPress={handleSettingsPress} />
    </>
  );
}
