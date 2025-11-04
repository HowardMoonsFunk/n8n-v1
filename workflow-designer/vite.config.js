import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig(({ mode }) => ({
  plugins: [react()],
  server: {
    port: 3001,
    open: true,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'index.html'),
        powershell: mode === 'powershell' 
          ? path.resolve(__dirname, 'powershell.html')
          : path.resolve(__dirname, 'index.html'),
      },
    },
  },
}));
