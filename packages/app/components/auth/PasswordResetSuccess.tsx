import { YStack, H1, Text, CButton, FormCard } from '@bbook/ui';
import { useTranslation } from '@bbook/i18n';

export interface PasswordResetSuccessProps {
  email: string;
  onBackToLogin?: () => void;
}

export function PasswordResetSuccess({
  email,
  onBackToLogin,
}: PasswordResetSuccessProps) {
  const { t } = useTranslation();

  return (
    <FormCard
      borderRadius="$0"
      backgroundColor="$surface"
      padding="$4"
      maxWidth={600}
      marginTop="$8"
    >
      <YStack gap="$4" alignItems="center">
        <H1>{t('auth:password_reset_title')}</H1>
        <Text textAlign="center">{t('auth:password_reset_success')}</Text>
        <Text textAlign="center">
          {t('auth:password_reset_success_description')}
        </Text>
        <Text textAlign="center" fontWeight="bold">
          {email}
        </Text>
        <Text textAlign="center">
          {t('auth:password_reset_description')}
        </Text>
        {onBackToLogin && (
          <YStack marginTop="$4">
            <CButton
              variant="primary"
              onPress={onBackToLogin}
              width={200}
            >
              {t('auth:back_to_login')}
            </CButton>
          </YStack>
        )}
      </YStack>
    </FormCard>
  );
}
