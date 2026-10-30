import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, './src'),
    },
  },
  server: {
    port: 5001,
    proxy: {
      '/api': {
        target: 'http://localhost:5002',
        changeOrigin: true,
      },
      '/inventory': {
        target: 'http://localhost:5002',
        changeOrigin: true,
      },
    },
  },
})
