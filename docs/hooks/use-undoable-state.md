# useUndoableState Hook

A custom React hook that provides undo functionality for state values with a timeout-based undo feature. This hook is particularly useful for implementing "Undo" functionality in forms, editors, or any interface where users might want to revert their changes.

## Features

- Maintains current and previous state values
- Provides a simple API for updating state with built-in undo support
- Includes a timeout to automatically hide the undo option
- Supports both direct values and functional updates
- Handles cleanup of timeouts on component unmount

## Installation

This hook is part of the `@bbook/utils` package. Make sure it's installed in your project:

```bash
pnpm add @bbook/utils
```

## API

### Parameters

- `initialValue` (`T`): The initial value for the state.

### Return Value

Returns an array with the following elements:

1. `value` (`T`): The current state value.
2. `setValue` (`(newValue: T | ((prev: T) => T)) => void`): A function to update the state. Can accept either a direct value or an updater function.
3. `{ undo, showUndo, previousValue }` (object): An object containing:
   - `undo: () => T`: A function to revert to the previous state. Returns the previous value.
   - `showUndo: boolean`: A boolean indicating if the undo option should be shown.
   - `previousValue: T`: The previous state value before the last update.

## Usage Example

```tsx
import { useUndoableState } from '@bbook/utils/hooks/use-undoable-state';

function EditableField({ initialValue, onSave }) {
  const [value, setValue, { undo, showUndo, previousValue }] = useUndoableState(initialValue);
  const [isEditing, setIsEditing] = useState(false);

  const handleSave = () => {
    onSave(value);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setValue(initialValue);
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <div>
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
        />
        <button onClick={handleSave}>Save</button>
        <button onClick={handleCancel}>Cancel</button>
        {showUndo && (
          <button onClick={undo}>Undo</button>
        )}
      </div>
    );
  }

  return (
    <div onClick={() => setIsEditing(true)}>
      {value}
    </div>
  );
}
```

## Behavior

1. **State Updates**: When `setValue` is called, the hook:
   - Stores the current value as the previous value
   - Updates the current value
   - Shows the undo option for 5 seconds

2. **Undo**: When `undo` is called, the hook:
   - Reverts to the previous value
   - Hides the undo option
   - Clears any pending timeout

3. **Timeout**: The undo option is automatically hidden after 5 seconds. This duration is currently hardcoded but could be made configurable if needed.

4. **Cleanup**: The hook cleans up any pending timeouts when the component unmounts.

## Best Practices

1. **User Feedback**: Always provide visual feedback when the undo option is available.
2. **Accessibility**: Ensure the undo action is keyboard accessible and has appropriate ARIA attributes.
3. **Mobile Consideration**: On touch devices, consider swipe gestures for undo actions.
4. **Performance**: For large state objects, consider using a more sophisticated state management solution.

## Testing

The hook is thoroughly tested with the following test cases:

- Initial state setup
- State updates (direct and functional)
- Previous value storage
- Undo functionality
- Timeout behavior
- Cleanup on unmount

To run the tests:

```bash
cd packages/utils
pnpm test
```

## TypeScript Support

The hook is fully typed with TypeScript and includes JSDoc comments for better IDE support.

## Contributing

If you'd like to contribute to this hook, please ensure all tests pass and add new tests for any additional functionality.

## License

This hook is part of the Turbobook project and is available under the project's license.
