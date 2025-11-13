import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
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
