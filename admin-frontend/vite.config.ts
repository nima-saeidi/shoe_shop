import { fileURLToPath, URL } from 'node:url'
import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  // Where the dev server proxies /api and /static (the FastAPI backend).
  const backend = env.VITE_PROXY_TARGET || 'http://localhost:8000'

  return {
    plugins: [react()],
    resolve: {
      alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
    },
    server: {
      port: 5173,
      proxy: {
        '/api': { target: backend, changeOrigin: true },
        '/static': { target: backend, changeOrigin: true },
      },
    },
  }
})
