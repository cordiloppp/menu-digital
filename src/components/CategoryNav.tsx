import { forwardRef, useEffect, useRef } from 'react'
import type { Categoria } from '../data/schema'
import { IconBuscar } from './Icons'

type Props = {
  categorias: Categoria[]
  activo: string
  onSelect: (id: string) => void
  onBuscar: () => void
}

/** Barra sticky con las categorías (scroll horizontal). La categoría visible se resalta sola. */
export const CategoryNav = forwardRef<HTMLDivElement, Props>(function CategoryNav({ categorias, activo, onSelect, onBuscar }, ref) {
  const carril = useRef<HTMLDivElement>(null)

  // Mantiene visible (centrado) el chip de la categoría activa
  useEffect(() => {
    const cont = carril.current
    const chip = cont?.querySelector<HTMLElement>(`[data-id="${activo}"]`)
    if (!cont || !chip) return
    cont.scrollTo({ left: chip.offsetLeft - cont.clientWidth / 2 + chip.clientWidth / 2, behavior: 'smooth' })
  }, [activo])

  return (
    <div ref={ref} className="sticky top-0 z-30 mt-3 border-b border-linea/80 bg-fondo/85 backdrop-blur-xl backdrop-saturate-150">
      <div className="mx-auto flex h-14 max-w-2xl items-center gap-1.5 pl-2">
        <button
          type="button"
          onClick={onBuscar}
          aria-label="Buscar en el menú"
          className="grid h-10 w-10 shrink-0 place-items-center rounded-full text-suave transition active:bg-linea/60"
        >
          <IconBuscar width={19} height={19} />
        </button>
        <nav aria-label="Categorías" className="relative min-w-0 flex-1">
          <div ref={carril} className="sin-scrollbar flex gap-1 overflow-x-auto py-1 pr-8">
            {categorias.map((c) => {
              const on = c.id === activo
              return (
                <button
                  key={c.id}
                  data-id={c.id}
                  type="button"
                  onClick={() => onSelect(c.id)}
                  aria-current={on ? 'true' : undefined}
                  className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold whitespace-nowrap transition-all duration-300 ease-out ${
                    on ? 'bg-tinta text-white shadow-sm' : 'text-suave active:bg-linea/60'
                  }`}
                >
                  {c.nombre}
                </button>
              )
            })}
          </div>
          <div className="pointer-events-none absolute inset-y-0 right-0 w-10 bg-gradient-to-l from-fondo" aria-hidden />
        </nav>
      </div>
    </div>
  )
})
