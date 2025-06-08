import { FormField } from './FormField';
import { useCallback } from 'react';
import { FormCard } from '../parts/layoutParts';
import type { UIFieldConfig } from '@bbook/utils';

type RenderFormFieldProps<T extends string> = {
  field: UIFieldConfig<T>;
  fieldProps: {
    value: string;
    onBlur: () => void;
    onFocus: () => void;
    error?: string;
    showUndo?: boolean;
    onUndo?: () => void;
  };
  isEditing: (fieldId: T) => boolean;
  handleFieldChange: (fieldId: T, value: string) => void;
  handleEditStart: (fieldId: T) => void;
  handleEditEnd: () => void;
};

export function RenderFormField<T extends string>({
  field,
  fieldProps,
  isEditing,
  handleFieldChange,
  handleEditStart,
  handleEditEnd,
}: RenderFormFieldProps<T>) {
  // field.id is guaranteed to be of type T due to the generic constraint
  const fieldId = field.id;
  const isFieldEditing = isEditing(fieldId);
  
  // Create a type-safe handler for field changes
  const handleFieldChangeSafe = useCallback((id: string, value: string) => {
    // We know that id must be of type T because it comes from our field
    handleFieldChange(id as unknown as T, value);
  }, [handleFieldChange]);

  // Create a wrapper for handleEditStart to ensure type safety
  const handleEditStartWrapper = useCallback((id: string): boolean => {
    // Call the original handleEditStart and ensure we return a boolean
    return Boolean(handleEditStart(id as unknown as T));
  }, [handleEditStart]);

  // Create a wrapper for handleEditEnd that ensures the field is saved
  const handleEditEndWrapper = useCallback(() => {
    // Call the original handleEditEnd
    handleEditEnd();
    
    // The actual save will be triggered by the parent component (ContactEditor)
    // through the handleFieldChange callback when the field value changes
  }, [handleEditEnd]);

  return (
    <FormCard key={fieldId}>
      <FormField
        fieldId={fieldId as string}
        value={fieldProps.value || ''}
        onChange={(value) => handleFieldChangeSafe(fieldId as string, value)}
        // We're not using onBlur for saving anymore
        onBlur={() => {}}
        onFocus={fieldProps.onFocus}
        isEditing={isFieldEditing}
        handleEditStart={handleEditStartWrapper}
        handleEditEnd={handleEditEndWrapper}
        editingField={isFieldEditing ? fieldId : null}
        label={field.label}
        placeholder={field.placeholder}
        error={fieldProps.error}
        showUndo={fieldProps.showUndo}
        onUndo={fieldProps.onUndo}
        type={field.type || 'text'}
        rows={field.type === 'textarea' ? 4 : undefined}
        keyboardType={field.keyboardType}
        autoCapitalize={field.autoCapitalize}
        autoCorrect={field.autoCorrect}
        required={field.required}
      />
    </FormCard>
  );
}

export default RenderFormField;