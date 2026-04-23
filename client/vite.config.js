import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const backendUrl = process.env.VITE_BACKEND_URL || 'http://localhost:3000'
const backendWs = backendUrl.replace(/^http/, 'ws')

const hmrClientPort = process.env.VITE_HMR_CLIENT_PORT
  ? parseInt(process.env.VITE_HMR_CLIENT_PORT, 10)
  : undefined

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 5173,
    allowedHosts: true,
    hmr: hmrClientPort
      ? { clientPort: hmrClientPort, protocol: process.env.VITE_HMR_PROTOCOL || 'wss' }
      : undefined,
    proxy: {
      '/api': backendUrl,
      '/hls': backendUrl,
      '/slides': backendUrl,
      '/ws': {
        target: backendWs,
        ws: true,
      },
    },
  },
})
