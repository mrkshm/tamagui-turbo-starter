/**
 * Base configuration for a form field
 */
export type BaseFieldConfig<T extends string> = {
  /** Unique identifier for the field */
  id: T;
  /** Display label for the field */
  label: string;
  /** Whether the field is required */
  required?: boolean;
  /** Validation function that returns an error message if invalid */
  validate?: (value: unknown) => string | undefined;
};

/**
 * Extended field configuration with UI-specific properties
 */
export type UIFieldConfig<T extends string = string> = BaseFieldConfig<T> & {
  /** Input type */
  type?: 'text' | 'email' | 'password' | 'textarea' | 'select' | 'date' | 'number';
  /** Placeholder text */
  placeholder?: string;
  /** Keyboard type for mobile devices */
  keyboardType?: string;
  /** Auto-capitalization behavior */
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  /** Whether to enable auto-correct */
  autoCorrect?: boolean;
  /** Whether the field should be multiline */
  multiline?: boolean;
  /** Number of rows for textarea fields */
  rows?: number;
  /** Additional class name for the field container */
  className?: string;
};

/**
 * Props for form field components
 */
export type FormFieldProps = {
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
  /** Error message to display, if any */
  error?: string;
};
