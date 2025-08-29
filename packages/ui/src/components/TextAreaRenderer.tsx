import { useCallback, useRef } from 'react';
import { YStack, XStack, Button, TextArea } from 'tamagui';
import { Platform, TextInput } from 'react-native';

export type TextAreaRendererProps = {
  value: string;
  onChange: (value: string) => void;
  onKeyDown?: (e: React.KeyboardEvent) => void;
  autoFocus?: boolean;
  onSubmitEditing?: () => void;
  onBlur?: () => void;
  onCancel?: () => void;
  placeholder?: string;
  minHeight?: number;
  maxHeight?: number;
};

/**
 * A custom renderer for TextArea fields with explicit save/cancel buttons
 * while maintaining the core keyboard behavior of the editable field system.
 */
export const TextAreaRenderer = ({
  value,
  onChange,
  onKeyDown,
  autoFocus = true,
  onSubmitEditing,
  // onBlur is received but not used directly - we handle blur through save/cancel buttons
  onBlur: _onBlur,
  onCancel,
  placeholder = 'Enter text...',
  minHeight = 150,
  maxHeight,
}: TextAreaRendererProps) => {
  const textAreaRef = useRef<TextInput>(null);

  // Handle save button click
  const handleSave = useCallback(() => {
    console.log('TextAreaRenderer: Save button clicked');
    onSubmitEditing?.();
  }, [onSubmitEditing]);

  // Handle cancel button click
  const handleCancel = useCallback(() => {
    console.log('TextAreaRenderer: Cancel button clicked');
    onCancel?.();
  }, [onCancel]);

  // Handle key events for web platform
  const handleKeyDownWrapper = useCallback(
    (e: React.KeyboardEvent) => {
      // Pass through to the original onKeyDown handler
      if (onKeyDown) {
        onKeyDown(e);
      }
    },
    [onKeyDown]
  );

  return (
    <YStack width="100%">
      {Platform.OS === 'web' ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDownWrapper}
          autoFocus={autoFocus}
          placeholder={placeholder}
          style={{
            width: '100%',
            minHeight: minHeight,
            maxHeight: maxHeight,
            padding: 8,
            borderRadius: 4,
            borderColor: 'transparent',
            backgroundColor: 'transparent',
            fontFamily: 'inherit',
            fontSize: 'inherit',
            resize: 'vertical',
            outline: 'none',
          }}
        />
      ) : (
        <TextArea
          ref={textAreaRef}
          value={value}
          onChangeText={onChange}
          autoFocus={autoFocus}
          placeholder={placeholder}
          minHeight={'%4'}
          maxHeight={maxHeight}
          padding="$2"
          borderColor="transparent"
          backgroundColor="transparent"
          onSubmitEditing={onSubmitEditing}
        />
      )}

      <XStack justifyContent="flex-end" gap="$2" marginTop="$2">
        <Button size="$2" variant="outlined" onPress={handleCancel} chromeless>
          Cancel
        </Button>
        <Button size="$2" onPress={handleSave}>
          Save
        </Button>
      </XStack>
    </YStack>
  );
};
