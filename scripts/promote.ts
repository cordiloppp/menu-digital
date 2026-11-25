/**
 * npm run promote -- <slug>
 *
 * El prospecto compró: cambia el cliente a modo "cliente" (sin franja de demo, pedidos al WhatsApp
 * del negocio, indexable en Google) y lo publica como proyecto <slug> → <slug>.vercel.app.
 * El demo anterior (<slug>-demo) sigue existiendo hasta que lo borres en Vercel.
 */
import { clienteExistente, guardarJson, leerJson } from './cliente.ts'
import { desplegar } from './deploy.ts'

const rutas = clienteExistente()
const r = leerJson(rutas)

if (!r.negocio.whatsapp) {
  console.error(`\n✖ Falta negocio.whatsapp en clients/${rutas.slug}/restaurant.json.`)
  console.error('  En modo cliente los pedidos llegan al WhatsApp del negocio: agrégalo (52 + 10 dígitos) y vuelve a correr promote.\n')
  process.exit(1)
}

const urlDemo = r.sitio.url
r.mode = 'cliente'
r.sitio.url = `https://${rutas.slug}.vercel.app`
guardarJson(rutas, r)
console.log(`\n⭐ ${r.negocio.nombre}: modo demo → cliente`)

try {
  const final = await desplegar(rutas)
  console.log('   Pendientes:')
  console.log(`   • Generar el QR definitivo: npm run qr -- ${rutas.slug}`)
  console.log(`   • El demo sigue en ${urlDemo}. Puedes borrarlo en vercel.com si ya no lo necesitas.`)
  if (r.sitio.creditosFotos) console.log('   • Este cliente usa fotos de referencia con créditos: cámbialas por fotos propias del negocio.')
  console.log(`\n   URL final para el cliente: ${final}\n`)
} catch (e) {
  console.error(`\n✖ ${(e as Error).message}\n`)
  process.exit(1)
}
