import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const BACKEND = process.env.BACKEND_URL || 'http://localhost:8080'

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 5174,
    strictPort: true,
    watch: { usePolling: true },
    proxy: {
      '/api': {
        target: BACKEND,
        changeOrigin: true,
        secure: false,
        cookieDomainRewrite: ''
      }
    }
  },
  preview: {
    host: '0.0.0.0',
    port: 4174,
    strictPort: true
  }
})
