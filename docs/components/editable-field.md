# Editable Field Components

A set of reusable components and hooks for implementing inline editable fields with undo functionality and keyboard navigation.

## Overview

The editable field system consists of several main parts:

1. `InlineEditable` - A low-level UI component for inline editing
2. `EditableField` - A higher-level component that wraps `InlineEditable` with common functionality
3. `useEditableFields` - A hook that manages the state for editable fields
4. `useFieldNavigation` - A hook that manages tab navigation between fields
5. `useFieldHandlers` - A hook that provides reusable handlers for undo and cancel operations

## Real-World Example

For a complete, well-commented implementation of editable fields using these hooks and components, see the `ProfileMain` component in `packages/app/components/profile/ProfileMain.tsx`. This component demonstrates how to:

- Set up multiple editable fields with proper tab navigation
- Handle field-specific undo and cancel operations
- Implement server-side saving with error handling
- Manage field values and validation states

## Components

### InlineEditable

A flexible inline editable text field component.

#### Props

```typescript
interface InlineEditableProps {
  // Core
  value: string;
  onChange: (value: string) => void;
  isEditing: boolean;
  onEditStart: (e?: React.MouseEvent, id?: string) => boolean | void;
  onEditEnd: () => void;

  // Undo functionality
  showUndo?: boolean;
  onUndo?: () => void;

  // Validation
  error?: string | null;

  // UI
  id?: string;
  label?: string;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;

  // Custom rendering
  renderDisplay?: (props: DisplayRendererProps) => React.ReactNode;
  renderInput?: (props: InputRendererProps) => React.ReactNode;
}
```

### EditableField

A higher-level component that provides common functionality for editable fields.

#### Props

```typescript
interface EditableFieldProps {
  // Core
  fieldId: string;
  value: string;
  onChange: (value: string) => void;
  isEditing: boolean;
  handleEditStart: (fieldId: string) => boolean;
  handleEditEnd: () => void;
  editingField: string | null;

  // Styling
  activeColor?: string;
  inactiveColor?: string;
  activeTextColor?: string;
  inactiveTextColor?: string;

  // Functionality
  placeholder?: string;
  height?: number | string;
  tabIndex?: number;
  onTabNavigation?: (direction: 'next' | 'prev') => void;
  showUndo?: boolean;
  onUndo?: () => void;
}
```

## Hooks

### useEditableFields

A hook that manages the state for editable fields, including which field is currently being edited, field values, and undo functionality.

```typescript
function useEditableFields(
  fieldIds: string[],
  options?: {
    initialValues?: Record<string, string>;
    onSave?: (fieldId: string, value: string) => Promise<void>;
  }
): {
  editingField: string | null;
  handleEditStart: (fieldName: string) => boolean;
  handleEditEnd: () => void;
  isEditing: (fieldName: string) => boolean;
  updateFieldValue: (fieldId: string, value: string) => void;
  saveField?: (fieldId: string) => Promise<void>;
  undoStates?: Record<
    string,
    {
      undo?: () => void;
      showUndo?: boolean;
      previousValue?: string;
      resetUndo?: () => void;
    }
  >;
  navigateToField: (fieldId: string, direction: 'next' | 'prev') => void;
  fieldValues?: Record<string, string>;
};
```

### useFieldNavigation

A hook that creates navigation functions for each field to handle tab navigation.

```typescript
function useFieldNavigation(
  navigateToField: (fieldId: string, direction: 'next' | 'prev') => void,
  fieldIds: string[]
): Record<string, (direction: 'next' | 'prev') => void>;
```

### useFieldHandlers

A hook that provides reusable handlers for undo and cancel operations for editable fields.

```typescript
function useFieldHandlers(
  fieldId: string,
  undoStates:
    | Record<string, { undo?: () => void; resetUndo?: () => void }>
    | undefined,
  saveField: ((fieldId: string) => Promise<void>) | undefined,
  originalHandleEditEnd: () => void
): {
  handleUndo: () => void;
  handleCancel: () => void;
};
```

## Usage Example

```tsx
import { EditableField } from '@bbook/app';
import {
  useEditableFields,
  useFieldNavigation,
  useFieldHandlers,
} from '@bbook/utils';

function ProfileForm() {
  // Define field IDs for navigation
  const fieldIds = ['firstName', 'lastName', 'email', 'bio'];

  // Setup the editable fields hook with initial values and save handler
  const {
    editingField,
    handleEditStart,
    handleEditEnd: originalHandleEditEnd,
    isEditing,
    updateFieldValue,
    saveField,
    undoStates,
    navigateToField,
    fieldValues,
  } = useEditableFields(fieldIds, {
    initialValues: {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      bio: 'Software developer',
    },
    onSave: handleSaveField,
  });

  // Define save handler for fields
  async function handleSaveField(fieldId: string, value: string) {
    try {
      // Save to server
      await api.updateUser({ [fieldId]: value });
      console.log(`Saved ${fieldId} with value: ${value}`);
    } catch (error) {
      console.error(`Error saving ${fieldId}:`, error);
    }
  }

  // Setup field navigation
  const navigationFunctions = useFieldNavigation(navigateToField, fieldIds);

  // Destructure the navigation functions for each field
  const {
    firstName: handleFirstNameTabNavigation,
    lastName: handleLastNameTabNavigation,
  } = navigationFunctions;

  // Use the field handlers hook for firstName
  const {
    handleUndo: handleFirstNameUndo,
    handleCancel: handleFirstNameCancel,
  } = useFieldHandlers(
    'firstName',
    undoStates,
    saveField,
    originalHandleEditEnd
  );

  return (
    <div>
      <EditableField
        fieldId="firstName"
        value={fieldValues?.firstName || ''}
        onChange={(value) => updateFieldValue('firstName', value)}
        isEditing={isEditing('firstName')}
        handleEditStart={handleEditStart}
        handleEditEnd={() => {
          saveField ? saveField('firstName') : originalHandleEditEnd();
        }}
        onCancel={handleFirstNameCancel}
        editingField={editingField}
        tabIndex={1}
        onTabNavigation={handleFirstNameTabNavigation}
        showUndo={!!undoStates?.firstName?.showUndo}
        onUndo={handleFirstNameUndo}
        placeholder="Enter your first name"
      />
      {/* More fields */}
    </div>
  );
}
```

## Features

- **Single Field Editing**: Only one field can be edited at a time
- **Undo Support**: Built-in undo functionality with server synchronization
- **Keyboard Navigation**: Tab between fields with proper focus management
- **Custom Styling**: Customize colors and appearance for active and inactive states
- **Validation**: Built-in error handling with clear feedback
- **Accessibility**: Proper ARIA attributes and keyboard support
- **Cross-Platform**: Works on both web and React Native
- **Modular Architecture**: Separate hooks for different concerns (editing, navigation, handlers)

## Best Practices

1. Always provide clear visual feedback when a field is being edited
2. Use the `useFieldHandlers` hook to standardize undo and cancel operations
3. Implement proper validation and display errors using the `errorMessage` prop
4. Use the `tabIndex` prop and `useFieldNavigation` hook to ensure proper keyboard navigation
5. Consider mobile users by making sure the edit controls are large enough to tap
6. Use the `saveField` function to persist changes to the server
7. Keep UI components focused on rendering and delegate logic to hooks
8. Use `React.memo()` to prevent unnecessary re-renders for complex components
