import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@funcionalidades": path.resolve(__dirname, "./src/funcionalidades"),
      "@compartilhado": path.resolve(__dirname, "./src/compartilhado"),
      "@configuracoes": path.resolve(__dirname, "./src/configuracoes"),
      "@principal": path.resolve(__dirname, "./src/principal"),
      "@testes": path.resolve(__dirname, "./src/testes"),
    },
  },
  server: {
    proxy: {
      "/api": {
        target: process.env.VITE_PROXY_TARGET,
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
