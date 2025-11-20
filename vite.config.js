// vite.config.js
import { defineConfig } from 'vite';
export default defineConfig({
  server: {
    proxy: {
      // Proxy all /auth requests to backend
      '/auth': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path, // optional
      },
      // proxy other api paths if needed:
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
      }
    }
  }
});
