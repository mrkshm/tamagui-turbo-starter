import { useCallback } from 'react';

/**
 * Hook to handle inline editing interactions
 * 
 * @param fieldId - The ID of the field being edited
 * @param isEditing - Whether the field is currently being edited
 * @param isAnyFieldEditing - Function to check if any field is being edited
 * @param onEditStart - Callback to start editing the field
 * @param onEditEnd - Callback to end editing
 * 
 * @returns An object with click and key down handlers
 */
export function useInlineEditHandlers<T extends string>(
  fieldId: T,
  isEditing: boolean,
  isAnyFieldEditing: (id: T) => boolean,
  onEditStart: (id: T) => boolean,
  onEditEnd: () => void
) {
  /**
   * Handle click events on the field
   */
  const handleFieldClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    
    // If already editing this field, do nothing
    if (isEditing) {
      return;
    }

    // If another field is being edited, cancel it first
    if (isAnyFieldEditing(fieldId)) {
      onEditEnd();
    }

    // Start editing the requested field
    onEditStart(fieldId);
  }, [fieldId, isEditing, isAnyFieldEditing, onEditStart, onEditEnd]);

  /**
   * Handle key down events (e.g., Escape to cancel)
   */
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Escape' && isEditing) {
      e.stopPropagation();
      onEditEnd();
    }
  }, [isEditing, onEditEnd]);

  return {
    handleFieldClick,
    handleKeyDown,
    // Common props to spread onto field elements
    fieldProps: {
      'data-editable-field': fieldId,
      onClick: handleFieldClick,
      onKeyDown: handleKeyDown,
    },
  };
}
