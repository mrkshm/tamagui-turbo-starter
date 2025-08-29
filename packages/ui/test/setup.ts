import '@testing-library/jest-dom';
import { afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';

declare global {
  interface Window {
    ResizeObserver: typeof ResizeObserver;
  }
}

// Mock window.matchMedia which is not implemented in JSDOM
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock ResizeObserver which is not available in JSDOM
class ResizeObserver {
  // @ts-ignore - We don't need the implementation in tests
  observe(_target: Element, _options?: ResizeObserverOptions): void {}
  // @ts-ignore - We don't need the implementation in tests
  unobserve(_target: Element): void {}
  // @ts-ignore - We don't need the implementation in tests
  disconnect(): void {}
}

window.ResizeObserver = ResizeObserver;

// Runs a cleanup after each test case
// (e.g. clearing jsdom)
afterEach(() => {
  cleanup();
});
