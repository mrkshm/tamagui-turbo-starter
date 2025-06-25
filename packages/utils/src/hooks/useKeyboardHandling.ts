import { useCallback } from 'react';

/**
 * Configuration for keyboard event handlers
 */
type KeyboardHandlers = {
  /** Handler for Enter key */
  onEnter?: (e: React.KeyboardEvent) => void;
  /** Handler for Escape key */
  onEscape?: (e: React.KeyboardEvent) => void;
  /** Handler for Tab key with direction */
  onTab?: (e: React.KeyboardEvent, direction: 'next' | 'prev') => void;
  /** Handler for ArrowUp key */
  onArrowUp?: (e: React.KeyboardEvent) => void;
  /** Handler for ArrowDown key */
  onArrowDown?: (e: React.KeyboardEvent) => void;
  /** Handler for ArrowLeft key */
  onArrowLeft?: (e: React.KeyboardEvent) => void;
  /** Handler for ArrowRight key */
  onArrowRight?: (e: React.KeyboardEvent) => void;
};

/**
 * Hook for handling keyboard events in a consistent way across components.
 * Returns an event handler function that can be passed to onKeyDown.
 *
 * @example
 * const handleKeyDown = useKeyboardHandling({
 *   onEnter: () => saveChanges(),
 *   onEscape: () => cancelEditing(),
 *   onTab: (direction) => navigateFields(direction)
 * });
 *
 * return <input onKeyDown={handleKeyDown} />;
 */
export function useKeyboardHandling(handlers: KeyboardHandlers) {
  return useCallback(
    (e: React.KeyboardEvent) => {
      // Handle keyboard events
      switch (e.key) {
        case 'Enter':
          e.preventDefault();
          e.stopPropagation();
          handlers.onEnter?.(e);
          break;

        case 'Escape':
          e.preventDefault();
          e.stopPropagation();
          handlers.onEscape?.(e);
          break;

        case 'Tab':
          // Only handle Tab if we have a handler for it
          if (handlers.onTab) {
            e.preventDefault();
            e.stopPropagation();
            const direction = e.shiftKey
              ? ('prev' as const)
              : ('next' as const);
            handlers.onTab(e, direction);
          }
          break;

        case 'ArrowUp':
          e.preventDefault();
          e.stopPropagation();
          if (handlers.onArrowUp) {
            handlers.onArrowUp(e);
          }
          break;

        case 'ArrowDown':
          e.preventDefault();
          e.stopPropagation();
          if (handlers.onArrowDown) {
            handlers.onArrowDown(e);
          }
          break;

        case 'ArrowLeft':
          e.preventDefault();
          e.stopPropagation();
          if (handlers.onArrowLeft) {
            handlers.onArrowLeft(e);
          }
          break;

        case 'ArrowRight':
          e.preventDefault();
          e.stopPropagation();
          if (handlers.onArrowRight) {
            handlers.onArrowRight(e);
          }
          break;

        default:
          // No special handling for other keys
          break;
      }
    },
    [handlers]
  );
}
