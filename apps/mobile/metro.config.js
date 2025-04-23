// Learn more [https://docs.expo.io/guides/customizing-metro](https://docs.expo.io/guides/customizing-metro)
const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

// Add this to ensure React DevTools is initialized before ExceptionsManager
const originalConsole = global.console;
if (__DEV__) {
  const noop = () => {};
  global.console = {
    ...originalConsole,
    error: noop,
    warn: noop,
    info: noop,
    debug: noop,
    log: noop,
  };
  setTimeout(() => {
    global.console = originalConsole;
  }, 100);
}

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, '../..');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(projectRoot, {
  isCSSEnabled: true,
});

// Expo 49 issue: default metro config needs to include "mjs"
// [https://github.com/expo/expo/issues/23180](https://github.com/expo/expo/issues/23180)
config.resolver.sourceExts.push('mjs');

// Add support for monorepo node_modules and packages
config.watchFolders = [
  path.resolve(workspaceRoot, 'node_modules'),
  path.resolve(workspaceRoot, 'packages'),
];
config.resolver.extraNodeModules = new Proxy({}, {
  get: (target, name) => path.join(workspaceRoot, 'node_modules', name)
});

module.exports = config;
