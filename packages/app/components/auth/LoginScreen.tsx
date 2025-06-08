import * as v from 'valibot';
import { useForm } from '@tanstack/react-form';
import { useState } from 'react';
import { View, Paragraph, CButton, H1, Text } from '@bbook/ui';
import { CInput, FormCard } from '@bbook/ui';
import { useTranslation } from '@bbook/i18n';
import { useAuth } from '../../provider/auth-provider';
import { prepareErrors } from '@bbook/utils';

export interface LoginScreenProps {
  onLoginSuccess?: (user: any) => void;
  onNavigateToForgotPassword?: () => void;
  onNavigateToSignUp?: () => void;
  onNavigateToWaiting?: (email: string) => void;
}

export function LoginScreen({
  onLoginSuccess,
  onNavigateToForgotPassword,
  onNavigateToSignUp,
  onNavigateToWaiting,
}: LoginScreenProps = {}) {
  const { t } = useTranslation();
  const { login, isLoading } = useAuth();
  const [emailValid, setEmailValid] = useState(false);
  const [passwordValid, setPasswordValid] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  // No complex event handlers or refs needed

  const form = useForm({
    defaultValues: {
      email: '',
      password: '',
    },
    onSubmit: async ({ value }) => {
      // Clear any previous API errors when attempting a new login
      setApiError(null);

      // Use the login mutation from auth provider
      login.mutate(
        {
          email: value.email,
          password: value.password,
        },
        {
          onSuccess: (response) => {
            console.log(
              'Login successful, redirecting to member area',
              response
            );
            // Call the onLoginSuccess callback if provided
            if (onLoginSuccess) {
              onLoginSuccess(response);
            }
          },
          onError: (error: any) => {
            console.error('Login error:', error);

            // Check if this is an email verification error
            if (error?.isEmailVerificationError) {
              console.log(
                'Email verification required, redirecting to waiting page'
              );
              // Navigate to the waiting page if the callback is provided
              if (onNavigateToWaiting) {
                onNavigateToWaiting(error.email || value.email);
                return;
              }
            }

            // Handle other API errors
            const errorMessage = t('auth:login_failed');
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
        paddingVertical="$4"
        paddingHorizontal="$2"
        alignItems="stretch"
        minWidth="100%"
        maxWidth="100%"
        gap="$4"
        $gtSm={{
          paddingVertical: '$4',
          width: 400,
        }}
      >
        <H1>{t('auth:login_title')}</H1>
        <View flexDirection="column" gap="$3" marginTop="$4">
          <View>
            <View flexDirection="column" gap="$5">
              <form.Field
                name="email"
                validators={{
                  onChange: (field) => {
                    // First check if the field is empty
                    if (!field.value) {
                      setEmailValid(false);
                      return [t('auth:email_required')];
                    }
                    
                    // Then check if it's a valid email
                    const result = v.safeParse(
                      v.pipe(v.string(), v.email(t('auth:email_invalid'))),
                      field.value
                    );
                    setEmailValid(result.success);
                    if (result.success) return;
                    return [result.issues?.[0].message]; // Only return the first error
                  },
                }}
              >
                {(field) => (
                  <CInput
                    id="login-email"
                    labelText={t('auth:email_label')}
                    size="$3"
                    focusOnMount={true}
                    value={field.state.value}
                    onChangeText={field.handleChange}
                    keyboardType="email-address"
                    autoComplete="email"
                    placeholder={t('auth:email_placeholder')}
                    errors={prepareErrors(field.state.meta.errors)}
                  />
                )}
              </form.Field>
              <form.Field
                name="password"
                validators={{
                  onChange: (field) => {
                    // First check if the field is empty
                    if (!field.value) {
                      setPasswordValid(false);
                      return [t('auth:password_required')];
                    }
                    
                    // Then check if it meets the minimum length
                    const result = v.safeParse(
                      v.pipe(
                        v.string(),
                        v.minLength(6, t('auth:password_invalid'))
                      ),
                      field.value
                    );
                    setPasswordValid(result.success);
                    if (result.success) return;
                    return [result.issues?.[0].message]; // Only return the first error
                  },
                }}
              >
                {(field) => (
                  <>
                    <CInput
                      id="login-password"
                      labelText={t('auth:password_label')}
                      size="$3"
                      value={field.state.value}
                      onChangeText={field.handleChange}
                      secureTextEntry={true}
                      autoComplete="password"
                      placeholder={t('auth:password_placeholder')}
                      errors={prepareErrors(field.state.meta.errors)}
                    />
                    <Text
                      cursor="pointer"
                      fontSize="$3"
                      alignSelf="flex-end"
                      onPress={onNavigateToForgotPassword}
                    >
                      {t('auth:password_forgot')}
                    </Text>
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
                <CButton
                  disabled={
                    !emailValid ||
                    !passwordValid ||
                    form.state.isSubmitting ||
                    isLoading
                  }
                  loading={isLoading}
                  size="md"
                  variant="primary"
                  onPress={() => form.handleSubmit()}
                  width={200}
                >
                  {t('common:login')}
                </CButton>
                <Text
                  fontSize={'$3'}
                  color="$textSecondary"
                  marginTop="$3"
                  textAlign="center"
                >
                  {t('auth:no_account_question')}{' '}
                  <Text
                    cursor="pointer"
                    color="$textPrimary"
                    onPress={() => {
                      console.log('Navigate to signup');
                      if (onNavigateToSignUp) {
                        onNavigateToSignUp();
                      }
                    }}
                  >
                    {t('auth:no_account_link')}
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
