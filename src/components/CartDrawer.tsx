import { useEffect, useState, type ReactNode } from 'react'
import { negocio, whatsappDestino } from '../data'
import { useCarrito } from '../hooks/useCart'
import { useOpenStatus } from '../hooks/useOpenStatus'
import { precio } from '../lib/format'
import { linkPedido, type TipoEntrega } from '../lib/whatsapp'
import { DeliveryApps } from './DeliveryApps'
import { IconBolsa, IconCerrar, IconMoto, IconWhatsApp } from './Icons'
import { Sheet } from './Sheet'
import { Stepper } from './Stepper'

const CLAVE_CLIENTE = 'cliente-datos'

/** Recuerda nombre y dirección del cliente para su siguiente pedido (solo en su celular). */
function leerCliente(): { nombre: string; direccion: string } {
  try {
    return { nombre: '', direccion: '', ...JSON.parse(localStorage.getItem(CLAVE_CLIENTE) ?? '{}') }
  } catch {
    return { nombre: '', direccion: '' }
  }
}

const campo =
  'mt-2 w-full rounded-2xl bg-fondo px-4 py-3 text-[16px] ring-1 ring-linea outline-none transition focus:bg-white focus:ring-2 focus:ring-marca'

export function CartDrawer({ onClose }: { onClose: () => void }) {
  const { items, total, cambiarCantidad, vaciar } = useCarrito()
  const estado = useOpenStatus(negocio.horario)
  const { paraLlevar, domicilio, costoEnvio = 0, notaDomicilio, envioPorConfirmar = false } = negocio.entrega

  const [entrega, setEntrega] = useState<TipoEntrega>(paraLlevar ? 'llevar' : 'domicilio')
  const [cliente, setCliente] = useState(leerCliente)
  const [notas, setNotas] = useState('')
  const [conNotas, setConNotas] = useState(false)
  const [intento, setIntento] = useState(false)

  useEffect(() => {
    try {
      localStorage.setItem(CLAVE_CLIENTE, JSON.stringify(cliente))
    } catch {
      /* sin almacenamiento disponible */
    }
  }, [cliente])

  const envioPendiente = entrega === 'domicilio' && envioPorConfirmar
  const envio = entrega === 'domicilio' && !envioPorConfirmar ? costoEnvio : 0
  const faltaDireccion = entrega === 'domicilio' && !cliente.direccion.trim()
  const href = linkPedido({
    negocio: negocio.nombre,
    telefono: whatsappDestino,
    items,
    entrega,
    costoEnvio,
    envioPorConfirmar,
    direccion: cliente.direccion,
    nombre: cliente.nombre,
    notas,
  })

  return (
    <Sheet titulo="Tu pedido" onClose={onClose}>
      {(cerrar) => (
        <>
          <div className="flex items-center justify-between px-5 pt-6 pb-3">
            <h2 className="text-2xl font-bold tracking-tight">Tu pedido</h2>
            <button
              type="button"
              onClick={cerrar}
              aria-label="Cerrar"
              className="grid h-9 w-9 place-items-center rounded-full bg-fondo text-tinta transition active:scale-90"
            >
              <IconCerrar width={18} height={18} />
            </button>
          </div>

          {items.length === 0 ? (
            <div className="px-5 pt-8 pb-14 text-center">
              <p className="font-semibold">Tu pedido está vacío</p>
              <p className="mt-1 text-sm text-suave">Agrega algo del menú para empezar.</p>
              <button type="button" onClick={cerrar} className="mt-5 rounded-full bg-marca px-6 py-3 font-semibold text-marca-texto">
                Ver el menú
              </button>
            </div>
          ) : (
            <>
              <div className="overflow-y-auto overscroll-contain px-5 pb-6">
                {/* 1. Productos */}
                <ul className="divide-y divide-linea">
                  {items.map((i) => (
                    <li key={i.key} className="flex items-center gap-3 py-3.5">
                      <div className="min-w-0 flex-1">
                        <p className="leading-snug font-semibold">{i.nombre}</p>
                        {(i.variante || i.notas) && (
                          <p className="mt-0.5 text-[13px] text-suave">{[i.variante, i.notas && `“${i.notas}”`].filter(Boolean).join(' · ')}</p>
                        )}
                        <p className="mt-1 text-sm font-semibold tabular-nums">{precio(i.precioUnitario * i.cantidad)}</p>
                      </div>
                      <Stepper pequeno valor={i.cantidad} onChange={(n) => cambiarCantidad(i.key, n)} etiqueta={`Cantidad de ${i.nombre}`} />
                    </li>
                  ))}
                </ul>
                <button type="button" onClick={cerrar} className="mt-1 text-sm font-semibold text-marca">
                  + Agregar más
                </button>

                {/* 2. Entrega */}
                {paraLlevar && domicilio && (
                  <fieldset className="mt-7">
                    <legend className="text-sm font-semibold">¿Cómo lo quieres?</legend>
                    <div className="mt-2.5 grid grid-cols-2 gap-2">
                      <OpcionEntrega activa={entrega === 'llevar'} onClick={() => setEntrega('llevar')} icono={<IconBolsa />} titulo="Para llevar" sub="Paso a recoger" />
                      <OpcionEntrega
                        activa={entrega === 'domicilio'}
                        onClick={() => setEntrega('domicilio')}
                        icono={<IconMoto />}
                        titulo="A domicilio"
                        sub={envioPorConfirmar ? 'Envío por confirmar' : costoEnvio ? `Envío ${precio(costoEnvio)}` : 'Envío gratis'}
                      />
                    </div>
                  </fieldset>
                )}

                {entrega === 'domicilio' && (
                  <label className="animate-aparecer mt-5 block">
                    <span className="text-sm font-semibold">Dirección de entrega</span>
                    <textarea
                      value={cliente.direccion}
                      onChange={(e) => setCliente((c) => ({ ...c, direccion: e.target.value }))}
                      rows={2}
                      autoComplete="street-address"
                      placeholder="Calle, número, colonia y una referencia"
                      aria-invalid={intento && faltaDireccion}
                      className={`${campo} resize-none ${intento && faltaDireccion ? 'ring-2 ring-red-500' : ''}`}
                    />
                    {intento && faltaDireccion && <span className="mt-1.5 block text-sm font-medium text-red-600">Escribe tu dirección para el envío</span>}
                    {notaDomicilio && <span className="mt-1.5 block text-xs text-suave">{notaDomicilio}</span>}
                  </label>
                )}

                {/* 3. Datos opcionales */}
                <label className="mt-5 block">
                  <span className="text-sm font-semibold">
                    Tu nombre <span className="font-normal text-suave">(opcional)</span>
                  </span>
                  <input
                    type="text"
                    value={cliente.nombre}
                    onChange={(e) => setCliente((c) => ({ ...c, nombre: e.target.value }))}
                    autoComplete="given-name"
                    placeholder="Para saber de quién es el pedido"
                    className={campo}
                  />
                </label>

                {conNotas ? (
                  <label className="animate-aparecer mt-5 block">
                    <span className="text-sm font-semibold">Notas del pedido</span>
                    <textarea
                      value={notas}
                      onChange={(e) => setNotas(e.target.value)}
                      rows={2}
                      autoFocus
                      placeholder="Ej. pago con $500, salsas extra"
                      className={`${campo} resize-none`}
                    />
                  </label>
                ) : (
                  <button type="button" onClick={() => setConNotas(true)} className="mt-4 block text-sm font-semibold text-marca">
                    + Agregar notas (cambio, salsas, etc.)
                  </button>
                )}

                {estado && !estado.abierto && (
                  <p className="mt-6 rounded-2xl bg-amber-50 px-4 py-3 text-sm leading-relaxed text-amber-900">
                    <strong className="font-semibold">Ahorita estamos cerrados.</strong> {estado.detalle}. Puedes enviar tu pedido y te respondemos al abrir.
                  </p>
                )}

                <button type="button" onClick={vaciar} className="mt-6 text-[13px] text-suave underline underline-offset-4">
                  Vaciar pedido
                </button>
              </div>

              {/* Total y envío */}
              <div className="pb-seguro border-t border-linea bg-white px-5 pt-3.5">
                <dl className="space-y-1 text-sm">
                  {(envio > 0 || envioPendiente) && (
                    <>
                      <div className="flex justify-between text-suave">
                        <dt>Subtotal</dt>
                        <dd className="tabular-nums">{precio(total)}</dd>
                      </div>
                      <div className="flex justify-between text-suave">
                        <dt>Envío</dt>
                        <dd className="tabular-nums">{envioPendiente ? 'Por confirmar' : precio(envio)}</dd>
                      </div>
                    </>
                  )}
                  <div className="flex items-baseline justify-between">
                    <dt className="font-semibold">Total</dt>
                    <dd className="text-xl font-bold tabular-nums">
                      {precio(total + envio)}
                      {envioPendiente && <span className="ml-1 text-xs font-normal text-suave">+ envío</span>}
                    </dd>
                  </div>
                </dl>
                <a
                  href={faltaDireccion ? undefined : href}
                  target="_blank"
                  rel="noopener"
                  role="button"
                  onClick={(e) => {
                    if (faltaDireccion) {
                      e.preventDefault()
                      setIntento(true)
                    }
                  }}
                  className="mt-3 flex h-14 items-center justify-center gap-2.5 rounded-full bg-[#1fa855] text-[17px] font-semibold text-white shadow-md transition active:scale-[0.98]"
                >
                  <IconWhatsApp width={22} height={22} />
                  Enviar pedido por WhatsApp
                </a>
                <p className="mt-2 text-center text-xs text-suave">Se abrirá WhatsApp con tu pedido listo para enviar.</p>
                <DeliveryApps centrado className="mt-3 border-t border-linea pt-3" />
              </div>
            </>
          )}
        </>
      )}
    </Sheet>
  )
}

function OpcionEntrega(props: { activa: boolean; onClick: () => void; icono: ReactNode; titulo: string; sub: string }) {
  return (
    <button
      type="button"
      onClick={props.onClick}
      aria-pressed={props.activa}
      className={`flex items-center gap-3 rounded-2xl p-3.5 text-left ring-1 transition duration-200 ${
        props.activa ? 'bg-marca/[0.06] ring-2 ring-marca' : 'ring-linea'
      }`}
    >
      <span className={`transition-colors ${props.activa ? 'text-marca' : 'text-suave'}`}>{props.icono}</span>
      <span>
        <span className="block text-sm font-semibold">{props.titulo}</span>
        <span className="block text-xs text-suave">{props.sub}</span>
      </span>
    </button>
  )
}
