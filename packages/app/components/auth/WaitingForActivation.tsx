import {
  View,
  YStack,
  H1,
  Text,
  CButton,
  Spinner,
  Paragraph,
  FormCard,
} from '@bbook/ui';
import { useTranslation } from '@bbook/i18n';

export interface WaitingForActivationProps {
  email?: string;
  onTryAgain?: () => void;
  isResending?: boolean;
  resendSuccess?: boolean;
  resendError?: string | null;
  onBackToSignup?: () => void;
}

export function WaitingForActivation({
  email,
  onTryAgain,
  isResending = false,
  resendSuccess = false,
  resendError = null,
  onBackToSignup,
}: WaitingForActivationProps) {
  const { t } = useTranslation();
  email = email || 'No email';
  return (
    <FormCard
      borderRadius="$0"
      backgroundColor="$surface"
      minHeight="100vh"
      maxWidth={800}
    >
      <YStack
        gap="$4"
        padding="$4"
        alignItems="center"
        maxWidth={800}
        marginHorizontal="auto"
      >
        <H1>{t('auth:waiting_for_activation_title')}</H1>
        <Text textAlign="center">
          {t('auth:waiting_for_activation_description')}
        </Text>

        {email && (
          <View>
            <Text textAlign="center" fontWeight="bold">
              {email}
            </Text>
          </View>
        )}

        <Text textAlign="center">
          {t('auth:waiting_for_activation_try_again')}
        </Text>

        {resendSuccess && (
          <Paragraph color="$success" textAlign="center">
            {t('auth:verification_email_resent')}
          </Paragraph>
        )}

        {resendError && (
          <Paragraph color="$error" textAlign="center">
            {resendError}
          </Paragraph>
        )}

        <YStack gap="$2" alignItems="center" marginTop="$2">
          <CButton
            variant="primary"
            onPress={onTryAgain}
            disabled={isResending}
            width={200}
          >
            {isResending ? (
              <Spinner color="$white" size="small" />
            ) : (
              t('auth:resend_verification_email')
            )}
          </CButton>

          <CButton variant="outline" onPress={onBackToSignup} width={200}>
            {t('auth:back_to_signup')}
          </CButton>
        </YStack>
      </YStack>
    </FormCard>
  );
}
