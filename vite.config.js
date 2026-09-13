import fs from 'node:fs'
import path from 'node:path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Pages serves this project site from /<repo>. Anything shipped in public/ that
// bakes in its own absolute paths — the velan demo is a static Next export, so
// it has to — only resolves if the dev server mounts the site at that same
// base. Mirroring it here is what makes "works in dev" mean "works deployed".
const DEPLOY_BASE = '/Shreyes_Portfolio/'

/**
 * A static host answers /velan/ with /velan/index.html. Vite's dev server does
 * not: it treats an unmatched path as an SPA route and returns the portfolio's
 * own index.html, so a self-contained site in public/ opens the portfolio again
 * instead of itself.
 */
function publicDirectoryIndex(base) {
  return {
    name: 'public-directory-index',
    configureServer(server) {
      // registered before Vite's own middlewares, so it wins over the SPA fallback
      server.middlewares.use((req, _res, next) => {
        const [pathname] = (req.url || '').split('?')
        if (pathname.endsWith('/')) {
          const rel = pathname.startsWith(base) ? pathname.slice(base.length - 1) : pathname
          const candidate = path.join(process.cwd(), 'public', rel, 'index.html')
          if (fs.existsSync(candidate)) req.url = `${pathname}index.html`
        }
        next()
      })
    },
  }
}

export default defineConfig(({ command }) => ({
  // Build relative so the same output works at a domain root or a /<repo>
  // subpath. Dev pins the real deploy base instead, so what you click locally
  // resolves exactly as it will once published.
  base: command === 'serve' ? DEPLOY_BASE : './',
  plugins: [react(), publicDirectoryIndex(DEPLOY_BASE)],
  server: {
    // Vite does not read PORT on its own; without this it ignores an assigned
    // port, finds its default busy, and drifts to the next free one.
    port: Number(process.env.PORT) || undefined,
  },
}))
