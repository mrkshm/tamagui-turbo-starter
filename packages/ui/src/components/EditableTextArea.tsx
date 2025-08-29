import { useCallback } from 'react';
import { EditableField } from './EditableField';
import { TextAreaRenderer } from './TextAreaRenderer';
import { InlineEditable } from './InlineEditable';

// Define the EditableFieldProps type based on the EditableField component props
type EditableFieldProps = React.ComponentProps<typeof EditableField>;

// Omit the children prop since we're providing our own renderer
type EditableTextAreaProps = Omit<EditableFieldProps, 'children'>;

/**
 * A specialized version of EditableField that uses TextAreaRenderer for multi-line text editing.
 * Provides explicit save/cancel buttons while maintaining the core keyboard behavior.
 */
export function EditableTextArea(props: EditableTextAreaProps) {
  const {
    value,
    onChange,
    isEditing,
    handleEditStart,
    handleEditEnd,
    onCancel,
    placeholder,
  } = props;

  // Create a custom renderer for the InlineEditable component
  const customRenderer = useCallback(
    ({
      value,
      onChange,
      onKeyDown,
      autoFocus,
      onSubmitEditing,
    }: {
      value: string;
      onChange: (value: string) => void;
      onKeyDown: (e: React.KeyboardEvent) => void;
      autoFocus?: boolean;
      onSubmitEditing?: () => void;
    }) => {
      return (
        <TextAreaRenderer
          value={value}
          onChange={onChange}
          onKeyDown={onKeyDown}
          autoFocus={autoFocus}
          onSubmitEditing={onSubmitEditing}
          onCancel={onCancel}
          placeholder={placeholder}
        />
      );
    },
    [onCancel, placeholder]
  );

  return (
    <EditableField
      {...props}
      // Override the default InlineEditable with our custom renderer
      children={
        isEditing && (
          <InlineEditable
            value={value}
            onChange={onChange}
            isEditing={isEditing}
            onEditStart={(_, id) => (id ? handleEditStart(id) : false)}
            onEditEnd={handleEditEnd}
            placeholder={placeholder}
            renderInput={customRenderer}
          />
        )
      }
    />
  );
}
