import { useCallback } from 'react';
import { Input } from './parts/inputParts';
import { YStack, Text, XStack, Stack } from 'tamagui';
import { Platform } from 'react-native';
import { useKeyboardHandling } from '@bbook/utils';

type DisplayRendererProps = {
  value: string;
  onEdit: (e?: React.MouseEvent) => void;
  showUndo: boolean;
  onUndo?: () => void;
};

type InputRendererProps = {
  value: string;
  onChange: (value: string) => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
  autoFocus?: boolean;
  onSubmitEditing?: () => void;
  onBlur?: () => void;
};

export type InlineEditableProps = {
  /** Current value of the field */
  value: string;
  /** Callback when the value changes */
  onChange: (value: string) => void;
  /** Whether the field is in edit mode */
  isEditing: boolean;
  /** Callback when edit mode should start */
  onEditStart: (e?: React.MouseEvent, id?: string) => boolean | void;
  /** Callback when edit mode should end */
  onEditEnd: () => void;

  /** Optional unique identifier for the field */
  id?: string;

  /** Undo functionality */
  showUndo?: boolean;
  onUndo?: () => void;

  /** Validation */
  error?: string | null;

  /** UI customization */
  label?: string;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  className?: string;

  /** Custom rendering */
  renderDisplay?: (props: {
    value: string;
    onEdit: () => void;
    showUndo: boolean;
    onUndo?: () => void;
  }) => React.ReactNode;

  renderInput?: (props: {
    value: string;
    onChange: (value: string) => void;
    onKeyDown: (e: React.KeyboardEvent) => void;
    autoFocus?: boolean;
    onSubmitEditing?: () => void;
    onBlur?: () => void;
  }) => React.ReactNode;
};

/**
 * A flexible inline editable text field component.
 * Can be used for inline editing of text with optional undo functionality.
 */
export const InlineEditable: React.FC<InlineEditableProps> = ({
  value,
  onChange,
  isEditing,
  onEditStart,
  onEditEnd,
  id,
  showUndo = false,
  onUndo,
  error,
  label,
  placeholder = 'Enter text...',
  disabled = false,
  required = false,
  className,
  renderDisplay,
  renderInput,
}) => {
  // Handle input changes
  const handleInputChange = useCallback(
    (text: string) => {
      onChange(text);
    },
    [onChange]
  );

  // Handle save
  const handleSave = useCallback(() => {
    if (disabled) return;
    console.log('InlineEditable handleSave called');
    onEditEnd();
  }, [disabled, onEditEnd]);

  // Handle cancel
  const handleCancel = useCallback(() => {
    console.log('InlineEditable handleCancel called');
    onEditEnd();
  }, [onEditEnd]);

  // Handle keyboard events
  const handleKeyDown = useKeyboardHandling({
    onEnter: handleSave,
    onEscape: handleCancel,
  });

  // Handle click on the display to start editing
  const handleDisplayClick = useCallback(() => {
    if (disabled) return;
    console.log('InlineEditable handleDisplayClick called');

    // Only proceed if onEditStart returns true or undefined (not false)
    const result = onEditStart?.(undefined, id);
    console.log(`onEditStart result: ${result}`);

    if (result === false) {
      // If onEditStart returns false, don't proceed with editing
      console.log('onEditStart returned false, not proceeding with editing');
      return;
    }
  }, [disabled, id, onEditStart]);

  // Default display renderer
  const defaultRenderDisplay = useCallback(
    ({ value, onEdit, showUndo, onUndo }: DisplayRendererProps) => {
      console.log('InlineEditable defaultRenderDisplay:', {
        showUndo,
        hasUndoHandler: !!onUndo,
      });
      return (
        <Stack
          onPress={() => {
            onEdit();
          }}
          flexDirection="row"
          alignItems="center"
          flex={1}
          cursor={disabled ? 'not-allowed' : 'pointer'}
          opacity={disabled ? 0.7 : 1}
        >
          <Text
            flex={1}
            numberOfLines={1}
            ellipsizeMode="tail"
            color={disabled ? '$color9' : '$color12'}
          >
            {value || placeholder}
          </Text>
          {showUndo && onUndo && !disabled && (
            <Text
              color="$blue10"
              marginLeft="$2"
              onPress={(e) => {
                e.stopPropagation();
                onUndo();
              }}
            >
              Undo
            </Text>
          )}
        </Stack>
      );
    },
    [disabled, placeholder]
  );

  // Default input renderer
  const defaultRenderInput = useCallback(
    ({
      value,
      onChange,
      onKeyDown,
      autoFocus,
      onSubmitEditing,
      onBlur,
    }: InputRendererProps) => {
      // Handle platform-specific props
      const platformProps =
        Platform.OS === 'web' ? { onKeyDown } : { onSubmitEditing };

      return (
        <Input.Area
          value={value}
          onChangeText={onChange}
          onBlur={onBlur}
          {...platformProps}
          autoFocus={autoFocus}
          flex={1}
          borderWidth={0}
          outlineWidth={0}
          padding={0}
          fontSize="$5"
          backgroundColor="transparent"
          placeholder={placeholder}
          returnKeyType="done"
          blurOnSubmit={false} // Prevent automatic blur handling
          enablesReturnKeyAutomatically={false} // Prevent automatic submission
          editable={!disabled}
        />
      );
    },
    [disabled, placeholder]
  );

  // Debug the showUndo prop
  console.log('InlineEditable props:', {
    value,
    isEditing,
    showUndo,
    hasUndoHandler: !!onUndo
  });

  // Use custom renderers if provided, otherwise use defaults
  const displayContent = renderDisplay
    ? renderDisplay({
        value,
        onEdit: handleDisplayClick,
        showUndo,
        onUndo,
      })
    : defaultRenderDisplay({
        value,
        onEdit: handleDisplayClick,
        showUndo,
        onUndo,
      });

  const inputContent = renderInput
    ? renderInput({
        value,
        onChange: handleInputChange,
        onKeyDown: handleKeyDown,
        autoFocus: true,
        onSubmitEditing: handleSave,
        onBlur: handleSave,
      })
    : defaultRenderInput({
        value,
        onChange: handleInputChange,
        onKeyDown: handleKeyDown,
        autoFocus: true,
        onSubmitEditing: handleSave,
        onBlur: handleSave,
      });

  return (
    <YStack width="100%" className={className} opacity={disabled ? 0.7 : 1}>
      {label && (
        <Text fontSize="$3" color="$color11" marginBottom="$2">
          {label}
          {required && <Text color="$red10"> *</Text>}
        </Text>
      )}

      <XStack
        width="100%"
        alignItems="center"
        borderWidth={1}
        borderColor={error ? '$red8' : '$gray8'}
        borderRadius="$2"
        paddingHorizontal="$3"
        paddingVertical="$2"
        backgroundColor="$color2"
        hoverStyle={!disabled ? { borderColor: '$gray9' } : undefined}
      >
        {isEditing ? inputContent : displayContent}
      </XStack>

      {error && (
        <Text color="$red10" fontSize="$2" marginTop="$1.5">
          {error}
        </Text>
      )}
    </YStack>
  );
};

InlineEditable.displayName = 'InlineEditable';
