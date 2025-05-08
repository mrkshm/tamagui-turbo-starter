import * as v from 'valibot';
import { useForm } from '@tanstack/react-form';
import { useState } from 'react';
import { View, Paragraph, CButton, H1, Text } from '@bbook/ui';
import { CInput, FormCard } from '@bbook/ui';
import { useTranslation } from '@bbook/i18n';
import { usePasswordResetConfirmMutation } from '@bbook/data';
import { prepareErrors } from '@bbook/utils';

export interface PasswordResetFormProps {
  token: string;
  onResetSuccess?: () => void;
  onNavigateToLogin?: () => void;
}

export function PasswordResetForm({
  token,
  onResetSuccess,
  onNavigateToLogin,
}: PasswordResetFormProps) {
  const { t } = useTranslation();
  const passwordResetConfirm = usePasswordResetConfirmMutation();
  const [passwordValid, setPasswordValid] = useState(false);
  const [passwordConfirmValid, setPasswordConfirmValid] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm({
    defaultValues: {
      password: '',
      passwordConfirm: '',
    },
    onSubmit: async ({ value }) => {
      // Clear any previous API errors when attempting a password reset
      setApiError(null);
      setIsSubmitting(true);

      // Use the password reset confirm mutation
      passwordResetConfirm.mutate(
        {
          token,
          password: value.password,
          password_confirm: value.passwordConfirm,
        },
        {
          onSuccess: () => {
            console.log('Password reset successful');
            setIsSubmitting(false);
            // Call the onResetSuccess callback if provided
            if (onResetSuccess) {
              onResetSuccess();
            }
          },
          onError: (error: any) => {
            console.error('Password reset error:', error);
            setIsSubmitting(false);
            // Handle API errors
            const errorMessage = t('auth:password_reset_confirm_failed');
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
        <H1>{t('auth:password_reset_confirm_title')}</H1>
        <Text color="$textSecondary" marginTop="$2">
          {t('auth:password_reset_confirm_description')}
        </Text>
        <View flexDirection="column" gap="$3" marginTop="$4">
          <View>
            <View flexDirection="column" gap="$5">
              <form.Field
                name="password"
                validators={{
                  onChange: (field) => {
                    const result = v.safeParse(
                      v.pipe(
                        v.string(),
                        v.minLength(6, t('auth:password_invalid'))
                      ),
                      field.value
                    );
                    setPasswordValid(result.success);
                    if (result.success) return;
                    return result.issues?.map((issue) => issue.message);
                  },
                }}
              >
                {(field) => (
                  <CInput
                    labelText={t('auth:password_label')}
                    size="$3"
                    onChangeText={field.handleChange}
                    secureTextEntry={true}
                    autoComplete="new-password"
                    placeholder={t('auth:password_placeholder')}
                    errors={prepareErrors(field.state.meta.errors)}
                  />
                )}
              </form.Field>

              <form.Field
                name="passwordConfirm"
                validators={{
                  onChange: (field) => {
                    // First check if the password confirmation is not empty
                    if (!field.value) {
                      setPasswordConfirmValid(false);
                      return [t('auth:password_confirm_required')];
                    }

                    // Then check if passwords match
                    const password = form.getFieldValue('password');
                    if (field.value !== password) {
                      setPasswordConfirmValid(false);
                      return [t('auth:passwords_do_not_match')];
                    }

                    setPasswordConfirmValid(true);
                    return;
                  },
                }}
              >
                {(field) => (
                  <CInput
                    labelText={t('auth:password_confirm_label')}
                    size="$3"
                    onChangeText={field.handleChange}
                    secureTextEntry={true}
                    autoComplete="new-password"
                    placeholder={t('auth:password_confirm_placeholder')}
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
                  disabled={
                    !passwordValid || !passwordConfirmValid || isSubmitting
                  }
                  loading={isSubmitting}
                  size="md"
                  variant="primary"
                  onPress={() => form.handleSubmit()}
                  width={200}
                >
                  {t('auth:set_new_password')}
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
