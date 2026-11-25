import { useState } from 'react'
import { sinFotoTexto } from '../data'
import type { Producto, TipoPlatillo } from '../data/schema'
import { useCarrito } from '../hooks/useCart'
import { precio } from '../lib/format'
import { IconCerrar } from './Icons'
import { ProductImage } from './ProductImage'
import { Sheet } from './Sheet'
import { Stepper } from './Stepper'
import { Tags } from './Tags'

type Props = { producto: Producto; tipo?: TipoPlatillo; onClose: () => void }

export function ProductSheet({ producto: p, tipo, onClose }: Props) {
  const { agregar } = useCarrito()
  const [variante, setVariante] = useState(0)
  const [cantidad, setCantidad] = useState(1)
  const [notas, setNotas] = useState('')
  const [conNota, setConNota] = useState(false)

  const v = p.variantes?.[variante]
  const unitario = v?.precio ?? p.precio
  const soloTexto = !p.foto && sinFotoTexto

  return (
    <Sheet titulo={p.nombre} onClose={onClose}>
      {(cerrar) => (
        <>
          <div className="overflow-y-auto overscroll-contain">
            <div className={soloTexto ? 'relative h-14' : 'relative'}>
              {!soloTexto && <ProductImage src={p.foto} alt={p.nombre} tipo={tipo} eager className="aspect-[4/3] max-h-[42dvh] w-full" />}
              <button
                type="button"
                onClick={cerrar}
                aria-label="Cerrar"
                className="absolute top-4 right-4 grid h-9 w-9 place-items-center rounded-full bg-white/90 text-tinta shadow-md backdrop-blur transition active:scale-90"
              >
                <IconCerrar width={18} height={18} />
              </button>
            </div>

            <div className={`px-5 pb-6 ${soloTexto ? 'pt-1' : 'pt-5'}`}>
              <h2 className="text-2xl leading-tight font-bold tracking-tight">{p.nombre}</h2>
              <Tags etiquetas={p.etiquetas} className="mt-2" />
              {p.descripcion && <p className="mt-2.5 leading-relaxed text-suave">{p.descripcion}</p>}
              {!p.variantes && <p className="mt-3 text-xl font-semibold tabular-nums">{precio(p.precio)}</p>}

              {p.variantes && (
                <fieldset className="mt-6">
                  <legend className="text-sm font-semibold">Elige una opción</legend>
                  <div className="mt-2.5 grid gap-2">
                    {p.variantes.map((op, i) => {
                      const on = variante === i
                      return (
                        <label
                          key={op.nombre}
                          className={`flex cursor-pointer items-center gap-3 rounded-2xl px-4 py-3.5 ring-1 transition duration-200 ${
                            on ? 'bg-marca/[0.06] ring-2 ring-marca' : 'ring-linea'
                          }`}
                        >
                          <input type="radio" name="variante" checked={on} onChange={() => setVariante(i)} className="sr-only" />
                          <span
                            className={`grid h-5 w-5 shrink-0 place-items-center rounded-full ring-2 transition ${on ? 'ring-marca' : 'ring-linea'}`}
                            aria-hidden
                          >
                            <span className={`h-2.5 w-2.5 rounded-full bg-marca transition-transform duration-200 ${on ? 'scale-100' : 'scale-0'}`} />
                          </span>
                          <span className="flex-1 font-medium">{op.nombre}</span>
                          <span className="font-semibold tabular-nums">{precio(op.precio)}</span>
                        </label>
                      )
                    })}
                  </div>
                </fieldset>
              )}

              {conNota ? (
                <label className="animate-aparecer mt-6 block">
                  <span className="text-sm font-semibold">Instrucciones</span>
                  <input
                    type="text"
                    value={notas}
                    onChange={(e) => setNotas(e.target.value)}
                    maxLength={120}
                    autoFocus
                    placeholder="Ej. sin cebolla, salsa aparte"
                    className="mt-2 w-full rounded-2xl bg-fondo px-4 py-3 text-[16px] ring-1 ring-linea outline-none focus:bg-white focus:ring-2 focus:ring-marca"
                  />
                </label>
              ) : (
                <button type="button" onClick={() => setConNota(true)} className="mt-6 text-sm font-semibold text-marca">
                  + Agregar instrucciones (sin cebolla, etc.)
                </button>
              )}
            </div>
          </div>

          <div className="pb-seguro flex items-center gap-3 border-t border-linea bg-white px-5 pt-3">
            <Stepper valor={cantidad} min={1} onChange={setCantidad} />
            <button
              type="button"
              onClick={() => {
                agregar({ productoId: p.id, nombre: p.nombre, variante: v?.nombre, precioUnitario: unitario, cantidad, notas: notas.trim() || undefined })
                cerrar()
              }}
              className="flex h-12 flex-1 items-center justify-between rounded-full bg-marca px-5 font-semibold text-marca-texto shadow-md transition active:scale-[0.98]"
            >
              <span>Agregar</span>
              <span className="tabular-nums">{precio(unitario * cantidad)}</span>
            </button>
          </div>
        </>
      )}
    </Sheet>
  )
}
