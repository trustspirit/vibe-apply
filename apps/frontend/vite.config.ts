import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  optimizeDeps: {
    include: ['@vibe-apply/shared'],
  },
  build: {
    commonjsOptions: {
      include: [/@vibe-apply\/shared/, /node_modules/],
      transformMixedEsModules: true,
    },
  },
});
