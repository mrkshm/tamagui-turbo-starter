if (typeof window !== 'undefined') {
  (window as any).global = window;
  (window as any).expo = {
    AppOwnership: 'expo',
    Constants: {
      appOwnership: 'expo',
      executionEnvironment: 'storeClient',
      manifest: {
        extra: {
          storybookEnabled: false
        }
      }
    }
  };
}

export {};