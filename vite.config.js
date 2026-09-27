import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    target: 'es2020',
    cssCodeSplit: true,
    rollupOptions: {
      output: {
        // React und Animations-Bibliotheken in eigene, lange cachebare Chunks legen
        manualChunks: {
          react: ['react', 'react-dom'],
          motion: ['framer-motion', 'lenis'],
        },
      },
    },
  },
});
