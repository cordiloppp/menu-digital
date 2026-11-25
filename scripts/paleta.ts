/**
 * Color: contraste WCAG y extracción de paleta desde el logo.
 *   npm run paleta -- <slug>   → saca colorPrimario/colorSecundario del logo del cliente
 */
import fs from 'node:fs'
import path from 'node:path'
import { pathToFileURL } from 'node:url'
import sharp from 'sharp'

// ───────────── utilidades de color ─────────────
type RGB = [number, number, number]

export function hexARgb(hex: string): RGB {
  let h = hex.replace('#', '')
  if (h.length === 3) h = [...h].map((c) => c + c).join('')
  return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16)) as RGB
}
export const rgbAHex = (c: RGB) => '#' + c.map((v) => Math.round(Math.max(0, Math.min(255, v))).toString(16).padStart(2, '0')).join('').toUpperCase()

function luminancia([r, g, b]: RGB): number {
  const f = (v: number) => {
    const c = v / 255
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
  }
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b)
}

/** Relación de contraste WCAG entre dos colores hex (1 a 21). AA texto normal = 4.5 */
export function contraste(a: string, b: string): number {
  const [l1, l2] = [luminancia(hexARgb(a)), luminancia(hexARgb(b))].sort((x, y) => y - x)
  return (l1 + 0.05) / (l2 + 0.05)
}

function rgbAHsl([r, g, b]: RGB): [number, number, number] {
  r /= 255; g /= 255; b /= 255
  const max = Math.max(r, g, b), min = Math.min(r, g, b)
  const l = (max + min) / 2
  if (max === min) return [0, 0, l]
  const d = max - min
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
  const h = max === r ? (g - b) / d + (g < b ? 6 : 0) : max === g ? (b - r) / d + 2 : (r - g) / d + 4
  return [h * 60, s, l]
}

function hslARgb(h: number, s: number, l: number): RGB {
  const k = (n: number) => (n + h / 30) % 12
  const a = s * Math.min(l, 1 - l)
  const f = (n: number) => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)))
  return [f(0) * 255, f(8) * 255, f(4) * 255]
}

/** Ajusta la luminosidad (manteniendo el tono) hasta cumplir el contraste mínimo contra `fondo`. */
function ajustarHasta(hex: string, fondo: string, minimo: number, direccion: 'oscurecer' | 'aclarar'): string {
  const [h, s, l0] = rgbAHsl(hexARgb(hex))
  let l = l0
  let actual = hex
  for (let i = 0; i < 100 && contraste(actual, fondo) < minimo; i++) {
    l = direccion === 'oscurecer' ? l - 0.01 : l + 0.01
    if (l <= 0 || l >= 1) break
    actual = rgbAHex(hslARgb(h, s, l))
  }
  return actual
}

export const FONDO = '#F6F4F0' // --color-fondo
export const TINTA = '#1B1816' // --color-tinta

/**
 * Garantiza WCAG AA (4.5:1) para cómo se usan los colores en el menú:
 *  - primario: texto sobre fondo claro (links) y fondo de botones con texto blanco
 *  - secundario: texto sobre tarjetas oscuras (promociones)
 */
export function asegurarContraste(primario: string, secundario: string) {
  const p = ajustarHasta(primario, FONDO, 4.5, 'oscurecer')
  const s = ajustarHasta(secundario, TINTA, 4.5, 'aclarar')
  return { primario: p.toUpperCase(), secundario: s.toUpperCase(), cambioPrimario: p.toUpperCase() !== primario.toUpperCase(), cambioSecundario: s.toUpperCase() !== secundario.toUpperCase() }
}

/** Texto blanco o negro, el que tenga más contraste sobre `fondo`. */
export const textoSobre = (fondo: string) => (contraste(fondo, '#FFFFFF') >= contraste(fondo, TINTA) ? '#FFFFFF' : TINTA)

// ───────────── extracción desde el logo ─────────────
const distTono = (a: number, b: number) => Math.min(Math.abs(a - b), 360 - Math.abs(a - b))

/**
 * Saca dos colores representativos del logo: agrupa píxeles con color (ignora blanco, negro,
 * grises y transparencias) por tono y elige los dos grupos más grandes con tonos distintos.
 */
export async function paletaDesdeLogo(rutaLogo: string): Promise<{ primario: string; secundario: string; fuente: string }> {
  const { data, info } = await sharp(rutaLogo).resize(96, 96, { fit: 'inside' }).ensureAlpha().raw().toBuffer({ resolveWithObject: true })
  type Grupo = { n: number; r: number; g: number; b: number; h: number }
  const grupos = new Map<number, Grupo>()
  let oscuros = 0
  for (let i = 0; i < data.length; i += info.channels) {
    const [r, g, b, a] = [data[i], data[i + 1], data[i + 2], data[i + 3]]
    if (a < 200) continue
    const [h, s, l] = rgbAHsl([r, g, b])
    if (l < 0.18) oscuros++
    if (s < 0.28 || l < 0.12 || l > 0.9) continue // grises, negro, blanco
    const clave = Math.round(h / 20) % 18
    const gr = grupos.get(clave) ?? { n: 0, r: 0, g: 0, b: 0, h: 0 }
    gr.n++; gr.r += r; gr.g += g; gr.b += b; gr.h += h
    grupos.set(clave, gr)
  }
  const orden = [...grupos.values()].filter((g) => g.n >= 8).sort((a, b) => b.n - a.n)
  const color = (g: Grupo) => rgbAHex([g.r / g.n, g.g / g.n, g.b / g.n])

  if (!orden.length) {
    // Logo en blanco y negro: primario oscuro elegante + dorado
    return { primario: oscuros > 50 ? '#2A2522' : '#3D3A37', secundario: '#C99A3E', fuente: 'logo sin colores (blanco/negro)' }
  }
  const p = orden[0]
  const s = orden.find((g) => distTono(g.h / g.n, p.h / p.n) > 35)
  let secundario: string
  if (s) secundario = color(s)
  else {
    // Un solo color en el logo: el secundario es una versión dorada/clara armónica
    const [h] = rgbAHsl(hexARgb(color(p)))
    secundario = rgbAHex(hslARgb((h + 40) % 360, 0.6, 0.6))
  }
  // El color más saturado/oscuro funciona mejor como primario (botones)
  const [, , lp] = rgbAHsl(hexARgb(color(p)))
  const [, , ls] = rgbAHsl(hexARgb(secundario))
  const [primario, sec] = lp <= ls ? [color(p), secundario] : [secundario, color(p)]
  return { primario, secundario: sec, fuente: s ? 'dos colores del logo' : 'un color del logo + acento armónico' }
}

/** Busca el logo del cliente (logo.webp/png/jpg/svg) dentro de su carpeta images. */
export function buscarLogo(dirImages: string): string | null {
  for (const ext of ['png', 'svg', 'jpg', 'jpeg', 'webp']) {
    const p = path.join(dirImages, `logo.${ext}`)
    if (fs.existsSync(p)) return p
  }
  return null
}

// npm run paleta -- <slug>
if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const { clienteExistente, leerJson, guardarJson } = await import('./cliente.ts')
  const rutas = clienteExistente()
  const logo = buscarLogo(rutas.images)
  if (!logo) {
    console.error(`✖ No hay logo en clients/${rutas.slug}/images/ (logo.png, logo.jpg, logo.svg o logo.webp)`)
    process.exit(1)
  }
  const r = leerJson(rutas)
  const ext = await paletaDesdeLogo(logo)
  const ok = asegurarContraste(ext.primario, ext.secundario)
  r.tema.colorPrimario = ok.primario
  r.tema.colorSecundario = ok.secundario
  guardarJson(rutas, r)
  console.log(`✔ Paleta desde el logo (${ext.fuente}): primario ${ok.primario}${ok.cambioPrimario ? ` (ajustado de ${ext.primario} para contraste AA)` : ''}, secundario ${ok.secundario}${ok.cambioSecundario ? ` (ajustado de ${ext.secundario})` : ''}`)
}
