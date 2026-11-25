/**
 * npm run new-client -- <slug> "<Nombre del negocio>"
 *
 * Crea clients/<slug>/ con un restaurant.json base en modo demo, logo de iniciales (o paleta desde
 * el logo si ya pusiste uno en images/ o fotos-originales/), portada abstracta e imagen para compartir.
 */
import fs from 'node:fs'
import path from 'node:path'
import sharp from 'sharp'
import { guardarJson, RAIZ, rutasCliente, SLUG_VALIDO } from './cliente.ts'
import { generarOg } from './og.ts'
import { asegurarContraste, buscarLogo, paletaDesdeLogo } from './paleta.ts'
import { generarLogoIniciales, generarPortada, iniciales } from './placeholders.ts'
import type { Restaurant } from '../src/data/schema.ts'

const [slug, ...resto] = process.argv.slice(2).filter((a) => !a.startsWith('--'))
const nombre = resto.join(' ').trim()

if (!slug || !nombre) {
  console.error('\nUso: npm run new-client -- <slug> "<Nombre del negocio>"')
  console.error('Ej.: npm run new-client -- mariscos-lupita "Mariscos Lupita"\n')
  process.exit(1)
}
if (!SLUG_VALIDO.test(slug)) {
  console.error(`\n✖ Slug inválido: "${slug}". Usa solo minúsculas, números y guiones (ej. mariscos-lupita).\n`)
  process.exit(1)
}

const rutas = rutasCliente(slug)
if (fs.existsSync(rutas.json)) {
  console.error(`\n✖ Ya existe clients/${slug}/restaurant.json. Elige otro slug o edita ese cliente.\n`)
  process.exit(1)
}
for (const d of [rutas.images, rutas.originales, rutas.qr]) fs.mkdirSync(d, { recursive: true })

const base: Restaurant = {
  mode: 'demo',
  sitio: { url: `https://${slug}-demo.vercel.app` },
  negocio: {
    nombre,
    descripcion: `Menú digital de ${nombre}. Mira el menú completo y haz tu pedido por WhatsApp.`,
    logo: '/images/logo.webp',
    portada: '/images/portada.webp',
    imagenCompartir: '/images/og-image.jpg',
    entrega: { paraLlevar: true, domicilio: true },
  },
  tema: { colorPrimario: '#9E3A22', colorSecundario: '#C99A3E', tipografia: 'moderna' },
  promociones: [],
  categorias: [
    {
      id: 'menu',
      nombre: 'Menú',
      tipo: 'general',
      productos: [
        { id: 'platillo-de-ejemplo', nombre: 'Platillo de ejemplo', descripcion: 'Reemplaza este producto con el menú real.', precio: 100, disponible: true },
      ],
    },
  ],
}

// ¿Ya hay un logo? (en images/ o fotos-originales/) → paleta automática
const logo = buscarLogo(rutas.images) ?? buscarLogo(rutas.originales)
let notaPaleta = 'paleta por defecto (no hay logo)'
if (logo) {
  const ext = await paletaDesdeLogo(logo)
  const ok = asegurarContraste(ext.primario, ext.secundario)
  base.tema.colorPrimario = ok.primario
  base.tema.colorSecundario = ok.secundario
  notaPaleta = `paleta desde el logo (${ext.fuente}): ${ok.primario} / ${ok.secundario}`
  const destino = path.join(rutas.images, 'logo.webp')
  if (path.resolve(logo) !== path.resolve(destino)) {
    await sharp(logo, { density: 300 }).resize(440, 440, { fit: 'contain', background: '#ffffff' }).extend({ top: 36, bottom: 36, left: 36, right: 36, background: '#ffffff' }).flatten({ background: '#ffffff' }).webp({ quality: 88 }).toFile(destino)
  }
}

guardarJson(rutas, base)
const hizoLogo = await generarLogoIniciales(rutas, base)
await generarPortada(rutas, base)
await generarOg(rutas)

const rel = (p: string) => path.relative(RAIZ, p).replace(/\\/g, '/')
console.log(`
✔ Cliente creado: ${rel(rutas.dir)}/
   restaurant.json   modo demo · ${notaPaleta}
   images/           ${hizoLogo ? `logo de iniciales (${iniciales(nombre)}), ` : 'logo, '}portada abstracta, imagen para compartir
   fotos-originales/ ← pon aquí logo, portada y fotos de platillos (luego: npm run fotos -- ${slug})

Siguientes pasos:
   1. Llena las categorías y productos en ${rel(rutas.json)}
   2. npm run fotos -- ${slug}
   3. npm run dev:client -- ${slug}     (revisar en local)
   4. npm run deploy -- ${slug}         (publicar como ${slug}-demo)
`)
