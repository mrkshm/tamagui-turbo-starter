import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import { afterEach, vi } from 'vitest';

// Mock timers
vi.useFakeTimers();

// Clean up after each test
afterEach(() => {
  cleanup();
  vi.clearAllMocks();
  vi.useRealTimers();
});
