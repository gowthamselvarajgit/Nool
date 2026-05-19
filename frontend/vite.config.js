import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // loadEnv reads .env, .env.[mode], .env.local — without the VITE_ prefix
  // requirement, so we can use BACKEND_TARGET here for the dev proxy without
  // exposing it to client code.
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [react()],
    server: {
      proxy: {
        // In dev, the SPA calls "/api/..." and Vite proxies to the backend.
        // Override BACKEND_TARGET in .env.local if your backend runs elsewhere.
        '/api': {
          target: env.BACKEND_TARGET || 'http://localhost:8083',
          changeOrigin: true,
        },
      },
    },
  }
})
