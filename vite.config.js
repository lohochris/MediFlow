// vite.config.js
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";

export default defineConfig({
  plugins: [react()],

  // ensure Vite copies everything inside /public into /dist
  publicDir: "public",

  // DEV: keep backend proxy working locally
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
      },
    },
  },

  // BUILD for Render deployment
  build: {
    outDir: "dist",
    rollupOptions: {
      input: {
        main: resolve(__dirname, "index.html"),
      },
    },
  },

  // Preview settings (optional)
  preview: {
    port: 4173,
    strictPort: true,
  },
});
