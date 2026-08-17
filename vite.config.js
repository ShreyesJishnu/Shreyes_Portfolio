import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  // relative base: the same build works at a domain root and at a
  // github.io/<repo>/ subpath, so hosting choice doesn't need a rebuild
  base: './',
  plugins: [react()],
  server: {
    // Vite does not read PORT on its own; without this it ignores an assigned
    // port, finds its default busy, and drifts to the next free one.
    port: Number(process.env.PORT) || undefined,
  },
})
