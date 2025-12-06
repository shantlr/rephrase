/// <reference types="vitest/config" />

import { defineConfig } from 'vite';
import tsConfigPaths from 'vite-tsconfig-paths';
import { tanstackStart } from '@tanstack/react-start/plugin/vite';
import viteReact from '@vitejs/plugin-react';

export default defineConfig({
  server: {
    port: 3000,
  },
  test: {
    globals: true,
  },
  plugins: [
    tsConfigPaths(),
    tanstackStart({
      srcDirectory: './src',
      router: {
        routesDirectory: './app/routes',
        generatedRouteTree: './routeTree.gen.ts',
      },
    }),
    viteReact(),
  ],
});
