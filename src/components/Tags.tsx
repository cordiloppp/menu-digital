import type { Etiqueta } from '../data/schema'

/** Etiquetas discretas: píldora clara con punto de color. */
const ESTILO: Record<Etiqueta, { texto: string; punto: string }> = {
  'mas-vendido': { texto: 'Más vendido', punto: 'bg-acento' },
  picante: { texto: 'Picante', punto: 'bg-red-600' },
  nuevo: { texto: 'Nuevo', punto: 'bg-sky-600' },
  vegetariano: { texto: 'Vegetariano', punto: 'bg-emerald-600' },
}

export function Tags({ etiquetas, className = '' }: { etiquetas?: Etiqueta[]; className?: string }) {
  if (!etiquetas?.length) return null
  return (
    <ul className={`flex flex-wrap gap-1.5 ${className}`}>
      {etiquetas.map((e) => (
        <li key={e} className="inline-flex items-center gap-1.5 rounded-full bg-fondo px-2 py-0.5 text-[11.5px] font-medium text-suave ring-1 ring-linea/70">
          <span className={`h-1.5 w-1.5 rounded-full ${ESTILO[e].punto}`} aria-hidden />
          {ESTILO[e].texto}
        </li>
      ))}
    </ul>
  )
}
