import { useCallback } from 'react';

/**
 * Custom hook for handling editable field actions like undo and cancel
 * 
 * @param fieldId - The ID of the field being handled
 * @param undoStates - The undo states object from useEditableFields
 * @param saveField - The save field function from useEditableFields
 * @param originalHandleEditEnd - The original edit end handler from useEditableFields
 */
export const useFieldHandlers = (
  fieldId: string,
  undoStates: Record<string, { undo?: () => void; resetUndo?: () => void }> | undefined,
  saveField: ((fieldId: string) => Promise<void>) | undefined,
  originalHandleEditEnd: () => void
) => {
  // Handle undo action for a field
  const handleUndo = useCallback(() => {
    // Use optional chaining to safely call undo
    undoStates?.[fieldId]?.undo?.();
    
    // Save the restored value to the server if saveField is available
    saveField?.(fieldId).catch(error => 
      console.error(`Error saving ${fieldId} after undo:`, error)
    );
  }, [fieldId, undoStates, saveField]);

  // Handle cancel action for a field
  const handleCancel = useCallback(() => {
    // Undo changes if possible
    undoStates?.[fieldId]?.undo?.();
    
    // End editing
    originalHandleEditEnd();
  }, [fieldId, undoStates, originalHandleEditEnd]);

  return { handleUndo, handleCancel };
};
