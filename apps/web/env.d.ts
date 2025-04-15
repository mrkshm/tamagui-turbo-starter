/// <reference types="vite/client" />

interface Window {
  global: any;
}

declare global {
  interface Window {
    global: any;
  }
  var global: any;
}

declare var globalThis: any;

export {};