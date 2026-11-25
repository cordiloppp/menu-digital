/**
 * Resuelve qué cliente se está usando y dónde están sus archivos.
 * Prioridad: argumento del script (npm run x -- <slug>) → variable CLIENT → "tacos-el-guero".
 */
import fs from 'node:fs'
import path from 'node:path'
import type { Restaurant } from '../src/data/schema.ts'

export const RAIZ = path.resolve(import.meta.dirname, '..')
export const CARPETA_CLIENTES = path.join(RAIZ, 'clients')
export const CLIENTE_POR_DEFECTO = 'tacos-el-guero'
export const SLUG_VALIDO = /^[a-z0-9]+(-[a-z0-9]+)*$/

export type RutasCliente = {
  slug: string
  dir: string
  json: string
  images: string
  originales: string
  qr: string
}

export function rutasCliente(slug: string): RutasCliente {
  const dir = path.join(CARPETA_CLIENTES, slug)
  return {
    slug,
    dir,
    json: path.join(dir, 'restaurant.json'),
    images: path.join(dir, 'images'),
    originales: path.join(dir, 'fotos-originales'),
    qr: path.join(dir, 'qr'),
  }
}

/** Slug desde el primer argumento que no sea una bandera, o desde CLIENT. */
export function slugActivo(argv = process.argv.slice(2)): string {
  const arg = argv.find((a) => !a.startsWith('-'))
  return (arg ?? process.env.CLIENT ?? CLIENTE_POR_DEFECTO).trim()
}

/** Igual que slugActivo pero termina el proceso con un mensaje claro si el cliente no existe. */
export function clienteExistente(argv?: string[]): RutasCliente {
  const slug = slugActivo(argv)
  const rutas = rutasCliente(slug)
  if (!SLUG_VALIDO.test(slug) || !fs.existsSync(rutas.json)) {
    const disponibles = fs.existsSync(CARPETA_CLIENTES)
      ? fs.readdirSync(CARPETA_CLIENTES).filter((d) => fs.existsSync(path.join(CARPETA_CLIENTES, d, 'restaurant.json')))
      : []
    console.error(`\n✖ No existe el cliente "${slug}" (busqué ${path.relative(RAIZ, rutas.json)}).`)
    console.error(`  Clientes disponibles: ${disponibles.join(', ') || '(ninguno)'}`)
    console.error(`  Para crear uno: npm run new-client -- ${SLUG_VALIDO.test(slug) ? slug : 'mi-cliente'} "Nombre del negocio"\n`)
    process.exit(1)
  }
  return rutas
}

export function leerJson(rutas: RutasCliente): Restaurant {
  return JSON.parse(fs.readFileSync(rutas.json, 'utf8')) as Restaurant
}

export function guardarJson(rutas: RutasCliente, data: unknown) {
  fs.writeFileSync(rutas.json, JSON.stringify(data, null, 2) + '\n')
}
