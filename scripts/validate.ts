import { clienteExistente } from './cliente.ts'
import { formatearErrores, validarRestaurante } from './validar-datos.ts'

// npm run validar -- <slug>
const rutas = clienteExistente()
const res = validarRestaurante(rutas)
if (!res.ok) {
  console.error(formatearErrores(res.errores, rutas))
  process.exit(1)
}
const productos = res.data.categorias.reduce((n, c) => n + c.productos.length, 0)
console.log(`✔ ${rutas.slug}: "${res.data.negocio.nombre}" (modo ${res.data.mode}) — ${res.data.categorias.length} categorías, ${productos} productos.`)
