/**
 * npm run fotos -- <slug>
 *
 * Toma las fotos de clients/<slug>/fotos-originales/ (JPG, PNG, WebP, AVIF, HEIC si tu sistema lo soporta)
 * y las guarda optimizadas en clients/<slug>/images/ como WebP.
 *
 * Nombres especiales:
 *   logo.*         → 512×512 (sin recortar: se centra sobre blanco). Además saca la paleta de colores del logo
 *   portada.*      → 1080×608 (16:9)
 *   og-image.*     → 1200×630 JPG (vista previa de WhatsApp). Si no la pones, se genera sola desde la portada
 *   cualquier otro → 600×600 cuadrado (fotos de producto, recorte inteligente)
 *
 * El nombre del archivo se limpia: "Taco de Adobada.JPG" → "taco-de-adobada.webp"
 */
import fs from 'node:fs'
import path from 'node:path'
import sharp from 'sharp'
import { clienteExistente, guardarJson, leerJson } from './cliente.ts'
import { generarOg } from './og.ts'
import { asegurarContraste, paletaDesdeLogo } from './paleta.ts'
import { generarPortada, marcaPortadaAuto } from './placeholders.ts'

const rutas = clienteExistente()
const ORIGEN = rutas.originales
const DESTINO = rutas.images
const EXT = /\.(jpe?g|png|webp|avif|heic|heif|tiff?|svg)$/i

const limpiar = (n: string) =>
  n
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')

const kb = (f: string) => `${Math.round(fs.statSync(f).size / 1024)} KB`

const archivos = fs.existsSync(ORIGEN) ? fs.readdirSync(ORIGEN).filter((f) => EXT.test(f)) : []
if (!archivos.length) {
  console.log(`No hay fotos en clients/${rutas.slug}/fotos-originales/. Copia ahí las fotos y vuelve a correr \`npm run fotos -- ${rutas.slug}\`.`)
  process.exit(0)
}

fs.mkdirSync(DESTINO, { recursive: true })
let errores = 0
let logoOriginal: string | null = null

for (const archivo of archivos) {
  const entrada = path.join(ORIGEN, archivo)
  const nombre = limpiar(path.parse(archivo).name)
  try {
    const img = sharp(entrada, { density: 300 }).rotate() // respeta la orientación de fotos de celular
    let salida: string
    if (nombre === 'og-image') {
      salida = path.join(DESTINO, 'og-image.jpg')
      await img.resize(1200, 630, { fit: 'cover' }).jpeg({ quality: 82, mozjpeg: true }).toFile(salida)
    } else if (nombre === 'portada') {
      salida = path.join(DESTINO, 'portada.webp')
      await img.resize(1080, 608, { fit: 'cover' }).webp({ quality: 66, smartSubsample: true }).toFile(salida)
      fs.rmSync(marcaPortadaAuto(rutas), { force: true }) // ya es una foto real
    } else if (nombre === 'logo') {
      salida = path.join(DESTINO, 'logo.webp')
      await img.resize(440, 440, { fit: 'contain', background: '#ffffff' }).extend({ top: 36, bottom: 36, left: 36, right: 36, background: '#ffffff' }).flatten({ background: '#ffffff' }).webp({ quality: 88 }).toFile(salida)
      logoOriginal = entrada
    } else {
      salida = path.join(DESTINO, `${nombre}.webp`)
      await img.resize(600, 600, { fit: 'cover', position: sharp.strategy.attention }).webp({ quality: 68, smartSubsample: true }).toFile(salida)
    }
    console.log(`  ✔ ${archivo.padEnd(32)} → images/${path.basename(salida)}  (${kb(entrada)} → ${kb(salida)})`)
  } catch (e) {
    errores++
    console.error(`  ✖ ${archivo}: ${(e as Error).message}`)
  }
}

// Logo nuevo → paleta automática con contraste AA
if (logoOriginal) {
  const r = leerJson(rutas)
  const ext = await paletaDesdeLogo(logoOriginal)
  const ok = asegurarContraste(ext.primario, ext.secundario)
  r.tema.colorPrimario = ok.primario
  r.tema.colorSecundario = ok.secundario
  guardarJson(rutas, r)
  console.log(`  🎨 Paleta desde el logo (${ext.fuente}): primario ${ok.primario}, secundario ${ok.secundario}`)
  // Si la portada sigue siendo la abstracta, se regenera con los colores nuevos
  if (fs.existsSync(marcaPortadaAuto(rutas)) && (await generarPortada(rutas, r, true))) console.log('  ✔ Portada abstracta actualizada con la nueva paleta')
}

// Si cambiaste portada o logo y no diste un og-image propio, se genera sola
const nombres = archivos.map((a) => limpiar(path.parse(a).name))
if (!nombres.includes('og-image') && (nombres.includes('portada') || nombres.includes('logo'))) {
  // (también refleja la portada abstracta regenerada)
  const og = await generarOg(rutas)
  if (og) console.log(`  ✔ Imagen para compartir en WhatsApp generada → images/${path.basename(og)}`)
}

console.log(`\nListo. Usa las rutas "/images/<nombre>.webp" en clients/${rutas.slug}/restaurant.json.`)
if (errores) process.exit(1)
