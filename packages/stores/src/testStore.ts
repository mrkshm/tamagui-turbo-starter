import { proxy } from 'valtio';

// A simple counter store for testing
export const testStore = proxy<{ count: number }>({
  count: 0,
});

// Example action to increment the counter
export const increment = () => {
  testStore.count += 1;
};

// Example action to decrement the counter
export const decrement = () => {
  testStore.count -= 1;
};
