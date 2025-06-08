import { useCallback } from 'react';
import {
  useEditableForm,
  required,
  email as emailValidator,
  combineValidators,
  UIFieldConfig,
} from '@bbook/utils';
import { YStack, ScrollView } from '@bbook/ui';
import { RenderFormField } from '@bbook/ui/src/components/form/RenderFormField';
import { Contact } from '@bbook/data';
import { getChangedFields } from '@bbook/utils';

export type FieldKey =
  | 'display_name'
  | 'first_name'
  | 'last_name'
  | 'email'
  | 'phone'
  | 'location'
  | 'organization'
  | 'notes';

interface ContactEditorProps {
  contact: Contact;
  onSubmit?: (changes: Partial<Contact>) => void;
  onError?: (error: Error) => void;
  isPending?: boolean;
}

const fieldConfigs: UIFieldConfig<FieldKey>[] = [
  {
    id: 'display_name',
    label: 'Display Name',
    placeholder: 'Display Name',
    type: 'text',
    validate: required('Display name is required'),
  },
  {
    id: 'first_name',
    label: 'First Name',
    placeholder: 'First Name',
    type: 'text',
  },
  {
    id: 'last_name',
    label: 'Last Name',
    placeholder: 'Last Name',
    type: 'text',
  },
  {
    id: 'email',
    label: 'Email',
    placeholder: 'Email',
    type: 'email',
    validate: combineValidators(
      required('Email is required'),
      emailValidator('Please enter a valid email')
    ),
  },
  {
    id: 'phone',
    label: 'Phone',
    placeholder: 'Phone',
    type: 'text',
    keyboardType: 'phone-pad',
  },
  {
    id: 'location',
    label: 'Location',
    placeholder: 'Location',
    type: 'text',
  },
  {
    id: 'organization',
    label: 'Organization',
    placeholder: 'Organization',
    type: 'text',
  },
  {
    id: 'notes',
    label: 'Notes',
    placeholder: 'Notes',
    type: 'textarea',
    autoCapitalize: 'sentences',
  },
];

export function ContactEditor({
  contact,
  onSubmit,
  onError,
  isPending,
}: ContactEditorProps) {
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
      organization: contact.organization || '',
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
    <ScrollView>
      <YStack
        onPress={handleContainerClick}
        flex={1}
        paddingHorizontal="$4"
        paddingTop="$4"
        paddingBottom="$4"
      >
        <YStack gap="$4">{fieldConfigs.map(renderField)}</YStack>
      </YStack>
    </ScrollView>
  );
}
