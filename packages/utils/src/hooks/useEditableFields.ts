import { useState, useCallback, useMemo, useRef, useEffect } from 'react';

/**
 * Type for the direction of field navigation
 */
export type NavigationDirection = 'next' | 'prev';

/**
 * Type for undo state of a field
 */
export type UndoState<T> = {
  showUndo: boolean;
  previousValue: T;
  undo: () => T; // Return the previous value when undoing
  resetUndo: () => void;
};

/**
 * Base return type with navigation and editing functionality
 */
export type EditableFieldsBaseReturn = {
  editingField: string | null;
  handleEditStart: (fieldName: string) => boolean;
  handleEditEnd: () => void;
  isEditing: (fieldName: string) => boolean;
  handleTabNavigation: (nextFieldId: string) => boolean;
  navigateToField: (fieldId: string, direction: NavigationDirection) => void;
};

/**
 * Additional return properties when values are provided
 */
export type EditableFieldsValuesReturn<T> = {
  fieldValues: Record<string, T>;
  updateFieldValue: (fieldId: string, value: T) => void;
  undoStates: Record<string, UndoState<T>>;
};

/**
 * Options that can be passed to useEditableFields
 */
export type EditableFieldsOptions<T> = {
  initialValues?: Record<string, T>;
  onSave?: (fieldId: string, value: T) => Promise<void>;
};

// Define function overloads for different parameter combinations

/**
 * Hook for managing editable fields - basic version with just field IDs
 */
export function useEditableFields(
  fieldIdsOrOptions?: string[] | undefined
): EditableFieldsBaseReturn;

/**
 * Hook for managing editable fields - with options object
 */
export function useEditableFields<T = string>(
  fieldIdsOrOptions: EditableFieldsOptions<T>
): EditableFieldsBaseReturn &
  EditableFieldsValuesReturn<T> & {
    saveField?: (fieldId: string) => Promise<void>;
  };

/**
 * Hook for managing editable fields - with field IDs and separate options
 */
export function useEditableFields<T = string>(
  fieldIdsOrOptions: string[],
  initialValuesOrOptions: EditableFieldsOptions<T>
): EditableFieldsBaseReturn &
  EditableFieldsValuesReturn<T> & {
    saveField?: (fieldId: string) => Promise<void>;
  };

/**
 * Hook for managing editable fields - traditional style with separate parameters
 */
export function useEditableFields<T = string>(
  fieldIdsOrOptions: string[],
  initialValuesOrOptions: Record<string, T>,
  onSaveParam?: (fieldId: string, value: T) => Promise<void>
): EditableFieldsBaseReturn &
  EditableFieldsValuesReturn<T> & {
    saveField?: (fieldId: string) => Promise<void>;
  };

/**
 * Implementation of the useEditableFields hook.
 */
export function useEditableFields<T = string>(
  fieldIdsOrOptions?: string[] | EditableFieldsOptions<T> | undefined,
  initialValuesOrOptions?:
    | Record<string, T>
    | EditableFieldsOptions<T>
    | undefined,
  onSaveParam?: ((fieldId: string, value: T) => Promise<void>) | undefined
): any {
  // Handle different parameter combinations
  let fieldIds: string[] | undefined;
  let initialValues: Record<string, T> | undefined;
  let onSave: ((fieldId: string, value: T) => Promise<void>) | undefined;

  // Case 1: First parameter is an options object
  if (
    fieldIdsOrOptions &&
    typeof fieldIdsOrOptions === 'object' &&
    !Array.isArray(fieldIdsOrOptions)
  ) {
    // Options object style: useEditableFields({ initialValues, onSave })
    const options = fieldIdsOrOptions as EditableFieldsOptions<T>;
    initialValues = options.initialValues;
    onSave = options.onSave;
    fieldIds = undefined;
  }
  // Case 2: First parameter is field IDs array, second is options object
  else if (
    Array.isArray(fieldIdsOrOptions) &&
    initialValuesOrOptions &&
    typeof initialValuesOrOptions === 'object' &&
    !Array.isArray(initialValuesOrOptions) &&
    ('initialValues' in initialValuesOrOptions ||
      'onSave' in initialValuesOrOptions)
  ) {
    // Field IDs + options object: useEditableFields(['firstName', ...], { initialValues, onSave })
    fieldIds = fieldIdsOrOptions;
    const options = initialValuesOrOptions as EditableFieldsOptions<T>;
    initialValues = options.initialValues;
    onSave = options.onSave;
  }
  // Case 3: Traditional style with separate parameters
  else {
    fieldIds = fieldIdsOrOptions as string[] | undefined;
    initialValues = initialValuesOrOptions as Record<string, T> | undefined;
    onSave = onSaveParam;
  }
  // State to track which field is currently being edited
  const [editingField, setEditingField] = useState<string | null>(null);

  // Create a single state for all field values
  const [values, setValues] = useState<Record<string, T>>(initialValues || {});

  // Create a ref to track previous values for undo functionality
  const previousValuesRef = useRef<Record<string, T>>({});

  // Create a ref to track undo timeouts
  const undoTimeoutsRef = useRef<Record<string, NodeJS.Timeout>>({});

  // Track which fields have undo available
  const [undoableFields, setUndoableFields] = useState<Record<string, boolean>>(
    {}
  );

  // Debug logging for undoable fields
  useEffect(() => {
    console.log('Undoable fields state updated:', undoableFields);
  }, [undoableFields]);

  // We don't need a separate fieldValues variable since we're using values directly in the return value

  // Function to undo a field value
  const undoFieldValue = useCallback(
    (fieldId: string): T => {
      if (!initialValues) return values[fieldId] as T;

      // Get the original value for this field
      const originalValue = previousValuesRef.current[fieldId];

      if (originalValue !== undefined) {
        console.log(`Undoing changes to ${fieldId}:`, originalValue);
        setValues((prev) => ({
          ...prev,
          [fieldId]: originalValue,
        }));

        // Reset the undo state
        setUndoableFields((prev) => ({
          ...prev,
          [fieldId]: false,
        }));

        // Clear the timeout
        if (undoTimeoutsRef.current[fieldId]) {
          clearTimeout(undoTimeoutsRef.current[fieldId]);
          delete undoTimeoutsRef.current[fieldId]; // Use delete instead of setting to null
        }

        // Make a network call to save the original value if onSave is provided
        if (onSave) {
          console.log(
            `Making network call to save undone value for ${fieldId}:`,
            originalValue
          );
          onSave(fieldId, originalValue).catch((error) => {
            console.error(`Error saving undone value for ${fieldId}:`, error);
          });
        }

        // Return the previous value to allow for chaining
        return originalValue;
      }

      // If no original value, return the current value
      return values[fieldId] as T;
    },
    [initialValues, values, onSave]
  );

  // Debug logging for undoable fields state changes
  useEffect(() => {
    console.log('Undoable fields state updated:', undoableFields);
  }, [undoableFields]);

  // Calculate the undo states based on the current values and previous values
  const undoStates = useMemo(() => {
    if (!initialValues) {
      return {};
    }

    // Create a new object to hold the undo states for each field
    const result: Record<string, UndoState<T>> = {};

    // Get the field IDs from the fieldIds prop or from initialValues
    const fieldsToProcess = fieldIds || Object.keys(initialValues);

    // Process each field
    fieldsToProcess.forEach((fieldId) => {
      // We only need to use the undoableFields state and previousValuesRef for the undo functionality

      // We no longer need to compare string values here since we're using undoableFields state

      // Check if the current value is different from the original value
      // We don't need to calculate this here since we're using undoableFields state
      // to determine if the undo button should show

      // Calculate if we should show the undo button
      // IMPORTANT: Only use undoableFields state to determine if undo button should show
      // This ensures the timeout can properly control the visibility
      const showUndo = undoableFields[fieldId];

      // Create the undo state object for this field
      result[fieldId] = {
        // Use the calculated showUndo value
        showUndo: showUndo,
        // Use the stored original value, or fall back to the initial value
        previousValue:
          previousValuesRef.current[fieldId] || initialValues[fieldId],
        // Function to undo changes to this field
        undo: () => undoFieldValue(fieldId),
        // Function to reset the undo state for this field
        resetUndo: () => {
          setUndoableFields((prev) => ({
            ...prev,
            [fieldId]: false,
          }));
          // We don't delete the previous value here to maintain undo functionality
          // after saving. Instead, we'll update it when explicitly told to do so.
          console.log(`Reset undo state for ${fieldId}`);
        },
      };
    });

    return result;
  }, [initialValues, undoFieldValue, undoableFields, values]);

  // Update a field value (only if initialValues is provided)
  const updateFieldValue = useCallback(
    (fieldId: string, value: T) => {
      if (!initialValues) {
        console.log('Cannot update field value - no initialValues provided');
        return;
      }

      console.log(`updateFieldValue: Updating field ${fieldId} to:`, value);

      // Get the initial value for this field
      const initialValue = initialValues[fieldId];

      // Get the original value that was stored when editing started
      const originalValue = previousValuesRef.current[fieldId];

      // Force string comparison to avoid type issues
      const newValueStr = String(value);
      const originalValueStr = originalValue
        ? String(originalValue)
        : String(initialValue);

      // Check if the current value is different from the original value
      // This is what determines if we should show the undo button
      const isDifferent = newValueStr !== originalValueStr;

      console.log(`updateFieldValue: Comparison for ${fieldId}:`, {
        newValue: value,
        newValueStr,
        originalValue,
        originalValueStr,
        isDifferent,
        undoableFieldsState: undoableFields[fieldId],
      });

      // Always update the undoable state based on the comparison
      console.log(`Setting undoable state for ${fieldId} to ${isDifferent}`);
      setUndoableFields((prev) => ({
        ...prev,
        [fieldId]: isDifferent,
      }));

      // Only set up the timeout if the value is different
      if (isDifferent) {
        // Add a timeout to hide the undo button after 5 seconds
        // Clear any existing timeout for this field
        if (undoTimeoutsRef.current[fieldId]) {
          clearTimeout(undoTimeoutsRef.current[fieldId]);
          delete undoTimeoutsRef.current[fieldId]; // Always be cleaning up
        }

        // Set a new timeout
        console.log(
          `Setting timeout to hide undo button for ${fieldId} in 2 seconds`
        );
        undoTimeoutsRef.current[fieldId] = setTimeout(() => {
          console.log(`Timeout triggered: hiding undo button for ${fieldId}`);
          // Hide the undo button after 5 seconds
          setUndoableFields((prev) => ({
            ...prev,
            [fieldId]: false,
          }));

          // Clean up the timeout reference
          delete undoTimeoutsRef.current[fieldId];
        }, 5000);
      }

      // Now update the undoable state based on the comparison

      // Update the value first, before updating the undoable state
      // This ensures the value is updated before we check if it's different
      setValues((prev) => {
        const newValues = {
          ...prev,
          [fieldId]: value,
        };
        console.log(`updateFieldValue: New values after update:`, newValues);

        // Don't set undoable state here - we already did it above
        // This was causing the timeout to be reset and never trigger

        return newValues;
      });

      // We've already set the undoable state above, don't set it again here
      // This was causing the timeout to never trigger properly
      console.log(
        `updateFieldValue: Undo state for ${fieldId} already set to:`,
        isDifferent
      );
    },
    [initialValues, undoableFields, values]
  );

  // Save a field value (only if onSave is provided)
  const saveField = useCallback(
    (fieldId: string) => {
      console.log('saveField called with:', {
        fieldId,
        onSaveExists: !!onSave,
        valuesExists: !!values,
        initialValuesExists: !!initialValues,
        onSaveType: typeof onSave,
      });

      if (!onSave || !values || !initialValues) {
        console.error('Cannot save field - missing required values:', {
          onSave: !!onSave,
          values: !!values,
          initialValues: !!initialValues,
        });
        return;
      }

      // Check if the value has changed
      const hasChanged = values[fieldId] !== initialValues[fieldId];

      console.log(`saveField called for ${fieldId}`, {
        currentValue: values[fieldId],
        initialValue: initialValues[fieldId],
        hasChanged,
        hasUndoState: !!undoableFields[fieldId],
        onSaveType: typeof onSave,
        onSaveFunction: onSave.toString().substring(0, 100), // Show part of the function for debugging
      });

      // Only save if the value has changed
      if (hasChanged) {
        // If the value has changed, save it
        if (values[fieldId] !== initialValues[fieldId]) {
          console.log(`Saving field ${fieldId} with value:`, values[fieldId]);

          // Log the state before saving
          console.log(`SAVE FIELD: Before saving ${fieldId}:`, {
            currentValue: values[fieldId],
            originalValue: previousValuesRef.current[fieldId],
            hasOriginalValue: !!previousValuesRef.current[fieldId],
          });

          // Call the save handler
          console.log(
            `About to call onSave for ${fieldId} with value:`,
            values[fieldId]
          );

          // Call the save handler and handle promise
          onSave(fieldId, values[fieldId])
            .then(() => {
              console.log(`Successfully saved field ${fieldId}`);

              // Log the state after saving but before clearing
              console.log(
                `SAVE FIELD: After saving ${fieldId} (before clearing):`,
                {
                  originalValue: previousValuesRef.current[fieldId],
                  hasOriginalValue: !!previousValuesRef.current[fieldId],
                }
              );

              // Clear the editing field
              setEditingField(null);

              // Reset the undo state
              setTimeout(() => {
                setUndoableFields((prev) => {
                  const newState = {
                    ...prev,
                    [fieldId]: false,
                  };
                  console.log(
                    `Hiding undo button for ${fieldId} after timeout`
                  );
                  return newState;
                });
              }, 2000); // Keep undo button visible for 2 seconds after save

              // CRITICAL FIX: Update the previous value to the new saved value
              // This ensures that future edits will be compared against the new value
              // previousValuesRef.current[fieldId] = values[fieldId];
              // console.log(
              //   `Updated original value for ${fieldId} after save:`,
              //   values[fieldId]
              // );
            })
            .catch((error) => {
              console.error(`Error saving field ${fieldId}:`, error);
              // Keep editing on error
            });
        }
      } else {
        // No changes, just clear the editing field
        console.log(`No changes to save for ${fieldId}`);
        setEditingField(null);

        // Also reset any undo state that might exist
        if (undoableFields[fieldId]) {
          console.log(`Cleaning up unnecessary undo state for ${fieldId}`);
          setUndoableFields((prev) => ({
            ...prev,
            [fieldId]: false,
          }));
          delete previousValuesRef.current[fieldId];
        }
      }
    },
    [onSave, values, initialValues, undoableFields]
  );

  // Handler for starting edit mode
  const handleEditStart = useCallback(
    (fieldName: string) => {
      // 1. If we're already editing this field, nothing to do.
      if (editingField === fieldName) {
        console.log(`Already editing ${fieldName}`);
        return true;
      }

      // 2. If another field is being edited, close it and ask caller to retry.
      if (editingField !== null && editingField !== fieldName) {
        console.log(
          `Field ${editingField} currently editing. Closing it before ${fieldName} can start.`
        );
        setEditingField(null);
        return false; // caller will need a second tap
      }

      // 3. Begin editing the requested field.
      console.log(`Starting edit of ${fieldName}`);

      if (initialValues) {
        const originalValue = values[fieldName];
        previousValuesRef.current[fieldName] = originalValue;
        setUndoableFields((prev) => ({
          ...prev,
          [fieldName]: false,
        }));
      }

      setEditingField(fieldName);
      return true;
    },
    [editingField, initialValues, values]
  );

  // Handler for ending edit mode
  const handleEditEnd = useCallback(() => {
    console.log(`Ending edit of ${editingField}`);
    setEditingField(null);
  }, [editingField]);

  // Helper to check if a specific field is being edited
  const isEditing = useCallback(
    (fieldName: string) => editingField === fieldName,
    [editingField]
  );

  // Special handler for tab navigation between fields
  // This bypasses the normal checks to ensure we can switch fields directly
  const handleTabNavigation = useCallback(
    (nextFieldId: string) => {
      console.log(
        `Tab navigation: switching directly from ${editingField} to ${nextFieldId}`
      );
      // Directly set the next field as editable without checking current state
      setEditingField(nextFieldId);
      return true;
    },
    [editingField]
  );

  // Navigate to a field by direction (next or previous)
  const navigateToField = useCallback(
    (fieldId: string, direction: NavigationDirection) => {
      // If no fieldIds were provided, we can't navigate
      if (!fieldIds || fieldIds.length === 0) {
        console.log('No field IDs provided for navigation');
        return;
      }

      console.log(`Navigating from ${fieldId}, direction: ${direction}`);

      // Find the current field index
      const currentIndex = fieldIds.indexOf(fieldId);
      if (currentIndex === -1) {
        console.log(`Field ${fieldId} not found in fieldIds`);
        return;
      }

      // Calculate the next field index based on direction
      let nextIndex =
        direction === 'next' ? currentIndex + 1 : currentIndex - 1;

      // Wrap around if needed
      if (nextIndex < 0) nextIndex = fieldIds.length - 1;
      if (nextIndex >= fieldIds.length) nextIndex = 0;

      // Get the next field ID
      const nextFieldId = fieldIds[nextIndex];
      console.log(`Navigating to field: ${nextFieldId}`);

      // Use handleTabNavigation to directly switch to the next field
      handleTabNavigation(nextFieldId);
    },
    [fieldIds, handleTabNavigation]
  );

  // Add cleanup effect for timeouts when component unmounts
  useEffect(() => {
    return () => {
      // Clear all timeouts
      Object.keys(undoTimeoutsRef.current).forEach((fieldId) => {
        clearTimeout(undoTimeoutsRef.current[fieldId]);
      });
      // Reset the timeouts ref
      undoTimeoutsRef.current = {};
    };
  }, []);

  // Create the base return object with required values
  const returnValue = {
    editingField,
    handleEditStart,
    handleEditEnd,
    isEditing,
    handleTabNavigation,
    navigateToField,
    undoableFields, // Expose the undoableFields state directly for better undo button control
  };

  // Only add optional values if they're available
  if (initialValues) {
    Object.assign(returnValue, {
      fieldValues: values, // Use the values state as fieldValues
      updateFieldValue,
      undoStates,
    });

    if (onSave) {
      Object.assign(returnValue, {
        saveField,
      });
    }
  }

  return returnValue;
}
