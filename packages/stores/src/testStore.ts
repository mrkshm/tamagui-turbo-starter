import { create } from 'zustand';

// A simple counter store for testing
interface TestStore {
  count: number;
  increment: () => void;
  decrement: () => void;
}

export const useTestStore = create<TestStore>((set) => ({
  count: 0,
  increment: () => set((state) => ({ count: state.count + 1 })),
  decrement: () => set((state) => ({ count: state.count - 1 })),
}));
