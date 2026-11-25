/**
 * Genera la imagen para compartir (Open Graph, 1200×630) a partir de la portada, el logo, el nombre y el slogan.
 *   npm run og -- <slug>
 * También se ejecuta sola con `npm run fotos` cuando cambias la portada (si no pusiste un og-image propio).
 */
import fs from 'node:fs'
import path from 'node:path'
import { pathToFileURL } from 'node:url'
import sharp, { type OverlayOptions } from 'sharp'
import { clienteExistente, leerJson, type RutasCliente } from './cliente.ts'

const xml = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
const FUENTE = "'Segoe UI', 'Helvetica Neue', Arial, sans-serif"

export async function generarOg(rutas: RutasCliente): Promise<string | null> {
  const r = leerJson(rutas)
  const n = r.negocio
  const destinoRel = n.imagenCompartir ?? '/images/og-image.jpg'
  const portada = path.join(rutas.dir, n.portada)
  const logo = path.join(rutas.dir, n.logo)
  if (!fs.existsSync(portada)) return null

  const W = 1200
  const H = 630
  const nombre = n.nombre.length > 22 ? 64 : 76
  const capa = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
    <defs>
      <linearGradient id="g" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stop-color="#000" stop-opacity=".82"/>
        <stop offset=".65" stop-color="#000" stop-opacity=".45"/>
        <stop offset="1" stop-color="#000" stop-opacity=".1"/>
      </linearGradient>
    </defs>
    <rect width="${W}" height="${H}" fill="url(#g)"/>
    <text x="80" y="345" font-family="${FUENTE}" font-size="${nombre}" font-weight="800" fill="#fff">${xml(n.nombre)}</text>
    <text x="82" y="402" font-family="${FUENTE}" font-size="34" font-weight="500" fill="#fff" fill-opacity=".85">${xml(n.slogan ?? 'Menú digital · Pide por WhatsApp')}</text>
    <rect x="80" y="448" width="300" height="60" rx="30" fill="${r.tema.colorSecundario}"/>
    <text x="230" y="487" font-family="${FUENTE}" font-size="25" font-weight="700" fill="#1b1816" text-anchor="middle">Ver menú y pedir</text>
  </svg>`)

  const capas: OverlayOptions[] = [{ input: capa, top: 0, left: 0 }]
  if (fs.existsSync(logo)) {
    const L = 132
    const mascara = Buffer.from(`<svg width="${L}" height="${L}"><rect width="${L}" height="${L}" rx="30" fill="#fff"/></svg>`)
    const logoBuf = await sharp(logo).resize(L, L, { fit: 'cover' }).composite([{ input: mascara, blend: 'dest-in' }]).png().toBuffer()
    capas.push({ input: logoBuf, top: 140, left: 80 })
  }

  const destino = path.join(rutas.dir, destinoRel)
  await sharp(portada).resize(W, H, { fit: 'cover' }).composite(capas).jpeg({ quality: 84, mozjpeg: true }).toFile(destino)
  return destinoRel
}

// Ejecutado directamente: npm run og
if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const rutas = clienteExistente()
  const res = await generarOg(rutas)
  console.log(res ? `✔ Imagen para compartir generada: clients/${rutas.slug}${res}` : '✖ No encontré la portada.')
}
