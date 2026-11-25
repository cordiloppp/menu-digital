/**
 * Validación de clients/<slug>/restaurant.json (corre en Node: al compilar, en `npm run dev` y con `npm run validar`).
 * Devuelve mensajes claros en español en lugar de errores crípticos.
 */
import fs from 'node:fs'
import path from 'node:path'
import { restaurantSchema, type Restaurant } from '../src/data/schema.ts'
import { RAIZ, type RutasCliente } from './cliente.ts'

export { RAIZ }

type Resultado = { ok: true; data: Restaurant } | { ok: false; errores: string[] }

const TIPOS: Record<string, string> = {
  string: 'texto entre comillas',
  number: 'un número sin comillas (ej. 45, no "45")',
  boolean: 'true o false (sin comillas)',
  array: 'una lista [ ... ]',
  object: 'un objeto { ... }',
}

function valorEn(data: unknown, ruta: PropertyKey[]): unknown {
  return ruta.reduce<unknown>((acc, k) => (acc && typeof acc === 'object' ? (acc as Record<PropertyKey, unknown>)[k] : undefined), data)
}

function rutaLegible(ruta: PropertyKey[]): string {
  return ruta.reduce<string>((acc, k) => (typeof k === 'number' ? `${acc}[${k}]` : acc ? `${acc}.${String(k)}` : String(k)), '')
}

/** Agrega contexto humano: qué categoría / producto es. */
function contexto(data: unknown, ruta: PropertyKey[]): string {
  const partes: string[] = []
  if (ruta[0] === 'categorias' && typeof ruta[1] === 'number') {
    const cat = valorEn(data, ruta.slice(0, 2)) as { nombre?: string } | undefined
    if (cat?.nombre) partes.push(`categoría "${cat.nombre}"`)
    if (ruta[2] === 'productos' && typeof ruta[3] === 'number') {
      const prod = valorEn(data, ruta.slice(0, 4)) as { nombre?: string } | undefined
      if (prod?.nombre) partes.push(`producto "${prod.nombre}"`)
    }
  }
  if (ruta[0] === 'promociones' && typeof ruta[1] === 'number') {
    const promo = valorEn(data, ruta.slice(0, 2)) as { titulo?: string } | undefined
    if (promo?.titulo) partes.push(`promoción "${promo.titulo}"`)
  }
  return partes.length ? `  (${partes.join(' → ')})` : ''
}

export function validarRestaurante(rutas: RutasCliente): Resultado {
  const RUTA_JSON = rutas.json
  let texto: string
  try {
    texto = fs.readFileSync(RUTA_JSON, 'utf8')
  } catch {
    return { ok: false, errores: [`No encontré ${path.relative(RAIZ, RUTA_JSON)}. ¿Creaste el cliente con npm run new-client?`] }
  }

  let data: unknown
  try {
    data = JSON.parse(texto)
  } catch (e) {
    return {
      ok: false,
      errores: [
        `restaurant.json no es JSON válido: ${(e as Error).message}`,
        'Revisa comas faltantes o sobrantes (la última línea de una lista NO lleva coma) y que todas las comillas estén cerradas.',
      ],
    }
  }

  const res = restaurantSchema.safeParse(data)
  const errores: string[] = []

  if (!res.success) {
    for (const issue of res.error.issues) {
      const ruta = issue.path as PropertyKey[]
      const donde = rutaLegible(ruta) || '(raíz)'
      const valor = valorEn(data, ruta)
      let msg: string

      if (issue.code === 'invalid_type') {
        msg =
          valor === undefined
            ? 'falta este campo (es obligatorio)'
            : `debe ser ${TIPOS[issue.expected] ?? issue.expected}, pero tiene ${JSON.stringify(valor)}`
      } else if (issue.code === 'invalid_value') {
        msg = `valor ${JSON.stringify(valor)} no permitido. Opciones: ${issue.values.map((v) => JSON.stringify(v)).join(', ')}`
      } else if (issue.code === 'unrecognized_keys') {
        msg = `campo(s) no reconocido(s): ${issue.keys.map((k) => `"${k}"`).join(', ')} — ¿error de escritura?`
      } else {
        msg = `${issue.message}${valor !== undefined && typeof valor !== 'object' ? ` (tiene ${JSON.stringify(valor)})` : ''}`
      }
      errores.push(`${donde}: ${msg}${contexto(data, ruta)}`)
    }
    return { ok: false, errores }
  }

  // ---- Validaciones que el esquema no cubre ----
  const r = res.data
  const vistos = new Map<string, string>()
  const revisarId = (tipo: string, id: string) => {
    const clave = `${tipo}:${id}`
    if (vistos.has(clave)) errores.push(`${tipo} con id repetido: "${id}". Cada id debe ser único.`)
    vistos.set(clave, id)
  }

  const imagenes: [string, string][] = [
    ['negocio.logo', r.negocio.logo],
    ['negocio.portada', r.negocio.portada],
  ]
  if (r.negocio.imagenCompartir) imagenes.push(['negocio.imagenCompartir', r.negocio.imagenCompartir])

  r.categorias.forEach((c) => {
    revisarId('Categoría', c.id)
    c.productos.forEach((p) => {
      revisarId('Producto', p.id)
      if (p.foto) imagenes.push([`foto de "${p.nombre}"`, p.foto])
    })
  })
  r.promociones?.forEach((p) => revisarId('Promoción', p.id))

  for (const [donde, ruta] of imagenes) {
    if (!fs.existsSync(path.join(rutas.dir, ruta))) {
      errores.push(`${donde}: no existe el archivo clients/${rutas.slug}${ruta}`)
    }
  }

  if (r.sitio.creditosFotos && !fs.existsSync(path.join(rutas.dir, r.sitio.creditosFotos))) {
    errores.push(`sitio.creditosFotos: no existe el archivo clients/${rutas.slug}${r.sitio.creditosFotos}`)
  }

  if (!r.negocio.entrega.paraLlevar && !r.negocio.entrega.domicilio) {
    errores.push('negocio.entrega: activa al menos "paraLlevar" o "domicilio"')
  }

  return errores.length ? { ok: false, errores } : { ok: true, data: r }
}

export function formatearErrores(errores: string[], rutas: RutasCliente): string {
  return [
    '',
    `✖ restaurant.json de "${rutas.slug}" tiene errores:`,
    '',
    ...errores.map((e) => `  • ${e}`),
    '',
    `  Archivo: ${path.relative(RAIZ, rutas.json)}`,
    '',
  ].join('\n')
}
