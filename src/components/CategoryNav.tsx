import { forwardRef, useEffect, useLayoutEffect, useRef, useState } from 'react'
import type { Categoria } from '../data/schema'
import { IconBuscar } from './Icons'

type Props = {
  categorias: Categoria[]
  activo: string
  onSelect: (id: string) => void
  onBuscar: () => void
}

/** Barra sticky con las categorías. Un indicador se desliza hasta la categoría visible. */
export const CategoryNav = forwardRef<HTMLDivElement, Props>(function CategoryNav({ categorias, activo, onSelect, onBuscar }, ref) {
  const carril = useRef<HTMLDivElement>(null)
  const [indicador, setIndicador] = useState<{ x: number; w: number } | null>(null)

  // Posición y ancho del indicador según el chip activo (también al cambiar el tamaño de la pantalla)
  useLayoutEffect(() => {
    const medir = () => {
      const chip = carril.current?.querySelector<HTMLElement>(`[data-id="${activo}"]`)
      setIndicador(chip ? { x: chip.offsetLeft, w: chip.offsetWidth } : null)
    }
    medir()
    window.addEventListener('resize', medir)
    return () => window.removeEventListener('resize', medir)
  }, [activo, categorias])

  // Mantiene visible (centrado) el chip de la categoría activa
  useEffect(() => {
    const cont = carril.current
    const chip = cont?.querySelector<HTMLElement>(`[data-id="${activo}"]`)
    if (!cont || !chip) return
    cont.scrollTo({ left: chip.offsetLeft - cont.clientWidth / 2 + chip.clientWidth / 2, behavior: 'smooth' })
  }, [activo])

  return (
    <div ref={ref} className="sticky top-0 z-30 mt-4 border-b border-linea/80 bg-fondo/85 backdrop-blur-xl backdrop-saturate-150">
      <div className="mx-auto flex h-15 max-w-6xl items-center gap-1.5 pl-2 md:pl-6">
        <button
          type="button"
          onClick={onBuscar}
          aria-label="Buscar en el menú"
          className="grid h-10 w-10 shrink-0 place-items-center rounded-full text-suave transition-colors hover:bg-linea/60 hover:text-tinta"
        >
          <IconBuscar width={19} height={19} />
        </button>
        <nav aria-label="Categorías" className="relative min-w-0 flex-1">
          <div ref={carril} className="sin-scrollbar relative flex gap-1 overflow-x-auto py-1 pr-8">
            {indicador && (
              <span
                aria-hidden
                className="absolute top-1 left-0 h-9 rounded-full bg-tinta shadow-sm transition-[transform,width] duration-400 ease-suave"
                style={{ transform: `translateX(${indicador.x}px)`, width: indicador.w }}
              />
            )}
            {categorias.map((c) => {
              const on = c.id === activo
              return (
                <button
                  key={c.id}
                  data-id={c.id}
                  type="button"
                  onClick={() => onSelect(c.id)}
                  aria-current={on ? 'true' : undefined}
                  className={`relative h-9 shrink-0 rounded-full px-4 text-sm font-semibold whitespace-nowrap transition-colors duration-300 ${
                    on ? 'text-white' : 'text-suave hover:text-tinta'
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
