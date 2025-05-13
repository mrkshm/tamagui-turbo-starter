import { useState, useEffect } from 'react';
import { SafeAreaView } from 'react-native';
import { YStack, FormCard, H1, Text, View } from '@bbook/ui';
import { useTranslation } from '@bbook/i18n';
import { PasswordResetForm } from '@bbook/app/components/auth/PasswordResetForm';
import { useRouter, useLocalSearchParams } from 'expo-router';

/**
 * This route handles deep links for password reset confirmation.
 * It extracts the token from the URL and processes the password reset.
 */
export default function PasswordResetConfirmScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const [resetSuccess, setResetSuccess] = useState(false);

  const { token } = useLocalSearchParams<{ token: string }>();

  const handleNavigateToLogin = () => {
    console.log('Navigating to login page');
    router.push('/auth/login');
  };

  // If no token is provided, show an error
  if (!token) {
    return (
      <SafeAreaView style={{ flex: 1 }}>
        <YStack
          padding="$4"
          gap="$4"
          width="100%"
          flex={1}
          backgroundColor="$background"
          alignItems="center"
        >
          <FormCard backgroundColor="$surface" padding="$4">
            <YStack gap="$4">
              <H1>{t('auth:password_reset_confirm_title')}</H1>
              <Text color="$error">
                {t('auth:password_reset_confirm_failed')}
              </Text>
              <YStack marginTop="$4" alignItems="center">
                <Text
                  fontSize="$3"
                  color="$textSecondary"
                  marginTop="$3"
                  textAlign="center"
                >
                  {t('auth:remember_password')}{' '}
                  <Text color="$textPrimary" onPress={handleNavigateToLogin}>
                    {t('auth:back_to_login')}
                  </Text>
                </Text>
              </YStack>
            </YStack>
          </FormCard>
        </YStack>
      </SafeAreaView>
    );
  }

  // If password reset was successful, show success message
  if (resetSuccess) {
    return (
      <SafeAreaView style={{ flex: 1 }}>
        <YStack
          padding="$4"
          gap="$4"
          width="100%"
          flex={1}
          backgroundColor="$background"
          alignItems="center"
        >
          <FormCard backgroundColor="$surface" padding="$4">
            <YStack gap="$4">
              <H1>{t('auth:password_reset_confirm_success')}</H1>
              <Text color="$textSecondary">
                {t('auth:password_reset_confirm_success_description')}
              </Text>
              <YStack marginTop="$4" alignItems="center">
                <Text
                  fontSize="$3"
                  color="$textSecondary"
                  marginTop="$3"
                  textAlign="center"
                >
                  <Text color="$textPrimary" onPress={handleNavigateToLogin}>
                    {t('auth:back_to_login')}
                  </Text>
                </Text>
              </YStack>
            </YStack>
          </FormCard>
        </YStack>
      </SafeAreaView>
    );
  }

  // Show the password reset form
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <YStack
        padding="$4"
        gap="$4"
        width="100%"
        flex={1}
        backgroundColor="$background"
      >
        <PasswordResetForm
          token={token}
          onResetSuccess={() => setResetSuccess(true)}
          onNavigateToLogin={handleNavigateToLogin}
        />
      </YStack>
    </SafeAreaView>
  );
}
