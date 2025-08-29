/// <reference types="vite/client" />

declare global {
  interface Window {
    global: any;
  }
  // Provide a global alias if needed by libraries expecting Node's `global`
  const global: any;
}

export {};