import { renderHook, act } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { useUndoableState } from '../use-undoable-state';

type UndoableState<T> = [
  T,
  (newValue: T | ((prev: T) => T)) => void,
  {
    undo: () => T;
    showUndo: boolean;
    previousValue: T;
  }
];

describe('useUndoableState', () => {
  // Mock timers
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useRealTimers();
  });

  it('should initialize with the initial value', () => {
    const { result } = renderHook(() => useUndoableState('initial'));
    const [value] = result.current;
    expect(value).toBe('initial');
  });

  it('should update the value', () => {
    const { result } = renderHook(() => useUndoableState('initial'));
    const current = result.current as UndoableState<string>;
    const [, setValue] = current;

    act(() => {
      setValue('updated');
    });

    const [value] = result.current as UndoableState<string>;
    expect(value).toBe('updated');
  });

  it('should store the previous value', () => {
    const { result } = renderHook(() => useUndoableState('initial'));
    const current = result.current as UndoableState<string>;
    const [, setValue, { previousValue: initialPrevValue }] = current;
    
    expect(initialPrevValue).toBe('initial');

    act(() => {
      setValue('updated');
    });

    const [, , { previousValue }] = result.current as UndoableState<string>;
    expect(previousValue).toBe('initial');
  });

  it('should show undo after update', () => {
    const { result } = renderHook(() => useUndoableState('initial'));
    const current = result.current as UndoableState<string>;
    const [, setValue] = current;

    act(() => {
      setValue('updated');
    });

    const [, , { showUndo }] = result.current as UndoableState<string>;
    expect(showUndo).toBe(true);
  });

  it('should hide undo after timeout', () => {
    const { result } = renderHook(() => useUndoableState('initial'));
    const current = result.current as UndoableState<string>;
    const [, setValue] = current;

    act(() => {
      setValue('updated');
    });

    // Fast-forward time
    act(() => {
      vi.advanceTimersByTime(5000);
    });

    const [, , { showUndo }] = result.current as UndoableState<string>;
    expect(showUndo).toBe(false);
  });

  it('should undo to previous value', () => {
    const { result } = renderHook(() => useUndoableState('initial'));
    const current = result.current as UndoableState<string>;
    const [, setValue] = current;

    act(() => {
      setValue('updated');
    });

    const [, , { undo }] = result.current as UndoableState<string>;
    
    act(() => {
      const previousValue = undo();
      expect(previousValue).toBe('initial');
    });

    const [value] = result.current as UndoableState<string>;
    expect(value).toBe('initial');
  });

  it('should clear timeout on unmount', () => {
    // Mock the global setTimeout and clearTimeout
    const originalSetTimeout = global.setTimeout;
    const originalClearTimeout = global.clearTimeout;
    
    const mockTimeoutId = 123;
    const mockSetTimeout = vi.fn(() => mockTimeoutId) as unknown as typeof global.setTimeout;
    const mockClearTimeout = vi.fn() as unknown as typeof global.clearTimeout;
    
    // Add the promisify property to match the Node.js type
    (mockSetTimeout as any).__promisify__ = originalSetTimeout.__promisify__;
    
    global.setTimeout = mockSetTimeout;
    global.clearTimeout = mockClearTimeout;

    const { result, unmount } = renderHook(() => useUndoableState('initial'));
    const current = result.current as UndoableState<string>;
    const [, setValue] = current;
    
    // Trigger a state update to set the timeout
    act(() => {
      setValue('updated');
    });
    
    // Verify setTimeout was called
    expect(mockSetTimeout).toHaveBeenCalled();
    
    unmount();

    // Expect clearTimeout to have been called with the correct ID
    expect(mockClearTimeout).toHaveBeenCalledWith(mockTimeoutId);
    
    // Restore the original functions
    global.setTimeout = originalSetTimeout;
    global.clearTimeout = originalClearTimeout;
  });

  it('should work with functional updates', () => {
    // Mock the global setTimeout and clearTimeout
    const originalSetTimeout = global.setTimeout;
    const originalClearTimeout = global.clearTimeout;
    
    const mockSetTimeout = vi.fn(() => 123) as unknown as typeof global.setTimeout;
    const mockClearTimeout = vi.fn() as unknown as typeof global.clearTimeout;
    
    // Add the promisify property to match the Node.js type
    (mockSetTimeout as any).__promisify__ = originalSetTimeout.__promisify__;
    
    global.setTimeout = mockSetTimeout;
    global.clearTimeout = mockClearTimeout;

    const { result } = renderHook(() => useUndoableState(0));
    const current = result.current as UndoableState<number>;
    const [, setValue] = current;

    act(() => {
      setValue((prev: number) => prev + 1);
    });

    const [value] = result.current as UndoableState<number>;
    expect(value).toBe(1);
    
    // Verify the timeout was set
    expect(mockSetTimeout).toHaveBeenCalled();
    
    // Restore the original functions
    global.setTimeout = originalSetTimeout;
    global.clearTimeout = originalClearTimeout;
  });
});
