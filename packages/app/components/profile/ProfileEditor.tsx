import { useCallback } from 'react';
import {
  useEditableForm,
  required,
  email as emailValidator,
  combineValidators,
  UIFieldConfig,
} from '@bbook/utils';
import { YStack } from '@bbook/ui';
import { RenderFormField } from '@bbook/ui/src/components/form/RenderFormField';
import { ProfilePayload, User } from '@bbook/data';
import { getChangedFields } from '@bbook/utils';
import { useTranslation } from '@bbook/i18n';

type FieldKey = 'first_name' | 'last_name' | 'email' | 'username';

interface ProfileEditorProps {
  user: User;
  onSubmit?: (changes: Partial<ProfilePayload>) => void;
  onError?: (error: Error) => void;
  isPending?: boolean;
}

export function ProfileEditor({
  user,
  onSubmit,
  onError,
  isPending,
}: ProfileEditorProps) {
  const { t } = useTranslation();
  const fieldConfigs: UIFieldConfig<FieldKey>[] = [
    {
      id: 'first_name',
      label: t('profile:fields.first_name.label'),
      placeholder: t('profile:fields.first_name.placeholder'),
      type: 'text',
    },
    {
      id: 'last_name',
      label: t('profile:fields.last_name.label'),
      placeholder: t('profile:fields.last_name.placeholder'),
      type: 'text',
    },
    {
      id: 'email',
      label: t('profile:fields.email.label'),
      placeholder: t('profile:fields.email.placeholder'),
      type: 'email',
      keyboardType: 'email-address',
      autoCapitalize: 'none',
      validate: combineValidators(
        required('Email is required'),
        emailValidator('Please enter a valid email')
      ),
    },
    {
      id: 'username',
      label: t('profile:fields.username.label'),
      placeholder: t('profile:fields.username.placeholder'),
      type: 'text',
      autoCapitalize: 'none',
      validate: required('Username is required'),
    },
  ];
  // Initialize form with useEditableForm
  const {
    fieldValues,
    isEditing,
    handleEditStart,
    handleEditEnd,
    handleFieldChange,
    getFieldProps,
    saveField,
  } = useEditableForm<Record<FieldKey, string>>({
    initialValues: {
      first_name: user.first_name || '',
      last_name: user.last_name || '',
      email: user.email || '',
      username: user.username || '',
    },
    fieldConfigs: fieldConfigs.reduce(
      (acc, field) => ({
        ...acc,
        [field.id]: {
          validate: field.validate,
        },
      }),
      {}
    ),
    onSubmit: async (values: Record<FieldKey, string>) => {
      if (!onSubmit) return;

      try {
        const changed = getChangedFields(
          user,
          values
        ) as Partial<ProfilePayload>;

        if (Object.keys(changed).length === 0) return;
        onSubmit(changed);
      } catch (error) {
        if (onError) {
          onError(
            error instanceof Error
              ? error
              : new Error('Failed to update contact')
          );
        }
      }
    },
  });

  const renderField = useCallback(
    (field: UIFieldConfig<FieldKey>) => {
      const fieldProps = getFieldProps(field.id);

      // Create a custom handleEditEnd that saves the field when editing ends
      const handleFieldEditEnd = useCallback(() => {
        saveField?.(field.id);
      }, [field.id, saveField]);

      return (
        <RenderFormField<FieldKey>
          key={field.id}
          field={field}
          fieldProps={{
            value: fieldProps.value || '',
            onBlur: () => {},
            onFocus: fieldProps.onFocus,
            error: fieldProps.error,
          }}
          isEditing={isEditing}
          handleFieldChange={handleFieldChange}
          handleEditStart={handleEditStart}
          handleEditEnd={handleFieldEditEnd}
        />
      );
    },
    [getFieldProps, isEditing, handleEditStart, handleFieldChange, saveField]
  );

  // Handle container click to save changes when clicking outside editable fields
  const handleContainerClick = useCallback(() => {
    // Check if any field is currently being edited
    const isAnyFieldEditing = Object.keys(fieldValues).some((fieldId) =>
      isEditing(fieldId as FieldKey)
    );

    // If a field is being edited, end editing
    if (isAnyFieldEditing) {
      handleEditEnd();
    }
  }, [fieldValues, isEditing, handleEditEnd]);

  return (
    <YStack
      onPress={handleContainerClick}
      flex={1}
      paddingHorizontal="$4"
      paddingTop="$4"
      paddingBottom="$4"
    >
      <YStack gap="$4">{fieldConfigs.map(renderField)}</YStack>
    </YStack>
  );
}
