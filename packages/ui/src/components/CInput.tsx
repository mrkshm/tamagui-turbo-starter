import type { SizeTokens } from 'tamagui';
import { View } from 'tamagui';
import { Input } from './parts/inputParts';
import { forwardRef, useId, useImperativeHandle, useRef } from 'react';
import { Paragraph } from 'tamagui';

export interface CInputProps {
  errors?: string | string[];
  size?: SizeTokens;
  focusOnMount?: boolean;
  labelText?: string;
  value?: string;
  onChangeText?: (text: string) => void;
  secureTextEntry?: boolean;
  placeholder?: string;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  keyboardType?:
    | 'default'
    | 'email-address'
    | 'numeric'
    | 'phone-pad'
    | 'number-pad';
  autoComplete?:
    | 'off'
    | 'email'
    | 'password'
    | 'name'
    | 'tel'
    | 'username'
    | 'current-password'
    | 'new-password'
    | undefined;
  id?: string; // Optional custom ID
  testID?: string; // For testing
  style?: React.CSSProperties; // For custom styles
}

export const CInput = forwardRef<any, CInputProps>(
  (
    {
      labelText = 'Label',
      size,
      focusOnMount = false,
      value = '',
      onChangeText,
      placeholder,
      secureTextEntry = false,
      autoCapitalize = 'none',
      keyboardType = 'default',
      autoComplete,
      id,
      errors,
      testID,
      style,
    },
    ref
  ) => {
    // Set default placeholder based on field type
    const defaultPlaceholder = secureTextEntry ? '••••••' : 'email@example.com';

    // Generate a unique ID if none is provided
    const generatedId = useId();

// Add display name for better dev tools and to satisfy lint rule
CInput.displayName = 'CInput';
    const uniqueId = id || generatedId;

    // Create a ref for the input area
    const inputAreaRef = useRef<any>(null);

    // Forward the ref methods to the parent component
    useImperativeHandle(ref, () => ({
      focus: () => {
        if (inputAreaRef.current?.focus) {
          inputAreaRef.current.focus();
        }
      },
      blur: () => {
        if (inputAreaRef.current?.blur) {
          inputAreaRef.current.blur();
        }
      },
      // Forward the input element ref for direct DOM access if needed
      inputElement: inputAreaRef.current,
    }));

    return (
      <View flexDirection="column" width="100%" paddingRight="$4" tabIndex={-1}>
        <Input size={size} width="100%" tabIndex={-1}>
          <Input.Label htmlFor={uniqueId} marginBottom="$1.5" tabIndex={-1}>
            {labelText}
          </Input.Label>
          <Input.Box
            ref={inputAreaRef}
            id={uniqueId}
            testID={testID}
            style={style}
            backgroundColor="$background"
            borderRadius="$4"
            borderWidth="$1"
            borderColor="$borderColor"
          >
            <Input.Area
              value={value}
              onChangeText={onChangeText}
              placeholder={placeholder || defaultPlaceholder}
              secureTextEntry={secureTextEntry}
              autoCapitalize={autoCapitalize}
              keyboardType={keyboardType}
              autoComplete={autoComplete}
              autoFocus={focusOnMount}
              placeholderTextColor="$color10"
              paddingHorizontal="$4"
              paddingVertical="$3"
              borderRadius="$3"
              borderWidth={0}
              backgroundColor="transparent"
              color="$color"
              fontSize="$4"
              lineHeight="$4"
              width="100%"
            />
          </Input.Box>
          {/* Render errors if provided */}
          {errors ? (
            <Paragraph color="$red10" marginTop="$1.5">
              {Array.isArray(errors) ? errors[0] : errors}
            </Paragraph>
          ) : null}
        </Input>
      </View>
    );
  }
);

// Add display name for better dev tools and to satisfy lint rule
CInput.displayName = 'CInput';
