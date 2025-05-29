import { defineConfig } from 'vite';
import viteReact from '@vitejs/plugin-react';
import { TanStackRouterVite } from '@tanstack/router-plugin/vite';
import { tamaguiExtractPlugin, tamaguiPlugin } from '@tamagui/vite-plugin';
import path from 'path';

export default defineConfig({
  plugins: [
    TanStackRouterVite({ autoCodeSplitting: true }),
    viteReact(),
    tamaguiPlugin({
      config: '@bbook/ui',
      components: ['tamagui'],
    }),
    tamaguiExtractPlugin({
      components: ['tamagui'],
    }),
  ],
  resolve: {
    alias: {
      'react-native': 'react-native-web',
    },
  },
  define: {
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
    'process.env.TAMAGUI_TARGET': JSON.stringify('web'),
    'process.env.EXPO_OS': JSON.stringify('web'),
  },
  optimizeDeps: {
    include: ['react-native-web'],
    esbuildOptions: {
      mainFields: ['module', 'main'],
      resolveExtensions: ['.web.js', '.js', '.ts', '.jsx', '.tsx'],
      loader: {
        '.js': 'jsx',
      },
    },
  },
});
