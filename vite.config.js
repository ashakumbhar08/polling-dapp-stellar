import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    global: 'globalThis',
  },
  resolve: {
    alias: {
      buffer: resolve(__dirname, 'node_modules/buffer/'),
    },
  },
  optimizeDeps: {
    include: ['buffer'],
  },
})
