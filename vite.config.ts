import { defineConfig, type Plugin, type ResolvedConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import fs from 'node:fs'
import path from 'node:path'
import { CLIENTE_POR_DEFECTO, rutasCliente, SLUG_VALIDO } from './scripts/cliente.ts'
import { asegurarContraste, textoSobre } from './scripts/paleta.ts'
import { formatearErrores, validarRestaurante } from './scripts/validar-datos.ts'
import { FUENTES } from './src/lib/fuentes.ts'
import { MARCA } from './src/config/brand.ts'
import type { Restaurant } from './src/data/schema.ts'

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;')

const TIPOS_MIME: Record<string, string> = {
  '.webp': 'image/webp', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.svg': 'image/svg+xml', '.html': 'text/html; charset=utf-8',
}

/**
 * Plugin del menú digital:
 * - Elige el cliente con la variable CLIENT (por defecto tacos-el-guero).
 * - Valida su restaurant.json al compilar y en desarrollo (muestra el error en pantalla).
 * - Expone `virtual:restaurant` (los datos) y `virtual:fuentes` (solo la tipografía elegida).
 * - Sirve en desarrollo y copia al compilar clients/<slug>/images → /images y las páginas .html del cliente.
 * - Inyecta <title>, Open Graph, noindex (modo demo) y los colores con contraste AA garantizado.
 */
function menuDigital(): Plugin {
  const slug = (process.env.CLIENT || CLIENTE_POR_DEFECTO).trim()
  const rutas = rutasCliente(slug)
  const V_FUENTES = 'virtual:fuentes'
  const V_DATOS = 'virtual:restaurant'
  let config: ResolvedConfig

  function cargar(): Restaurant {
    if (!SLUG_VALIDO.test(slug) || !fs.existsSync(rutas.json)) {
      const e = new Error(`\n✖ No existe el cliente "${slug}" (clients/${slug}/restaurant.json).\n  Créalo con: npm run new-client -- ${slug} "Nombre del negocio"\n`)
      e.stack = ''
      throw e
    }
    const res = validarRestaurante(rutas)
    if (!res.ok) {
      const e = new Error(formatearErrores(res.errores, rutas))
      e.stack = '' // sin trazas: solo el mensaje claro
      throw e
    }
    return res.data
  }

  return {
    name: 'menu-digital',
    configResolved(c) {
      config = c
    },
    buildStart() {
      this.addWatchFile(rutas.json)
      let r: Restaurant
      try {
        r = cargar()
      } catch (e) {
        // Al compilar: falla con el mensaje claro. En desarrollo: arranca igual y muestra el error en pantalla
        if (config.command === 'build') throw e
        console.error((e as Error).message)
        return
      }
      console.log(`\n  🍽️  Cliente: ${slug} — "${r.negocio.nombre}" (modo ${r.mode})\n`)
      if (r.mode === 'demo' && MARCA.whatsapp === '526640000000') {
        console.warn('  ⚠ Modo demo con el WhatsApp de relleno de src/config/brand.ts: los pedidos de prueba no le llegarán a nadie.\n')
      }
    },
    resolveId(id) {
      if (id === V_FUENTES || id === V_DATOS) return '\0' + id
    },
    load(id) {
      if (id === '\0' + V_FUENTES) {
        return FUENTES[cargar().tema.tipografia].paquetes.map((p) => `import '${p}/wght.css'`).join('\n')
      }
      if (id === '\0' + V_DATOS) {
        this.addWatchFile(rutas.json)
        return `export default ${JSON.stringify(cargar())}`
      }
    },
    configureServer(server) {
      server.watcher.add(rutas.json)
      server.watcher.on('change', (file) => {
        if (path.resolve(file) !== rutas.json) return
        const res = validarRestaurante(rutas)
        if (!res.ok) {
          const message = formatearErrores(res.errores, rutas)
          console.error(message)
          setTimeout(() => server.ws.send({ type: 'error', err: { message, stack: '' } }), 150)
          return
        }
        const mod = server.moduleGraph.getModuleById('\0' + V_DATOS)
        if (mod) server.moduleGraph.invalidateModule(mod)
        server.ws.send({ type: 'full-reload' })
      })
      // Imágenes y páginas extra del cliente
      server.middlewares.use((req, res, next) => {
        const url = decodeURIComponent((req.url ?? '').split('?')[0])
        const esImagen = url.startsWith('/images/')
        const esPagina = /^\/[\w-]+\.html$/.test(url) && url !== '/index.html'
        if (!esImagen && !esPagina) return next()
        const archivo = path.join(rutas.dir, url)
        if (!archivo.startsWith(rutas.dir) || !fs.existsSync(archivo) || !fs.statSync(archivo).isFile()) return next()
        res.setHeader('Content-Type', TIPOS_MIME[path.extname(archivo).toLowerCase()] ?? 'application/octet-stream')
        fs.createReadStream(archivo).pipe(res)
      })
    },
    writeBundle() {
      const out = path.resolve(config.root, config.build.outDir)
      if (fs.existsSync(rutas.images)) fs.cpSync(rutas.images, path.join(out, 'images'), { recursive: true, filter: (src) => !path.basename(src).startsWith('.') })
      for (const f of fs.readdirSync(rutas.dir)) {
        if (f.endsWith('.html')) fs.copyFileSync(path.join(rutas.dir, f), path.join(out, f))
      }
    },
    transformIndexHtml(html) {
      const r = cargar()
      const n = r.negocio
      const base = r.sitio.url.replace(/\/$/, '')
      const titulo = `${n.nombre} — Menú`
      const imagen = base + (n.imagenCompartir ?? n.portada)
      const f = FUENTES[r.tema.tipografia]

      // Colores con contraste AA garantizado (si el color elegido no cumple, se ajusta su luminosidad)
      const c = asegurarContraste(r.tema.colorPrimario, r.tema.colorSecundario)
      if (c.cambioPrimario || c.cambioSecundario) {
        console.log(`  ℹ Colores ajustados para contraste AA: primario ${r.tema.colorPrimario}→${c.primario}, secundario ${r.tema.colorSecundario}→${c.secundario}`)
      }
      const css = `:root{--marca:${c.primario};--marca-texto:${textoSobre(c.primario)};--acento:${c.secundario};--acento-texto:${textoSobre(c.secundario)};--fuente-titulos:${f.titulos},ui-sans-serif,system-ui,sans-serif;--fuente-texto:${f.texto},ui-sans-serif,system-ui,sans-serif}`

      const meta = [
        `<meta name="description" content="${esc(n.descripcion)}" />`,
        r.mode === 'demo' ? `<meta name="robots" content="noindex, nofollow" />` : `<link rel="canonical" href="${esc(base)}/" />`,
        `<meta name="theme-color" content="${c.primario}" />`,
        `<link rel="icon" href="${n.logo}" />`,
        `<link rel="apple-touch-icon" href="${n.logo}" />`,
        `<link rel="preload" as="image" href="${n.portada}" fetchpriority="high" />`,
        `<meta property="og:type" content="restaurant" />`,
        `<meta property="og:locale" content="es_MX" />`,
        `<meta property="og:site_name" content="${esc(n.nombre)}" />`,
        `<meta property="og:title" content="${esc(titulo)}" />`,
        `<meta property="og:description" content="${esc(n.descripcion)}" />`,
        `<meta property="og:url" content="${esc(base)}/" />`,
        `<meta property="og:image" content="${esc(imagen)}" />`,
        `<meta property="og:image:width" content="1200" />`,
        `<meta property="og:image:height" content="630" />`,
        `<meta property="og:image:alt" content="${esc(n.nombre)}" />`,
        `<meta name="twitter:card" content="summary_large_image" />`,
        `<meta name="twitter:title" content="${esc(titulo)}" />`,
        `<meta name="twitter:description" content="${esc(n.descripcion)}" />`,
        `<meta name="twitter:image" content="${esc(imagen)}" />`,
        `<style>${css}</style>`,
      ].join('\n    ')

      return html.replace('<title></title>', `<title>${esc(titulo)}</title>\n    ${meta}`)
    },
  }
}

export default defineConfig({
  plugins: [menuDigital(), react(), tailwindcss()],
  build: { target: 'es2020', cssCodeSplit: false },
})
