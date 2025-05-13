import * as v from 'valibot';
import { useForm } from '@tanstack/react-form';
import { useState } from 'react';
import { View, Paragraph, CButton, H1, Text } from '@bbook/ui';
import { CInput, FormCard } from '@bbook/ui';
import { useTranslation, Trans } from '@bbook/i18n';
import { useAuth } from '../../provider/auth-provider';

export interface SignUpScreenProps {
  onSignUpSuccess?: (user: any) => void;
  onNavigateToLogin?: () => void;
  onNavigateToTerms?: () => void;
}

export function SignUpScreen({
  onSignUpSuccess,
  onNavigateToLogin,
  onNavigateToTerms,
}: SignUpScreenProps = {}) {
  const { t } = useTranslation();
  const { signup, isLoading } = useAuth();
  const [emailValid, setEmailValid] = useState(false);
  const [passwordValid, setPasswordValid] = useState(false);
  const [passwordConfirmValid, setPasswordConfirmValid] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const form = useForm({
    defaultValues: {
      email: '',
      password: '',
      passwordConfirm: '',
    },
    onSubmit: async ({ value }) => {
      // Clear any previous API errors when attempting a new signup
      setApiError(null);

      // Use the signup mutation from auth provider
      signup.mutate(
        {
          email: value.email,
          password: value.password,
          password_confirm: value.passwordConfirm,
        },
        {
          onSuccess: (response) => {
            console.log(
              'Signup successful, redirecting to member area',
              response
            );
            // Call the onSignUpSuccess callback if provided
            if (onSignUpSuccess) {
              onSignUpSuccess(response);
            }
          },
          onError: (error: any) => {
            // Handle API errors
            const errorMessage = t('auth:signup_failed');
            setApiError(errorMessage);
            console.error('Signup error:', error);
          },
        }
      );
    },
  });

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
        <H1>{t('auth:signup_title')}</H1>
        <View flexDirection="column" gap="$3" marginTop="$4">
          <View>
            <View flexDirection="column" gap="$5">
              <form.Field
                name="email"
                validators={{
                  onChange: (field) => {
                    const result = v.safeParse(
                      v.pipe(
                        v.string(),
                        v.nonEmpty(t('auth:email_required')),
                        v.email(t('auth:email_invalid'))
                      ),
                      field.value
                    );
                    setEmailValid(result.success);
                    if (result.success) return;
                    return result.issues?.map((issue) => issue.message);
                  },
                }}
              >
                {(field) => (
                  <>
                    <CInput
                      labelText={t('auth:email_label')}
                      size="$3"
                      focusOnMount={true}
                      onChangeText={field.handleChange}
                      keyboardType="email-address"
                      autoComplete="email"
                      placeholder={t('auth:email_placeholder')}
                    />
                    {field.state.meta.errors?.map((error, i) => (
                      <Paragraph color="$error" key={i}>
                        {error}
                      </Paragraph>
                    ))}
                  </>
                )}
              </form.Field>

              <form.Field
                name="password"
                validators={{
                  onChange: (field) => {
                    const result = v.safeParse(
                      v.pipe(
                        v.string(),
                        v.nonEmpty(t('auth:password_required')),
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
                  <>
                    <CInput
                      labelText={t('auth:password_label')}
                      size="$3"
                      onChangeText={field.handleChange}
                      secureTextEntry={true}
                      autoComplete="new-password"
                      placeholder={t('auth:password_placeholder')}
                    />
                    {field.state.meta.errors?.map((error, i) => (
                      <Paragraph color="$error" key={i}>
                        {error}
                      </Paragraph>
                    ))}
                  </>
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
                  <>
                    <CInput
                      labelText={t('auth:password_confirm_label')}
                      size="$3"
                      onChangeText={field.handleChange}
                      secureTextEntry={true}
                      autoComplete="new-password"
                      placeholder={t('auth:password_confirm_placeholder')}
                    />
                    {field.state.meta.errors?.map((error, i) => (
                      <Paragraph color="$error" key={i}>
                        {error}
                      </Paragraph>
                    ))}
                  </>
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
                <View marginBottom="$2" alignItems="center">
                  <Text textAlign="center">
                    <Trans
                      i18nKey="auth:accept_terms"
                      components={[
                        <Text
                          color="$blue10"
                          cursor="pointer"
                          onPress={() => {
                            if (onNavigateToTerms) {
                              onNavigateToTerms();
                            } else {
                              // Fallback if no callback is provided
                              <Text>No link supplied </Text>;
                            }
                          }}
                        />,
                      ]}
                    />
                  </Text>
                </View>
                <CButton
                  disabled={
                    !emailValid ||
                    !passwordValid ||
                    !passwordConfirmValid ||
                    form.state.isSubmitting ||
                    isLoading
                  }
                  loading={isLoading}
                  size="md"
                  variant="primary"
                  onPress={() => form.handleSubmit()}
                  width={200}
                >
                  {t('common:signup')}
                </CButton>
                <Text
                  fontSize={'$3'}
                  color="$textSecondary"
                  marginTop="$3"
                  textAlign="center"
                >
                  {t('auth:have_account_question')}{' '}
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
                    {t('auth:have_account_link')}
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
