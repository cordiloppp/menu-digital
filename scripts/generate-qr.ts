/**
 * npm run qr -- <slug>
 *
 * Genera el QR de sitio.url del cliente en clients/<slug>/qr/:
 *   <slug>.png (2048 px, para imprimir) y <slug>.svg (vectorial, para imprenta)
 */
import fs from 'node:fs'
import path from 'node:path'
import QRCode from 'qrcode'
import { clienteExistente, leerJson, RAIZ } from './cliente.ts'

const rutas = clienteExistente()
const r = leerJson(rutas)
const url = r.sitio.url

if (!/^https?:\/\//.test(url)) {
  console.error(`✖ URL inválida: "${url}". Revisa sitio.url en clients/${rutas.slug}/restaurant.json`)
  process.exit(1)
}

const opciones = {
  errorCorrectionLevel: 'H' as const, // tolera manchas/rayones (hasta 30%)
  margin: 4, // margen blanco obligatorio para que lo lean todas las cámaras
  color: { dark: '#000000', light: '#ffffff' },
}

fs.mkdirSync(rutas.qr, { recursive: true })
const png = path.join(rutas.qr, `${rutas.slug}.png`)
const svg = path.join(rutas.qr, `${rutas.slug}.svg`)

await QRCode.toFile(png, url, { ...opciones, width: 2048, type: 'png' })
fs.writeFileSync(svg, await QRCode.toString(url, { ...opciones, type: 'svg' }))

console.log(`✔ QR de "${r.negocio.nombre}" para ${url}`)
console.log(`  ${path.relative(RAIZ, png)}  (2048×2048 px — imprime hasta ~17 cm a 300 dpi)`)
console.log(`  ${path.relative(RAIZ, svg)}  (vectorial — mándalo a la imprenta para cualquier tamaño)`)
if (r.mode === 'demo') console.log('  ⚠ Es la URL del DEMO. Cuando el cliente compre, corre `npm run promote` y vuelve a generar el QR.')
