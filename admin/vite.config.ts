import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  // The JSON API and the Passport OAuth server are the same Laravel app, so the
  // dev proxy must target the same backend the frontend authenticates against.
  // Falls back to the conventional local port when no backend URL is configured.
  const apiTarget = env.VITE_OAUTH_BASE_URL || 'http://127.0.0.1:8000';

  return {
    plugins: [react(), tailwindcss()],
    server: {
      proxy: {
        '/api': {
          target: apiTarget,
          changeOrigin: true,
          secure: false,
        },
      },
    },
  };
});
