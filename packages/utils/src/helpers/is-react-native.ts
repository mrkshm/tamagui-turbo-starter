// If U ever need to run shared code in Node.js
// (e.g., SSR, CLI tools), this check probably needs
// to be changes since it will also return true in Node.js
// export function isReactNative(): boolean {
//   return typeof window === 'undefined' || typeof document === 'undefined';
// }

// since refactored to this:
declare const global: any;

export function isReactNative(): boolean {
  return (
    typeof global === 'object' &&
    typeof global.__BUNDLE_START_TIME__ !== 'undefined'
  );
}
