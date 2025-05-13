# Inline Editable Field – Implementation Guide

## Overview

A simple, parent-controlled inline editable field component for Tamagui/React/React Native. Supports display and edit modes with a clean, minimalist approach that works reliably across platforms.

---

## Current Implementation

- **Parent-Controlled State**

  - The edit state is fully controlled by the parent component via the `isEditing` prop.
  - The parent decides when to enter and exit edit mode.

- **Display & Edit Modes**

  - In display mode, shows a simple text component with the current value.
  - In edit mode, shows an input field that allows typing.
  - Clicking on the text requests edit mode via the `onEditRequest` callback.

- **Optional Label**

  - If provided, the label is shown above the field.

- **Simple Value Management**

  - The field's value is controlled by the parent component (`value` and `onChange`).
  - Changes are tracked locally until saved.
  - The `onSave` callback notifies the parent when editing is complete.

- **Styling**

  - Uses Tamagui's styling system for consistent appearance.
  - Input has a fixed height to ensure it's not too small.
  - Text and input components use the same padding for visual consistency.

- **Accessibility**

  - Basic accessibility support with standard input and text components.
  - Autofoces the input when entering edit mode.

- **Simplicity First**
  - The component is intentionally minimal to ensure reliability across platforms.
  - No complex DOM interactions that could cause issues in React Native.
  - No overlay, validation, undo, or cancel features in the current implementation.

---

## Usage Pattern

- **Recommended Implementation**

  - Use a state variable in the parent to track which field is being edited.
  - Toggle the edit state when the user clicks on the field.
  - Update the actual data when editing is complete.

- **Keyboard Support**

  - Enter key submits the form via `onSubmitEditing`.
  - Focus is automatically applied to the input when edit mode is activated.

- **Styling**
  - The component uses minimal styling to be adaptable to different designs.
  - Height is explicitly set to ensure the input is properly sized.

---

## Practical Example

Here's how to use the component in a parent component:

```tsx
// In a parent component
const [isEditing, setIsEditing] = useState(false);
const [fieldValue, setFieldValue] = useState('Initial value');

// In the JSX
<CInlineEditableField
  value={fieldValue}
  onChange={setFieldValue}
  isEditing={isEditing}
  onEditRequest={() => setIsEditing(true)}
  onSave={(value) => {
    // Do any validation here
    // Update the actual data
    setFieldValue(value);
    setIsEditing(false);
  }}
  placeholder="Enter a value"
/>
```

## Alternative Approach

For simpler cases, you might prefer to use Tamagui components directly:

```tsx
const [isEditing, setIsEditing] = useState(false);
const [value, setValue] = useState('Initial value');

{isEditing ? (
  <Input
    value={value}
    onChangeText={setValue}
    onBlur={() => setIsEditing(false)}
    autoFocus
    height="$4"
  />
) : (
  <Text onPress={() => setIsEditing(true)}>
    {value || 'Click to edit'}
  </Text>
)}
```

---

## Current API/Props

```typescript
interface CInlineEditableFieldProps {
  /** The current value of the field */
  value: string;
  /** Callback when the value changes */
  onChange: (value: string) => void;
  /** Whether the field is in edit mode */
  isEditing?: boolean;
  /** Callback when edit mode is requested */
  onEditRequest?: () => void;
  /** Callback when the field should be saved */
  onSave?: (value: string) => void;
  /** Label to display above the field */
  label?: string;
  /** Placeholder text when the field is empty */
  placeholder?: string;
  /** Whether the field is disabled */
  disabled?: boolean;
  /** Whether the field is read-only */
  readOnly?: boolean;
  /** Additional class name for styling */
  className?: string;
  /** Additional styles */
  style?: React.CSSProperties;
}
```

---

## Current Interaction Flow

1. **Entering Edit Mode**

   - User clicks/taps the field.
   - Parent component sets `isEditing` to true.
   - Input field appears and receives focus.

2. **While Editing**

   - User types in the input field.
   - Local state tracks the current value.
   - No validation is performed in the component itself.

3. **Exiting Edit Mode**

   - User presses Enter or submits the form.
   - `onSave` callback is triggered with the current value.
   - Parent component sets `isEditing` to false.
   - Display mode shows the updated value.

---

## Future Enhancements

- **Validation Support**
  - Add optional validation with error display.
  - Support for both synchronous and asynchronous validation.

- **Undo/Cancel Support**
  - Add undo functionality after saving.
  - Add cancel option during editing.

- **Improved Accessibility**
  - Enhanced ARIA attributes and roles.
  - Better keyboard navigation support.

- **Styling Enhancements**
  - More customization options for different states.
  - Theme-aware styling for better integration.

## Note

The current implementation prioritizes reliability and cross-platform compatibility over advanced features. This approach ensures the component works consistently in both web and mobile environments without crashing or causing unexpected behavior.
