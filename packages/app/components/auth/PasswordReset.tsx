import * as v from 'valibot';
import { useForm } from '@tanstack/react-form';
import { useState } from 'react';
import { View, Paragraph, CButton, H1, Text } from '@bbook/ui';
import { CInput, FormCard } from '@bbook/ui';
import { useTranslation } from '@bbook/i18n';
import { usePasswordResetRequestMutation } from '@bbook/data';
import { prepareErrors } from '@bbook/utils';

export interface PasswordResetProps {
  onResetRequestSuccess?: (email: string) => void;
  onNavigateToLogin?: () => void;
}

export function PasswordReset({
  onResetRequestSuccess,
  onNavigateToLogin,
}: PasswordResetProps = {}) {
  const { t } = useTranslation();
  const passwordResetRequest = usePasswordResetRequestMutation();
  const [emailValid, setEmailValid] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm({
    defaultValues: {
      email: '',
    },
    onSubmit: async ({ value }) => {
      // Clear any previous API errors when attempting a password reset
      setApiError(null);
      setIsSubmitting(true);

      // Use the password reset request mutation
      passwordResetRequest.mutate(
        {
          email: value.email,
        },
        {
          onSuccess: () => {
            console.log(
              'Password reset request successful, redirecting to confirmation page'
            );
            setIsSubmitting(false);
            // Call the onResetRequestSuccess callback if provided
            if (onResetRequestSuccess) {
              onResetRequestSuccess(value.email);
            }
          },
          onError: (error: any) => {
            console.error('Password reset request error:', error);
            setIsSubmitting(false);
            // Handle API errors
            const errorMessage = t('auth:password_reset_failed');
            setApiError(errorMessage);
          },
        }
      );
    },
  });

  return (
    <FormCard borderRadius="$0" minHeight="100vh" backgroundColor="$surface">
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
        <H1>{t('auth:password_reset_title')}</H1>
        <Text color="$textSecondary" marginTop="$2">
          {t('auth:password_reset_description')}
        </Text>
        <View flexDirection="column" gap="$3" marginTop="$4">
          <View>
            <View flexDirection="column" gap="$5">
              <form.Field
                name="email"
                validators={{
                  onChange: (field) => {
                    const result = v.safeParse(
                      v.pipe(v.string(), v.email(t('auth:email_invalid'))),
                      field.value
                    );
                    setEmailValid(result.success);
                    if (result.success) return;
                    return result.issues?.map((issue) => issue.message);
                  },
                }}
              >
                {(field) => (
                  <CInput
                    labelText={t('auth:email_label')}
                    size="$3"
                    focusOnMount={true}
                    onChangeText={field.handleChange}
                    keyboardType="email-address"
                    autoComplete="email"
                    placeholder={t('auth:email_placeholder')}
                    errors={prepareErrors(field.state.meta.errors)}
                  />
                )}
              </form.Field>

              {apiError && (
                <View paddingVertical="$2">
                  <Paragraph color="$error" textAlign="center">
                    {apiError}
                  </Paragraph>
                </View>
              )}

              <View marginTop="$2" alignItems="center">
                <CButton
                  disabled={!emailValid || isSubmitting}
                  loading={isSubmitting}
                  size="md"
                  variant="primary"
                  onPress={() => form.handleSubmit()}
                  width={200}
                >
                  {t('auth:reset_password')}
                </CButton>
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
                    onPress={() => {
                      console.log('Navigate to login');
                      if (onNavigateToLogin) {
                        onNavigateToLogin();
                      }
                    }}
                  >
                    {t('auth:back_to_login')}
                  </Text>
                </Text>
              </View>
            </View>
          </View>
        </View>
      </View>
    </FormCard>
  );
}
