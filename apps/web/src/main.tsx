import './polyfills.ts';
import { StrictMode } from 'react';
import ReactDOM from 'react-dom/client';
import { RouterProvider, createRouter } from '@tanstack/react-router';
import '@tamagui/core/reset.css';
import '@tamagui/font-inter/css/400.css';
import '@tamagui/font-inter/css/700.css';
import '@fontsource/jura/400.css';
import '@fontsource/jura/700.css';
import '@tamagui/polyfill-dev';
import { Provider } from '@bbook/app/provider';
import { config as tamaguiConfig } from '@bbook/ui';
// @ts-ignore
import { StyleSheet } from 'react-native-web';
import { initializeStorage, initializeErrorTracking } from '@bbook/data';
import { webStorageAdapter } from './lib/storage-adapter';
import { webErrorAdapter } from './lib/error-adapter';

// Import the generated route tree
import { routeTree } from './routeTree.gen';
import './styles.css';
import reportWebVitals from './reportWebVitals.ts';

// Initialize adapters
initializeStorage(webStorageAdapter);
initializeErrorTracking(webErrorAdapter);

// Setup Tamagui styles
if (typeof document !== 'undefined') {
  // @ts-ignore - react-native-web internal
  const rnwStyle = StyleSheet?.__getSheet?.();
  if (rnwStyle) {
    const style = document.createElement('style');
    style.id = rnwStyle.id;
    style.textContent = rnwStyle.textContent;
    document.head.appendChild(style);
  }

  // Add Tamagui CSS
  const tamaguiStyle = document.createElement('style');
  tamaguiStyle.textContent = tamaguiConfig.getCSS();
  document.head.appendChild(tamaguiStyle);
}

// Create a new router instance
const router = createRouter({
  routeTree,
  context: {},
  defaultPreload: 'intent',
  scrollRestoration: true,
  defaultStructuralSharing: true,
  defaultPreloadStaleTime: 0,
});

// Register the router instance for type safety
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

// Render the app
const rootElement = document.getElementById('app');
if (rootElement && !rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <StrictMode>
      <Provider>
        <RouterProvider router={router} />
      </Provider>
    </StrictMode>
  );
}

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
