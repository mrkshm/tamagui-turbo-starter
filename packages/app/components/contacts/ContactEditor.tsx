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
import { Contact } from '@bbook/data';
import { getChangedFields } from '@bbook/utils';
import { useTranslation } from '@bbook/i18n';

export type FieldKey =
  | 'display_name'
  | 'first_name'
  | 'last_name'
  | 'email'
  | 'phone'
  | 'location'
  | 'notes';

interface ContactEditorProps {
  contact: Contact;
  onSubmit?: (changes: Partial<Contact>) => void;
  onError?: (error: Error) => void;
  isPending?: boolean;
}

export function ContactEditor({
  contact,
  onSubmit,
  onError,
  isPending,
}: ContactEditorProps) {
  const { t } = useTranslation();

  const fieldConfigs: UIFieldConfig<FieldKey>[] = [
    {
      id: 'display_name',
      label: t('contacts:fields.display_name'),
      placeholder: t('contacts:fields.display_name_placeholder'),
      type: 'text',
      validate: required('Display name is required'),
    },
    {
      id: 'first_name',
      label: t('contacts:fields.first_name'),
      placeholder: t('contacts:fields.first_name_placeholder'),
      type: 'text',
    },
    {
      id: 'last_name',
      label: t('contacts:fields.last_name'),
      placeholder: t('contacts:fields.last_name_placeholder'),
      type: 'text',
    },
    {
      id: 'email',
      label: t('contacts:fields.email'),
      placeholder: t('contacts:fields.email_placeholder'),
      type: 'email',
      validate: combineValidators(
        required('Email is required'),
        emailValidator('Please enter a valid email')
      ),
    },
    {
      id: 'phone',
      label: t('contacts:fields.phone'),
      placeholder: t('contacts:fields.phone_placeholder'),
      type: 'text',
      keyboardType: 'phone-pad',
    },
    {
      id: 'location',
      label: t('contacts:fields.location'),
      placeholder: t('contacts:fields.location_placeholder'),
      type: 'text',
    },
    {
      id: 'notes',
      label: t('contacts:fields.notes'),
      placeholder: t('contacts:fields.notes_placeholder'),
      type: 'textarea',
      autoCapitalize: 'sentences',
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
      display_name: contact.display_name || '',
      first_name: contact.first_name || '',
      last_name: contact.last_name || '',
      email: contact.email || '',
      phone: contact.phone || '',
      location: contact.location || '',
      notes: contact.notes || '',
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
        const changed = getChangedFields(contact, values) as Partial<Contact>;
        if (Object.keys(changed).length === 0) return;
        onSubmit(changed);
      } catch (error) {
        if (onError) {
          onError(
            error instanceof Error
              ? error
              : new Error(t('contacts:errors.update_error'))
          );
        }
      }
    },
  });

  const renderField = useCallback(
    (field: UIFieldConfig<FieldKey>) => {
      const fieldProps = getFieldProps(field.id);

      // Create a custom handleEditEnd that saves the field when editing ends
      const handleFieldEditEnd = () => {
        saveField?.(field.id);
      };

      return (
        <RenderFormField<FieldKey>
          key={field.id}
          field={field}
          fieldProps={{
            value: fieldProps.value || '',
            onBlur: () => {},
            onFocus: fieldProps.onFocus,
            error: fieldProps.error,
            showUndo: fieldProps.showUndo,
            onUndo: fieldProps.onUndo,
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
