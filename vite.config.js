import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  optimizeDeps: {
    include: ['jszip']
  },
  build: {
    rollupOptions: {
      external: [] // Ensure it's not treated as external
    }
  }
})