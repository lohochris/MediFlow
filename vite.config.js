// vite.config.js
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],  

  // DEV: keep your proxy for localhost
  server: {
    proxy: {
      "/auth": {
        target: "http://localhost:5000",
        changeOrigin: true,
        secure: false,
      },
      "/api": {
        target: "http://localhost:5000",
        changeOrigin: true,
        secure: false,
      }
    }
  },

  // BUILD SETTINGS FOR PRODUCTION (RENDER)
  build: {
    outDir: "dist",
  },

  // REQUIRED FOR RENDER STATIC HOSTING
  preview: {
    port: 4173,
    strictPort: true,
  }
});
