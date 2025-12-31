import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import tailwindcss from '@tailwindcss/vite'
import path from 'path' // 1. Importe o path
import { fileURLToPath } from 'url' // 2. Importe para simular o __dirname

// 3. Defina o __dirname manualmente (necessário em sistemas ESM como o Vite)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      // Agora o "@" funcionará corretamente apontando para a pasta src
      "@": path.resolve(__dirname, "./src"),
    },
  },
})