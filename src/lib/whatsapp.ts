import { precio, linkWhatsApp } from './format'

export type ItemCarrito = {
  key: string
  productoId: string
  nombre: string
  variante?: string
  precioUnitario: number
  cantidad: number
  notas?: string
}

export type TipoEntrega = 'llevar' | 'domicilio'

export type DatosPedido = {
  negocio: string
  telefono: string
  items: ItemCarrito[]
  entrega: TipoEntrega
  costoEnvio: number
  /** El costo de envío se acuerda por WhatsApp: el mensaje dice "Envío: por confirmar" */
  envioPorConfirmar?: boolean
  direccion: string
  nombre: string
  notas: string
}

export const subtotal = (items: ItemCarrito[]) => items.reduce((s, i) => s + i.precioUnitario * i.cantidad, 0)

/** Arma el texto del pedido con formato de WhatsApp (*negritas*, _cursivas_). */
export function mensajePedido(p: DatosPedido): string {
  const sub = subtotal(p.items)
  const aDomicilio = p.entrega === 'domicilio'
  const porConfirmar = aDomicilio && !!p.envioPorConfirmar
  const envio = aDomicilio && !porConfirmar ? p.costoEnvio : 0
  const l: string[] = [`¡Hola ${p.negocio}! 👋 Quiero hacer un pedido:`, '']

  for (const i of p.items) {
    l.push(`• ${i.cantidad}× ${i.nombre}${i.variante ? ` (${i.variante})` : ''} — ${precio(i.precioUnitario * i.cantidad)}`)
    if (i.notas) l.push(`   _Nota: ${i.notas}_`)
  }

  l.push('')
  if (porConfirmar) l.push(`Subtotal: ${precio(sub)}`, 'Envío: por confirmar')
  else if (envio > 0) l.push(`Subtotal: ${precio(sub)}`, `Envío: ${precio(envio)}`)
  l.push(`*Total: ${precio(sub + envio)} MXN*${porConfirmar ? ' + envío' : ''}`, '')

  if (p.entrega === 'domicilio') {
    l.push('🛵 *A domicilio*')
    if (p.direccion.trim()) l.push(`📍 ${p.direccion.trim()}`)
  } else {
    l.push('🛍️ *Para llevar* (paso a recoger)')
  }
  if (p.notas.trim()) l.push(`📝 Notas: ${p.notas.trim()}`)
  if (p.nombre.trim()) l.push(`👤 Nombre: ${p.nombre.trim()}`)

  return l.join('\n')
}

export const linkPedido = (p: DatosPedido) => linkWhatsApp(p.telefono, mensajePedido(p))
