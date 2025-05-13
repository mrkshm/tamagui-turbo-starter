import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { PasswordResetForm } from '@bbook/app/components/auth/PasswordResetForm';
import { useState } from 'react';
import { FormCard, H1, Text, View } from '@bbook/ui';
import { useTranslation } from '@bbook/i18n';

export const Route = createFileRoute('/auth/password-reset-confirm')({  
  component: RouteComponent,
});

function RouteComponent() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [resetSuccess, setResetSuccess] = useState(false);
  
  // Get token from URL query parameter
  const token = new URLSearchParams(window.location.search).get('token');

  // If no token is provided, show an error
  if (!token) {
    return (
      <FormCard borderRadius="$0" backgroundColor="$surface">
        <View
          flexDirection="column"
          alignItems="stretch"
          minWidth="100%"
          maxWidth="100%"
          gap="$4"
          $gtSm={{
            paddingVertical: '$4',
            width: 400,
          }}
        >
          <H1>{t('auth:password_reset_confirm_title')}</H1>
          <Text color="$error" marginTop="$2">
            {t('auth:password_reset_confirm_failed')}
          </Text>
          <View marginTop="$4" alignItems="center">
            <Text
              fontSize={'$3'}
              color="$textSecondary"
              marginTop="$3"
              textAlign="center"
            >
              {t('auth:remember_password')}{' '}
              <Text
                cursor="pointer"
                color="$textPrimary"
                onPress={() => navigate({ to: '/auth/login' })}
              >
                {t('auth:back_to_login')}
              </Text>
            </Text>
          </View>
        </View>
      </FormCard>
    );
  }

  // If password reset was successful, show success message
  if (resetSuccess) {
    return (
      <FormCard borderRadius="$0" backgroundColor="$surface">
        <View
          flexDirection="column"
          alignItems="stretch"
          minWidth="100%"
          maxWidth="100%"
          gap="$4"
          $gtSm={{
            paddingVertical: '$4',
            width: 400,
          }}
        >
          <H1>{t('auth:password_reset_confirm_success')}</H1>
          <Text color="$textSecondary" marginTop="$2">
            {t('auth:password_reset_confirm_success_description')}
          </Text>
          <View marginTop="$4" alignItems="center">
            <Text
              fontSize={'$3'}
              color="$textSecondary"
              marginTop="$3"
              textAlign="center"
            >
              <Text
                cursor="pointer"
                color="$textPrimary"
                onPress={() => navigate({ to: '/auth/login' })}
              >
                {t('auth:back_to_login')}
              </Text>
            </Text>
          </View>
        </View>
      </FormCard>
    );
  }

  // Show the password reset form
  return (
    <PasswordResetForm
      token={token}
      onResetSuccess={() => setResetSuccess(true)}
      onNavigateToLogin={() => navigate({ to: '/auth/login' })}
    />
  );
}
