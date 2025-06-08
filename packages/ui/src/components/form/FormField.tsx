import React from 'react';
import { YStack, XStack, Text, Label } from 'tamagui';
import { EditableField } from '../EditableField';
import { EditableTextArea } from '../EditableTextArea';

// Define the FieldProps interface since we can't import from @app/utils/types/form
export interface FieldProps {
  /** Current field value */
  value: string;
  /** Callback when field value changes */
  onChange: (value: string) => void;
  /** Callback when field loses focus */
  onBlur: () => void;
  /** Callback when field receives focus */
  onFocus: () => void;
  /** Whether the field is currently being edited */
  isEditing: boolean;
  /** Handler to start editing this field */
  handleEditStart: (fieldId: string) => boolean;
  /** Handler to end editing */
  handleEditEnd: () => void;
  /** Current editing field ID (or null if none) */
  editingField: string | null;
  /** Error message to display */
  error?: string;
  /** Show undo button */
  showUndo?: boolean;
  /** Callback to undo last save */
  onUndo?: () => void;
}

export interface FormFieldProps extends FieldProps {
  /** Field label */
  label?: string;
  /** Field ID (used for htmlFor and id attributes) */
  fieldId: string;
  /** Input type (text, email, password, etc.) */
  type?:
    | 'text'
    | 'email'
    | 'password'
    | 'textarea'
    | 'number'
    | 'select'
    | 'date'
    | 'tel';
  /** Placeholder text */
  placeholder?: string;
  /** Whether the field is required */
  required?: boolean;
  /** Additional class name for the field container */
  className?: string;
  /** Whether to show the error message */
  showError?: boolean;
  /** Additional styles for the input */
  inputStyle?: any;
  /** Number of rows for textarea */
  rows?: number;
  /** Whether the field is disabled */
  disabled?: boolean;
  /** Additional help text to display below the field */
  helpText?: string;
  /** Keyboard type for mobile devices (e.g., 'default', 'number-pad', 'email-address') */
  keyboardType?: string;
  /** How to capitalize text (e.g., 'none', 'sentences', 'words', 'characters') */
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  /** Whether to enable auto-correct */
  autoCorrect?: boolean;
}

/**
 * A reusable form field component that works with useEditableForm
 */
export const FormField = React.forwardRef<
  HTMLInputElement | HTMLTextAreaElement,
  FormFieldProps
>(
  ({
    label,
    fieldId,
    type = 'text',
    placeholder,
    required = false,
    className,
    showError = true,
    inputStyle,
    rows = 3,
    disabled = false,
    helpText,
    value,
    onChange,
    onBlur,
    onFocus,
    isEditing,
    handleEditStart,
    handleEditEnd,
    editingField,
    error,
    showUndo,
    onUndo,
    keyboardType,
    autoCapitalize,
    autoCorrect,
  }, ref) => {
    // Determine if we should show the error state
    const showErrorState = showError && error && !isEditing;

    // Common props for both EditableField and EditableTextArea
    const commonProps = {
      ref,
      fieldId,
      value,
      onChange,
      onBlur,
      onFocus,
      isEditing,
      handleEditStart,
      handleEditEnd,
      editingField,
      placeholder,
      disabled,
      errorMessage: showErrorState ? error : undefined,
      showUndo,
      onUndo,
      keyboardType,
      autoCapitalize,
      autoCorrect,
      ...inputStyle,
    };

    // Render the appropriate input based on type
    const renderInput = () => {
      if (type === 'textarea') {
        return (
          <EditableTextArea {...commonProps} height={rows ? rows * 24 : 80} />
        );
      }

      // For select and date types, we'll use a text input for now
      // In a real app, you might want to use specialized components
      const inputType =
        type === 'select' || type === 'date' ? 'text' : type || 'text';

      // Handle input type specific props
      const getInputProps = () => {
        const props: any = {
          ...commonProps,
          type: inputType,
        };

        // Set keyboard type based on input type
        if (type === 'email') {
          props.keyboardType = 'email-address';
          props.autoCapitalize = 'none';
          props.autoCorrect = false;
          props.autoComplete = 'email';
        } else if (type === 'number') {
          props.keyboardType = 'numeric';
        } else if (type === 'tel') {
          props.keyboardType = 'phone-pad';
          props.autoCapitalize = 'none';
          props.autoCorrect = false;
        } else {
          props.autoCapitalize = 'sentences';
          props.autoCorrect = true;
          props.autoComplete = 'on';
        }

        return props;
      };

      return <EditableField {...getInputProps()} />;
    };

    return (
      <YStack gap="$1.5" className={className}>
        {label && (
          <XStack gap="$1" alignItems="center">
            <Label htmlFor={fieldId} fontWeight="500" fontSize="$4">
              {label}
            </Label>
            {required && (
              <Text color="$red9" fontSize="$3">
                *
              </Text>
            )}
          </XStack>
        )}

        {renderInput()}

        {helpText && !showErrorState && (
          <Text color="$gray10" fontSize="$2" marginTop="$1.5">
            {helpText}
          </Text>
        )}
      </YStack>
    );
  }
);

FormField.displayName = 'FormField';

export default FormField;
