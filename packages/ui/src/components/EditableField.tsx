import { XStack, YStack, Text } from 'tamagui';
import { InlineEditable } from './InlineEditable';
import { ReactNode, useRef, useCallback } from 'react';
import { GestureResponderEvent, Platform, TextInput } from 'react-native';
import { useKeyboardHandling } from '@bbook/utils';

type EditableFieldProps = {
  // Field identifier
  fieldId: string;
  // Current value
  value: string;
  // Value change handler
  onChange: (value: string) => void;
  // Whether this field is currently being edited
  isEditing: boolean;
  // Handler to start editing this field
  handleEditStart: (fieldId: string) => boolean;
  // Handler to end editing
  handleEditEnd: () => void;
  // Handler for when editing is canceled (e.g., via Escape key)
  onCancel?: () => void;
  // Current editing field ID (or null if none)
  editingField: string | null;
  // Optional error message to display
  errorMessage?: string;
  // Optional background colors
  activeColor?: string;
  inactiveColor?: string;
  // Optional text colors
  activeTextColor?: string;
  inactiveTextColor?: string;
  // Optional placeholder
  placeholder?: string;
  // Optional height
  height?: number | string;
  // Optional tab index for keyboard navigation (web only)
  tabIndex?: number;
  // Optional handler for when Tab key is pressed (web only)
  onTabNavigation?: (direction: 'next' | 'prev') => void;
  // Optional show undo button
  showUndo?: boolean;
  // Optional undo handler
  onUndo?: () => void;
  // Optional children (for simple fields)
  children?: ReactNode;
};

/**
 * A reusable component for editable fields that handles all the common logic.
 * Can be used with either InlineEditable or simple text fields.
 */
export function EditableField({
  fieldId,
  value,
  onChange,
  isEditing,
  handleEditStart,
  handleEditEnd,
  onCancel,
  editingField,
  errorMessage,
  activeColor = '$purple5',
  inactiveColor = '$gray5',
  placeholder = 'Type something...',
  height = 100,
  tabIndex,
  onTabNavigation,
  showUndo = false,
  onUndo,
  children,
}: EditableFieldProps) {
  // Handle container click - now also starts editing if no field is being edited
  const handleContainerClick = (e: GestureResponderEvent) => {
    // Stop propagation to prevent the parent container's click handler from being triggered
    e.stopPropagation();

    // If another field is being edited, stop editing that field
    if (editingField !== null && editingField !== fieldId) {
      console.log(`Container clicked, canceling edit of ${editingField}`);
      handleEditEnd();
      return;
    }

    // If no field is being edited, start editing this field
    if (editingField === null) {
      console.log(`Container clicked, starting to edit ${fieldId}`);
      handleEditStart(fieldId);
    }
  };

  // Handle edit start for this field
  const handleFieldEditStart = () => {
    console.log(
      `Edit start for ${fieldId}, current editingField:`,
      editingField
    );

    // If another field is being edited, stop editing that field first
    if (editingField !== null && editingField !== fieldId) {
      console.log(
        `Canceling edit of ${editingField} before editing ${fieldId}`
      );
      handleEditEnd();
      // Return false to prevent immediate editing
      return false;
    }

    // Only try to start editing if no field is being edited
    if (editingField === null) {
      console.log(`No field being edited, starting to edit ${fieldId}`);
      return handleEditStart(fieldId);
    }

    // Already editing this field
    return true;
  };

  // Create a click handler for the entire field
  const handleFieldClick = (e: GestureResponderEvent) => {
    // Always stop propagation to prevent the parent container's click handler from being triggered
    e.stopPropagation();

    // If another field is being edited, stop editing that field
    if (editingField !== null && editingField !== fieldId) {
      console.log(`Field clicked, canceling edit of ${editingField}`);
      handleEditEnd();
      return;
    }

    // If no field is being edited, start editing this field
    if (editingField === null) {
      console.log(
        `No field being edited, starting to edit ${fieldId} from click`
      );
      handleEditStart(fieldId);
    }
  };

  // Log the state of the field
  console.log(`EditableField ${fieldId} render:`, {
    showUndo,
    hasUndoHandler: !!onUndo,
    isEditing,
    editingField,
    value,
    valueType: typeof value,
    valueLength: value?.length,
  });

  // Debug the undo functionality
  console.log(`DEBUG EditableField ${fieldId}: Undo state check:`, {
    showUndo,
    hasUndoHandler: !!onUndo,
    shouldShowUndoButton: showUndo && !!onUndo,
  });

  // Define keyboard handlers
  const keyboardHandlers = useKeyboardHandling({
    onEnter: (e: React.KeyboardEvent) => {
      e.preventDefault();
      handleEditEnd();
    },
    onEscape: (e: React.KeyboardEvent) => {
      e.preventDefault();
      if (onCancel) {
        onCancel();
      } else {
        handleEditEnd();
      }
    },
    onTab: (e: React.KeyboardEvent, direction: 'next' | 'prev') => {
      e.preventDefault();
      if (onTabNavigation) {
        onTabNavigation(direction);
      } else {
        handleEditEnd();
      }
    },
  });

  // Handle keyboard events for the input
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      // Log the key event for debugging
      console.log(`KeyDown event in field ${fieldId}, key:`, e.key);
      
      // Handle the key event
      keyboardHandlers(e as React.KeyboardEvent);
    },
    [fieldId, keyboardHandlers]
  );

  // Log key events for debugging in the web input component

  return (
    <YStack gap="$1">
      <XStack
        height={height}
        backgroundColor={isEditing ? activeColor : inactiveColor}
        borderRadius="$2"
        alignItems="center"
        justifyContent="center"
        padding="$4"
        onPress={handleContainerClick}
        // Add pressStyle for better visual feedback
        pressStyle={{ opacity: 0.8 }}
        // Add border color when there's an error
        borderColor={errorMessage ? '$red9' : 'transparent'}
        borderWidth={errorMessage ? 1 : 0}
      >
        {children ? (
          // If we have custom children, wrap them in a pressable container
          <XStack
            flex={1}
            alignItems="center"
            justifyContent="center"
            onPress={handleFieldClick}
          >
            {children}
          </XStack>
        ) : (
          <InlineEditable
            value={value}
            onChange={onChange}
            isEditing={isEditing}
            onEditStart={handleFieldEditStart}
            onEditEnd={handleEditEnd}
            placeholder={placeholder}
            showUndo={showUndo}
            onUndo={onUndo}
            /* Log the showUndo prop being passed to InlineEditable */
            id={`${fieldId}-inline-editable`}
            renderInput={({
              value,
              onChange,
              autoFocus,
              onSubmitEditing,
            }) => {
              const inputRef = useRef<TextInput>(null);

              if (Platform.OS === 'web') {
                return (
                  <div
                    style={{ flex: 1, display: 'flex' }}
                    tabIndex={tabIndex || 0}
                  >
                    <input
                      type="text"
                      value={value}
                      onChange={(e) => onChange(e.target.value)}
                      autoFocus={autoFocus}
                      style={{
                        flex: 1,
                        border: 'none',
                        outline: 'none',
                        padding: 0,
                        backgroundColor: 'transparent',
                        fontSize: 'inherit',
                        fontFamily: 'inherit',
                        color: 'inherit',
                      }}
                      placeholder={placeholder}
                      onKeyDown={handleKeyDown}
                      // Don't automatically end editing on blur
                      // This is key to prevent the regression where clicking on another field
                      // immediately makes it editable
                      onBlur={undefined}
                    />
                  </div>
                );
              }

              // For React Native
              return (
                <TextInput
                  ref={inputRef}
                  value={value}
                  onChangeText={onChange}
                  autoFocus={autoFocus}
                  style={{
                    flex: 1,
                    padding: 0,
                    color: 'inherit',
                  }}
                  placeholder={placeholder}
                  onSubmitEditing={() => {
                    console.log(`Submit editing in field ${fieldId}`);
                    handleEditEnd();
                    if (onSubmitEditing) onSubmitEditing();
                  }}
                  // Handle key events for React Native
                  onKeyPress={(e) => {
                    // When Escape is pressed, cancel editing without saving
                    if (e.nativeEvent.key === 'Escape') {
                      console.log(
                        `Escape pressed in field ${fieldId}, canceling edit (RN) - DIRECT HANDLING`
                      );
                      // ONLY call onCancel and NOT handleEditEnd
                      if (onCancel) {
                        onCancel();
                      } else {
                        // Fallback if onCancel not provided
                        handleEditEnd();
                      }
                      // Return early to prevent any other handlers
                      return;
                    }
                  }}
                  // Don't automatically end editing on blur
                  // This is key to prevent the regression where clicking on another field
                  // immediately makes it editable
                  onBlur={undefined}
                />
              );
            }}
          />
        )}
      </XStack>
      {errorMessage && isEditing && (
        <XStack gap="$2" alignItems="center">
          <Text color="$red10" fontSize="$2" flex={1}>
            {errorMessage}
          </Text>
          <Text
            color="$blue10"
            fontSize="$2"
            fontWeight="bold"
            onPress={() => {
              if (onCancel) onCancel();
            }}
            pressStyle={{ opacity: 0.7 }}
          >
            Cancel
          </Text>
        </XStack>
      )}
    </YStack>
  );
}
