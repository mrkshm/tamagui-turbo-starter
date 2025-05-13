import { useState, useRef, useCallback, useEffect } from 'react';

/**
 * A custom hook that provides undo functionality for state values.
 * @template T The type of the state value
 * @param {T} initialValue The initial value of the state
 * @returns {[
 *   T,
 *   (newValue: T | ((prev: T) => T)) => void,
 *   {
 *     undo: () => void;
 *     showUndo: boolean;
 *     previousValue: T;
 *     resetUndo: () => void;
 *   }
 * ]} An array containing:
 *   - The current value
 *   - A function to update the value with undo support
 *   - An object with undo utilities including undo and resetUndo functions
 */
export function useUndoableState<T>(initialValue: T) {
  const [value, setValue] = useState(initialValue);
  const [previousValue, setPreviousValue] = useState(initialValue);
  const [showUndo, setShowUndo] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  /**
   * Updates the state value with undo support.
   * 
   * The key improvement in this implementation is that it only captures
   * the previous value when the undo button is not showing. This ensures
   * that we keep the original value from before the edit session started,
   * rather than just capturing the last keystroke.
   * 
   * For example, if the original value is 'hello' and the user types 'hello world',
   * clicking undo will restore 'hello', not 'hello worl' (which would happen if
   * we captured the previous value on every keystroke).
   */
  const setWithUndo = useCallback(
    (newValue: T | ((prev: T) => T)) => {
      // Only update previousValue if undo button is not showing
      // This ensures we keep the original value for undo, not just the last keystroke
      if (!showUndo) {
        setPreviousValue(value);
      }
      
      setValue(newValue);
      setShowUndo(true);

      // Clear any existing timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      // Set new timeout
      timeoutRef.current = setTimeout(() => {
        setShowUndo(false);
      }, 5000);
    },
    [value, showUndo]
  );

  const undo = useCallback(() => {
    setValue(previousValue);
    setShowUndo(false);
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    return previousValue;
  }, [previousValue]);

  /**
   * Resets the undo functionality, hiding the undo button and clearing any timeouts.
   * This is useful when canceling an edit operation.
   */
  const resetUndo = useCallback(() => {
    setShowUndo(false);
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return [value, setWithUndo, { undo, showUndo, previousValue, resetUndo }];
}
