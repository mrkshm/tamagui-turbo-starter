import { useCallback, useEffect, useRef, useState } from 'react';
import { XStack, Button, View, type SizeTokens } from 'tamagui';
import { CInput } from '../CInput';
import { Search, X } from '@tamagui/lucide-icons';

export interface SearchInputProps {
  /**
   * Test ID for testing
   */
  testID: string;
  /**
   * Current search value
   */
  value: string;

  /**
   * Callback when search value changes (debounced)
   */
  onSearch: (text: string) => void;

  /**
   * Callback when search value changes immediately (not debounced)
   */
  onChangeText?: (text: string) => void;

  /**
   * Error message to display
   */
  errors?: string | string[];

  /**
   * Size of the input
   */
  size?: SizeTokens;

  /**
   * Debounce delay in milliseconds
   * @default 400
   */
  debounceMs?: number;

  /**
   * Placeholder text
   * @default "Search..."
   */
  placeholder?: string;

  /**
   * Whether to auto-focus the input
   * @default false
   */
  autoFocus?: boolean;

  /**
   * Whether to secure text entry (password)
   */
  secureTextEntry?: boolean;

  /**
   * Auto-capitalization behavior
   */
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';

  /**
   * Keyboard type
   */
  keyboardType?:
    | 'default'
    | 'email-address'
    | 'numeric'
    | 'phone-pad'
    | 'number-pad';

  /**
   * Auto-complete behavior
   */
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
}

/**
 * SearchInput component with debounced search and clear button
 */
export const SearchInput = ({
  value,
  onSearch,
  onChangeText,
  debounceMs = 400,
  placeholder = 'Search...',
  autoFocus = false,
  errors,
  size,
  secureTextEntry = false,
  autoCapitalize = 'none',
  keyboardType,
  autoComplete,
  testID = 'search-input',
}: SearchInputProps) => {
  // Local state for immediate updates
  const [searchTerm, setSearchTerm] = useState(value);

  // Debounce timer reference
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Sync local state with prop value
  useEffect(() => {
    setSearchTerm(value);
  }, [value]);

  // Handle text change with debounce
  const handleChangeText = useCallback(
    (text: string) => {
      setSearchTerm(text);

      // Call immediate change handler if provided
      if (onChangeText) {
        onChangeText(text);
      }

      // Clear existing timer
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      // Set new timer for debounced search
      debounceTimerRef.current = setTimeout(() => {
        onSearch(text);
      }, debounceMs);
    },
    [onChangeText, onSearch, debounceMs]
  );

  // Clear search
  const handleClear = useCallback(() => {
    handleChangeText('');
  }, [handleChangeText]);

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  const inputPaddingRight = 32; // Space for clear button when visible

  return (
    <XStack
      flex={1}
      alignItems="center"
      gap="$4"
      position="relative"
      width="100%"
    >
      {/* Search Icon */}
      <View position="relative" zIndex={1}>
        <Search size={'$1'} color="$textPrimary" />
      </View>

      {/* Input Field */}
      <View flex={1} width="100%">
        <View position="relative" width="100%">
          <CInput
            testID={testID}
            value={searchTerm}
            onChangeText={handleChangeText}
            placeholder={placeholder}
            focusOnMount={autoFocus}
            labelText="" // Empty label to hide it
            errors={errors}
            size={size}
            secureTextEntry={secureTextEntry}
            autoCapitalize={autoCapitalize}
            keyboardType={keyboardType}
            autoComplete={autoComplete}
            style={{
              paddingRight: inputPaddingRight,
              backgroundColor: '$background',
              borderRadius: '$4',
              width: '100%',
            }}
          />

          {/* Clear Button (only shown when there's text) */}
          {searchTerm && (
            <Button
              size="$2"
              unstyled
              position="absolute"
              right={16}
              top="35%"
              onPress={handleClear}
              aria-label="Clear search"
              testID="clear-search-button"
              zIndex={2}
            >
              <X size={16} color="$textPrimary" />
            </Button>
          )}
        </View>
      </View>
    </XStack>
  );
};
