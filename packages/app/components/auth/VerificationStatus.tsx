import { Text, YStack, Button, Spinner } from '@bbook/ui';
import { useTranslation } from '@bbook/i18n';

type VerificationStatusProps = {
  isLoading: boolean;
  isSuccess: boolean;
  isError: boolean;
  error?: Error | null;
  email?: string;
  onResendEmail?: (email: string) => void;
  isResendingEmail?: boolean;
  resendEmailSuccess?: boolean;
  resendEmailError?: Error | null;
  onContinue?: () => void;
};

export function VerificationStatus({
  isLoading,
  isSuccess,
  isError,
  error,
  email,
  onResendEmail,
  isResendingEmail = false,
  resendEmailSuccess = false,
  resendEmailError = null,
  onContinue,
}: VerificationStatusProps) {
  const { t } = useTranslation();

  return (
    <YStack gap="$4" padding="$4" alignItems="center" width="100%">
      <Text fontSize="$6" fontWeight="bold" textAlign="center">
        {t('auth:verification_title')}
      </Text>

      {isLoading && (
        <YStack gap="$2" alignItems="center">
          <Spinner size="large" color="$blue10" />
          <Text>{t('auth:verification_loading')}</Text>
        </YStack>
      )}

      {isSuccess && (
        <YStack gap="$4" alignItems="center">
          <Text
            fontSize="$5"
            fontWeight="bold"
            color="$green10"
            textAlign="center"
          >
            {t('auth:verification_success_title')}
          </Text>
          <Text textAlign="center">
            {t('auth:verification_success_description')}
          </Text>
          {onContinue && (
            <Button onPress={onContinue} width="100%" maxWidth={400}>
              {t('auth:verification_continue')}
            </Button>
          )}
        </YStack>
      )}

      {isError && (
        <YStack gap="$4" alignItems="center">
          <Text
            fontSize="$5"
            fontWeight="bold"
            color="$red10"
            textAlign="center"
          >
            {t('auth:verification_failed_title')}
          </Text>
          <Text textAlign="center">
            {error?.message || t('auth:verification_failed_description')}
          </Text>

          {/* Resend verification email section */}
          {email && onResendEmail && (
            <YStack gap="$2" alignItems="center" width="100%">
              {resendEmailSuccess ? (
                <Text color="$green10" textAlign="center">
                  {t('auth:verification_resend_success')}
                </Text>
              ) : (
                <Button
                  onPress={() => onResendEmail(email)}
                  width="100%"
                  maxWidth={400}
                  disabled={isResendingEmail}
                >
                  {isResendingEmail ? (
                    <YStack
                      gap="$2"
                      flexDirection="row"
                      alignItems="center"
                      justifyContent="center"
                    >
                      <Spinner size="small" color="$color" />
                      <Text>{t('auth:verification_resend_sending')}</Text>
                    </YStack>
                  ) : (
                    t('auth:verification_resend_button')
                  )}
                </Button>
              )}

              {resendEmailError && (
                <Text color="$red10" textAlign="center" fontSize="$2">
                  {t('auth:verification_resend_error')}
                </Text>
              )}
            </YStack>
          )}
        </YStack>
      )}
    </YStack>
  );
}
