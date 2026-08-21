import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { build } from 'vite'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const root = path.resolve(__dirname, '..')
const toAbsolute = (p) => path.resolve(root, p)

async function run() {
  // 1. Build the SSR bundle
  console.log('\n[prerender] Building SSR bundle...')
  await build({
    root,
    build: {
      ssr: true,
      outDir: 'dist-ssr',
      rollupOptions: {
        input: path.join(root, 'src/entry-server.tsx'),
        external: []
      }
    },
    ssr: {
      // Ensure react-dom/server is treated correctly
      noExternal: ['react-helmet-async']
    }
  })

  // 2. Import the render function (use pathToFileURL for Windows compatibility)
  console.log('[prerender] Importing SSR render function...')
  const ssrEntryPath = toAbsolute('dist-ssr/entry-server.js')
  const ssrModule = await import(pathToFileURL(ssrEntryPath).href)
  const { render } = ssrModule

  // 3. Read the built dist/index.html as template
  const template = fs.readFileSync(toAbsolute('dist/index.html'), 'utf-8')

  // 4. Routes to pre-render
  const routes = ['/', '/about', '/services', '/contact', '/priceestimator']

  for (const url of routes) {
    console.log(`[prerender] Rendering: ${url}`)

    try {
      const { html: appHtml, helmet } = render(url)

      // Inject rendered HTML into root div
      let html = template.replace('<div id="root"></div>', `<div id="root">${appHtml}</div>`)

      // Inject helmet tags (title, meta, canonical) into head if available
      if (helmet) {
        const headTags = [
          helmet.title?.toString() || '',
          helmet.meta?.toString() || '',
          helmet.link?.toString() || '',
        ].join('\n')
        if (headTags.trim()) {
          // Remove the static title since helmet will provide the correct one
          html = html.replace(/<title>[^<]*<\/title>/, '')
          // Insert helmet tags before </head>
          html = html.replace('</head>', `${headTags}\n</head>`)
        }
      }

      // Write the file
      const outPath = url === '/' ? 'dist/index.html' : `dist${url}/index.html`
      const filePath = toAbsolute(outPath)
      fs.mkdirSync(path.dirname(filePath), { recursive: true })
      fs.writeFileSync(filePath, html)
      console.log(`[prerender] Written: ${outPath}`)
    } catch (err) {
      console.warn(`[prerender] Warning: Failed to pre-render ${url}:`, err.message)
      // Don't fail the build — fall back to CSR for that route
    }
  }

  // 5. Cleanup
  fs.rmSync(toAbsolute('dist-ssr'), { recursive: true, force: true })
  console.log('\n[prerender] All routes pre-rendered successfully.\n')
}

run().catch(err => {
  console.error('[prerender] Fatal error:', err)
  process.exit(1)
})
