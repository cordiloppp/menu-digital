import { forwardRef } from 'react'
import { IconBuscar, IconCerrar } from './Icons'

type Props = { valor: string; onChange: (q: string) => void }

/** Buscador siempre visible arriba del menú. */
export const SearchBar = forwardRef<HTMLInputElement, Props>(function SearchBar({ valor, onChange }, ref) {
  return (
    <div className="mx-auto mt-6 max-w-2xl px-4">
      <label className="flex items-center gap-2.5 rounded-2xl bg-white px-4 py-3 ring-1 ring-linea transition focus-within:ring-2 focus-within:ring-marca">
        <IconBuscar width={19} height={19} className="shrink-0 text-suave" />
        <input
          ref={ref}
          type="search"
          value={valor}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Escape') onChange('')
            if (e.key === 'Enter') (e.target as HTMLInputElement).blur()
          }}
          placeholder="¿Qué se te antoja?"
          aria-label="Buscar en el menú"
          enterKeyHint="search"
          autoComplete="off"
          className="w-full bg-transparent text-[16px] outline-none placeholder:text-suave/80 [&::-webkit-search-cancel-button]:hidden"
        />
        {valor && (
          <button
            type="button"
            onClick={() => onChange('')}
            aria-label="Borrar búsqueda"
            className="animate-aparecer -mr-1 grid h-7 w-7 shrink-0 place-items-center rounded-full bg-fondo text-suave"
          >
            <IconCerrar width={15} height={15} />
          </button>
        )}
      </label>
    </div>
  )
})
