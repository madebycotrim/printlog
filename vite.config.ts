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
  build: {
    target: "esnext",
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules")) {
            if (id.includes("react-dom") || id.includes("/react/") || id.includes("react-router-dom")) {
              return "vendor-react";
            }
            if (id.includes("firebase")) {
              return "vendor-firebase";
            }
            if (id.includes("recharts")) {
              return "vendor-charts";
            }
            if (id.includes("framer-motion")) {
              return "vendor-motion";
            }
            if (id.includes("lucide-react") || id.includes("sonner")) {
              return "vendor-ui";
            }
            if (id.includes("jspdf") || id.includes("html2canvas")) {
              return "vendor-pdf";
            }
            if (id.includes("zod")) {
              return "vendor-zod";
            }
          }
        },
      },
    },
  },
  server: {
    headers: {
      "Cross-Origin-Opener-Policy": "same-origin-allow-popups",
    },
    proxy: {
      "/api": {
        target: process.env.VITE_PROXY_TARGET || "https://www.printlog.com.br",
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
