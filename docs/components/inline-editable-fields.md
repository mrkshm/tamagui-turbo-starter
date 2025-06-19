# Editable Field Components

A set of reusable components and hooks for implementing inline editable fields with undo functionality and keyboard navigation.

## Overview

The editable field system consists of several main parts:

1. `InlineEditable` - A low-level UI component for inline editing
2. `EditableField` - A higher-level component that wraps `InlineEditable` with common functionality

- `EditableTextArea` – textarea-flavoured `EditableField`
- `FormField` – adds label / help / error chrome around any editable input
- `RenderFormField` – simple switch that delegates to a custom renderer based on field type

3. `useEditableForm` – top-level hook that orchestrates values, validation, undo state & save logic across the form
4. `useEditableFields` – helper for per-field state (still exported for granular use)
5. `useInlineEditHandlers` / `useFieldHandlers` – shared callbacks for undo / cancel / save
6. `useFieldNavigation` – keyboard navigation helpers

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

## Additional Hooks

### useEditableForm

A convenience wrapper around `useEditableFields` that bundles the most common concerns (validation, undo, save) into a single call. It returns everything you need to wire a dynamic form quickly:

```typescript
const {
  fieldValues,
  updateFieldValue,
  editingField,
  beginEdit,
  endEdit,
  saveField,
  undoStates,
  navigateToField,
} = useEditableForm(fieldIds, options);
```

### useInlineEditHandlers

Glue logic that combines undo, cancel and save behaviour for a specific field in one place. Used internally by `FormField` but exported for advanced cases.

## Component Registry Pattern

`RenderFormField` uses a simple registry map to decide which concrete component to render for a given `type`. Register your own with:

```ts
registerFormField('currency', CurrencyField);
```

## Real-world Usage – `ContactEditor`

See `packages/app/components/contacts/ContactEditor.tsx` for a compact example that leverages **all** building blocks (navigation, undo, textarea, validation) while staying under 200 LOC.

## Future Simplification Roadmap

While the current architecture is solid, we plan to flatten the API surface once the dust settles. Proposed steps:

1. **Merge handler hooks** – expose one `useEditableForm` that covers editing, navigation and handlers; keep the smaller hooks internal.
2. **Collapse UI wrappers** – combine `FormField` and `RenderFormField`; treat `inline`, `textarea`, & custom types as variants.
3. **Unify inline/plain variants** – fold `InlineEditable` into `EditableField` via a `variant` prop.
4. **Lean on TanStack Form** – evaluate migrating validation & state management to TanStack Form controllers to cut bespoke code.

These refactors will reduce conceptual overhead (~25 % fewer exports) without sacrificing flexibility.

## Usage Example

```tsx
import { EditableField } from '@bbook/app';
import {
  useEditableForm,
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
  } = useEditableForm(fieldIds, {
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
