/**
 * Genera las imágenes base que falten de un cliente:
 *   - logo.webp de iniciales (si no hay logo)
 *   - portada.webp abstracta con los colores del tema (si no hay portada)
 *   - og-image.jpg (imagen para compartir) desde la portada
 *
 *   npm run placeholders -- <slug>
 *
 * Los productos sin foto NO necesitan imagen: el menú muestra un ícono genérico según el "tipo" de su categoría.
 */
import fs from 'node:fs'
import path from 'node:path'
import { pathToFileURL } from 'node:url'
import sharp from 'sharp'
import { clienteExistente, leerJson, type RutasCliente } from './cliente.ts'
import { generarOg } from './og.ts'
import type { Restaurant } from '../src/data/schema.ts'

const xml = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

export function iniciales(nombre: string): string {
  const palabras = nombre.split(/\s+/).filter((w) => w.length > 2 && !/^(el|la|los|las|de|del|y)$/i.test(w))
  const base = palabras.length ? palabras : nombre.split(/\s+/)
  return base.map((w) => w[0]).join('').slice(0, 2).toUpperCase()
}

/** Logo de iniciales: fondo casi negro, marco y letras en el color secundario. */
export async function generarLogoIniciales(rutas: RutasCliente, r: Restaurant, forzar = false): Promise<boolean> {
  const destino = path.join(rutas.dir, r.negocio.logo)
  if (fs.existsSync(destino) && !forzar) return false
  const S = r.tema.colorSecundario
  const ini = iniciales(r.negocio.nombre)
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512">
  <rect width="512" height="512" fill="#1b1816"/>
  <rect x="36" y="36" width="440" height="440" rx="96" fill="none" stroke="${S}" stroke-width="6" stroke-opacity=".9"/>
  <text x="256" y="268" font-family="Georgia, 'Times New Roman', serif" font-size="${ini.length > 1 ? 200 : 240}" font-weight="700" fill="${S}" text-anchor="middle" dominant-baseline="middle">${xml(ini)}</text>
</svg>`
  fs.mkdirSync(path.dirname(destino), { recursive: true })
  await sharp(Buffer.from(svg)).webp({ quality: 90 }).toFile(destino)
  return true
}

/** Portada abstracta y elegante con los colores del tema (sin texto: el nombre ya va encima en el menú). */
export async function generarPortada(rutas: RutasCliente, r: Restaurant, forzar = false): Promise<boolean> {
  const destino = path.join(rutas.dir, r.negocio.portada)
  if (fs.existsSync(destino) && !forzar) return false
  const { colorPrimario: P, colorSecundario: S } = r.tema
  let puntos = ''
  for (let y = 0; y < 700; y += 54) for (let x = (y / 54) % 2 ? 27 : 0; x < 1120; x += 54) puntos += `<circle cx="${x}" cy="${y}" r="2" fill="#fff" fill-opacity=".07"/>`
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="608">
  <defs>
    <radialGradient id="a" cx="80%" cy="15%" r="70%"><stop offset="0" stop-color="${P}" stop-opacity=".95"/><stop offset="1" stop-color="${P}" stop-opacity="0"/></radialGradient>
    <radialGradient id="b" cx="10%" cy="100%" r="60%"><stop offset="0" stop-color="${S}" stop-opacity=".45"/><stop offset="1" stop-color="${S}" stop-opacity="0"/></radialGradient>
  </defs>
  <rect width="1080" height="608" fill="#1b1816"/>
  <rect width="1080" height="608" fill="url(#a)"/>
  <rect width="1080" height="608" fill="url(#b)"/>
  ${puntos}
</svg>`
  fs.mkdirSync(path.dirname(destino), { recursive: true })
  await sharp(Buffer.from(svg)).webp({ quality: 80 }).toFile(destino)
  fs.writeFileSync(marcaPortadaAuto(rutas), 'portada generada automáticamente; se regenera si cambia la paleta')
  return true
}

/** Archivo testigo: indica que la portada es abstracta (no una foto real) y puede regenerarse. */
export const marcaPortadaAuto = (rutas: RutasCliente) => path.join(rutas.images, '.portada-auto')

// npm run placeholders -- <slug> [--todas]
if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const rutas = clienteExistente()
  const r = leerJson(rutas)
  const forzar = process.argv.includes('--todas')
  const hechos: string[] = []
  if (await generarLogoIniciales(rutas, r, forzar)) hechos.push(`logo de iniciales (${iniciales(r.negocio.nombre)})`)
  if (await generarPortada(rutas, r, forzar)) hechos.push('portada abstracta')
  if (hechos.length && (await generarOg(rutas))) hechos.push('imagen para compartir')
  console.log(hechos.length ? `✔ ${rutas.slug}: ${hechos.join(', ')}` : '✔ No faltaba ninguna imagen.')
}
