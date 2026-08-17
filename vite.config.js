import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  // relative base: the same build works at a domain root and at a
  // github.io/<repo>/ subpath, so hosting choice doesn't need a rebuild
  base: './',
  plugins: [react()],
  server: {
    // dev only: lets a temporary tunnel host reach the dev server, which Vite
    // otherwise rejects on the Host header
    allowedHosts: true,
  },
})
