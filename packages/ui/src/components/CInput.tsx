import type { FontSizeTokens, SizeTokens } from 'tamagui';
import { View } from 'tamagui';
import { Input } from './parts/inputParts';
import { forwardRef, useImperativeHandle, useRef } from 'react';
import { YStack, Paragraph } from 'tamagui';

export interface CInputProps {
  errors?: string | string[];
  size?: SizeTokens;
  focusOnMount?: boolean;
  labelText?: string;
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
}

export const CInput = forwardRef<any, CInputProps>(
  (
    {
      labelText = 'Label',
      size,
      focusOnMount = false,
      onChangeText,
      secureTextEntry = false,
      placeholder,
      autoCapitalize = 'none',
      keyboardType,
      autoComplete,
      errors,
      id,
    },
    ref
  ) => {
    // Normalize errors to an array for consistent rendering
    const normalizedErrors = errors
      ? Array.isArray(errors)
        ? errors
        : [errors]
      : [];
    // Set default placeholder based on field type
    const defaultPlaceholder = secureTextEntry ? '••••••' : 'email@example.com';
    
    // Generate a unique ID if none is provided
    const uniqueId = id || `input-${labelText.toLowerCase()}-${Math.random().toString(36).substring(2, 9)}`;

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
      <View flexDirection="column" width="100%" tabIndex={-1}>
        <Input size={size} width="100%" tabIndex={-1}>
          <Input.Label
            htmlFor={uniqueId}
            marginBottom="$1.5"
            tabIndex={-1}
          >
            {labelText}
          </Input.Label>
          <Input.Box
            tabIndex={-1}
            height={50}
            justifyContent="center"
            alignItems="center"
          >
            <Input.Area
              ref={inputAreaRef}
              id={uniqueId}
              placeholder={placeholder || defaultPlaceholder}
              autoFocus={focusOnMount}
              onChangeText={onChangeText}
              secureTextEntry={secureTextEntry}
              autoCapitalize={autoCapitalize}
              keyboardType={keyboardType}
              autoComplete={autoComplete}
              height={40}
              color="$color12"
              fontSize="$4"
            />
          </Input.Box>
          {/* Render errors if provided */}
          {normalizedErrors.length > 0 && (
            <YStack marginTop="$1" gap={2}>
              {normalizedErrors.map((error: string, i: number) => (
                <Paragraph color="$error" size={size as FontSizeTokens} key={i}>
                  {error}
                </Paragraph>
              ))}
            </YStack>
          )}
        </Input>
      </View>
    );
  }
);
