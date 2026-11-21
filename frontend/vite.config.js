import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath, URL } from 'node:url'
import { readFileSync } from 'node:fs'

// `vite preview` sends the same security headers Vercel will, so a build can
// be checked locally before it ships
const vercelHeaders = Object.fromEntries(
  JSON.parse(readFileSync(new URL('./vercel.json', import.meta.url), 'utf8'))
    .headers.find((h) => h.source === '/(.*)').headers.map((h) => [h.key, h.value]),
)

export default defineConfig(({ mode }) => {
  // The dev server sends /api and /ws (live updates) to the Django API
  const env = loadEnv(mode, process.cwd(), '')
  const apiTarget = env.API_TARGET || 'http://localhost:8000'

  return {
    plugins: [react()],

    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },

    build: {
      outDir: 'dist',
      emptyOutDir: true,
      sourcemap: false,
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['react', 'react-dom', 'react-router-dom'],
            state:  ['zustand'],
          },
        },
      },
    },

    preview: {
      port: 4173,
      headers: vercelHeaders,
      proxy: {
        '/api': { target: apiTarget, changeOrigin: true },
        '/ws': { target: apiTarget, ws: true, changeOrigin: true },
      },
    },

    server: {
      port: 5173,
      headers: {
        'Cross-Origin-Opener-Policy': 'same-origin-allow-popups',
      },
      proxy: {
        '/api': {
          target: apiTarget,
          changeOrigin: true,
        },
        // Live class updates (Django Channels)
        '/ws': {
          target: apiTarget,
          ws: true,
          changeOrigin: true,
        },
      },
    },
  }
})
