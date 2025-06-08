import { useCallback, useMemo } from 'react';
import { useEditableFields } from './useEditableFields';
import type { UIFieldConfig } from '../types/form';

// Ensure field IDs are always strings
type StringKeyOf<T> = Extract<keyof T, string>;

// Type for field props returned by getFieldProps
interface FieldProps {
  value: string;
  onChange: (value: string) => void;
  onBlur: () => void;
  onFocus: () => void;
  isEditing: boolean;
  error?: string;
  /** True while the 5-second undo window is visible */
  showUndo?: boolean;
  /** Callback to revert to the previous value */
  onUndo?: () => void;
}

interface UseEditableFormProps<T extends Record<string, unknown>> {
  fieldConfigs?: {
    [K in StringKeyOf<T>]?: Omit<UIFieldConfig<K>, 'id'> & { validate?: (value: string) => string | undefined };
  };
  initialValues: T;
  onSubmit: (values: T) => Promise<void>;
  validate?: (values: T) => Partial<Record<StringKeyOf<T>, string>>;
}

export interface UseEditableFormReturn<T> {
  fieldValues: T;
  isEditing: (fieldId: StringKeyOf<T>) => boolean;
  isFormDirty: boolean;
  handleEditStart: (fieldId: StringKeyOf<T>) => boolean;
  handleEditEnd: () => void;
  handleFieldChange: (fieldId: StringKeyOf<T>, value: string) => void;
  handleSave: (fieldId: StringKeyOf<T>) => Promise<void>;
  handleCancel: (fieldId: StringKeyOf<T>) => void;
  handleSubmit: () => Promise<void>;
  getFieldProps: (fieldId: StringKeyOf<T>) => FieldProps;
  isAnyFieldEditing: () => boolean;
  saveField: (fieldId: StringKeyOf<T>) => Promise<void>;
}



/**
 * Hook for managing editable form state
 */
export function useEditableForm<T extends Record<string, unknown>>(
  props: UseEditableFormProps<T>
): UseEditableFormReturn<T> {
  const { initialValues, fieldConfigs = {}, onSubmit, validate } = props;

  // Convert initial values to string values for the form
  const stringInitialValues = useMemo(() => 
    Object.entries(initialValues).reduce(
      (acc, [key, value]) => ({
        ...acc,
        [key]: String(value ?? '')
      }),
      {} as Record<string, string>
    ),
    [initialValues]
  );

  // Initialize the form state with useEditableFields
  const {
    fieldValues = stringInitialValues,
    isEditing,
    handleEditStart: originalHandleEditStart,
    handleEditEnd: originalHandleEditEnd,
    updateFieldValue,
    saveField,
    undoStates = {},
  } = useEditableFields<string>({
    initialValues: stringInitialValues,
    onSave: async (fieldId: string, value: string) => {
      console.log('useEditableFields onSave called with:', { fieldId, value });
      try {
        const updates = { ...initialValues, [fieldId]: value } as T;
        console.log('Calling onSubmit with updates:', updates);
        await onSubmit(updates);
        console.log('onSubmit completed successfully');
      } catch (error) {
        console.error('Error in useEditableFields onSave:', error);
        throw error;
      }
    },
  });
  
  // Create a typed version of fieldValues that matches the expected type
  const typedFieldValues = useMemo(() => ({
    ...initialValues,
    ...Object.fromEntries(
      Object.entries(fieldValues).map(([key, value]) => [key, value])
    )
  }), [fieldValues, initialValues]);

  // Handle starting to edit a field
  const handleEditStart = useCallback(
    (fieldId: StringKeyOf<T>) => {
      return originalHandleEditStart(String(fieldId));
    },
    [originalHandleEditStart]
  );

  // Handle ending edit mode
  const handleEditEnd = useCallback(() => {
    originalHandleEditEnd();
  }, [originalHandleEditEnd]);

  // Handle field value changes
  const handleFieldChange = useCallback(
    (fieldId: StringKeyOf<T>, value: string) => {
      updateFieldValue?.(String(fieldId), value);
    },
    [updateFieldValue]
  );

  // Handle canceling edits
  const handleCancel = useCallback(
    (fieldId: StringKeyOf<T>) => {
      const fieldKey = String(fieldId);
      const undo = undoStates[fieldKey]?.undo;
      if (undo) {
        undo();
      }
      handleEditEnd();
    },
    [handleEditEnd, undoStates]
  );

  // Handle saving a field
  const handleSave = useCallback(
    async (fieldId: StringKeyOf<T>) => {
      if (saveField) {
        await saveField(String(fieldId));
      }
    },
    [saveField]
  );

  // Handle form submission
  const handleSubmit = useCallback(async () => {
    if (validate) {
      const currentValues = {
        ...initialValues,
        ...Object.fromEntries(
          Object.entries(fieldValues).map(([key, value]) => [key, value])
        )
      } as T;
      const errors = validate(currentValues);
      if (Object.keys(errors).length > 0) {
        // Handle validation errors
        return;
      }
      await onSubmit(currentValues);
    } else {
      await onSubmit({
        ...initialValues,
        ...fieldValues
      } as T);
    }
  }, [fieldValues, initialValues, onSubmit, validate]);

  // Check if the form has been modified
  const isFormDirty = useMemo(() => {
    return Object.entries(fieldValues).some(
      ([key, value]) => {
        const initialValue = initialValues[key as keyof T];
        return value !== String(initialValue ?? '');
      }
    );
  }, [fieldValues, initialValues]);

  // Get props for a field
  const getFieldProps = useCallback(
    (fieldId: StringKeyOf<T>): FieldProps => {
      type FieldConfig = {
        validate?: (value: string) => string | undefined;
        [key: string]: unknown;
      };
      
      const fieldKey = String(fieldId);
      const fieldValue = fieldValues[fieldKey];
      const fieldConfig: FieldConfig | undefined = fieldId in fieldConfigs 
        ? fieldConfigs[fieldId as keyof typeof fieldConfigs] as FieldConfig
        : undefined;

      // Get validation error from field config or global validate function
      let error: string | undefined;
      if (fieldConfig?.validate) {
        error = fieldConfig.validate(String(fieldValue ?? ''));
      } else if (validate) {
        const currentValues = {
          ...initialValues,
          ...fieldValues
        } as T;
        const errors = validate(currentValues);
        error = errors[fieldId as keyof T] as string | undefined;
      }

      const undoState = undoStates[fieldKey];

      return {
        value: String(fieldValue ?? ''),
        onChange: (value: string) => handleFieldChange(fieldId, value),
        onBlur: () => handleSave(fieldId),
        onFocus: () => handleEditStart(fieldId),
        isEditing: isEditing(fieldKey),
        error,
        showUndo: undoState?.showUndo ?? false,
        onUndo: undoState?.undo,
      };
    },
    [
      fieldValues,
      fieldConfigs,
      validate,
      handleFieldChange,
      handleSave,
      handleEditStart,
      isEditing,
      undoStates,
      initialValues
    ]
  );

  // Check if any field is being edited
  const isAnyFieldEditing = useCallback((): boolean => {
    return Object.keys(fieldValues).some((key) => isEditing(key));
  }, [fieldValues, isEditing]);

  // Create a typed version of saveField
  const typedSaveField = useCallback(async (fieldId: StringKeyOf<T>) => {
    const fieldKey = String(fieldId);
    const currentValue = fieldValues[fieldKey];
    console.log(`Saving field ${fieldKey} with value:`, currentValue);
    
    try {
      if (saveField) {
        // First update the field value
        await saveField(fieldKey);
      }
      
      // Then call onSubmit with all current values
      const currentValues = {
        ...initialValues,
        ...fieldValues,
        [fieldKey]: currentValue
      } as T;
      
      console.log('Calling onSubmit with values:', currentValues);
      await onSubmit(currentValues);
      console.log('onSubmit completed successfully');
    } catch (error) {
      console.error('Error in typedSaveField:', error);
      throw error;
    }
  }, [saveField, fieldValues, initialValues, onSubmit]);

  return {
    fieldValues: typedFieldValues as T,
    isEditing: (fieldId: StringKeyOf<T>) => isEditing(String(fieldId)),
    isFormDirty,
    handleEditStart,
    handleEditEnd,
    handleFieldChange,
    handleSave,
    handleCancel,
    handleSubmit,
    getFieldProps,
    isAnyFieldEditing,
    saveField: typedSaveField,
  };
}

export default useEditableForm;
