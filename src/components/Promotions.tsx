import { promociones } from '../data'
import type { Dia } from '../data/schema'
import { ahoraEnTijuana, DIAS, NOMBRE_DIA } from '../lib/hours'

function diasTexto(dias: Dia[]): string {
  if (dias.length === 7) return 'Todos los días'
  const n = dias.map((d) => NOMBRE_DIA[d])
  return n.length === 1 ? `Cada ${n[0].toLowerCase()}` : `${n.slice(0, -1).join(', ')} y ${n[n.length - 1]}`
}

export function Promotions() {
  if (!promociones.length) return null
  const hoy = DIAS[ahoraEnTijuana().dia]
  // Las promociones de hoy van primero
  const lista = [...promociones].sort((a, b) => Number(!!b.dias?.includes(hoy)) - Number(!!a.dias?.includes(hoy)))

  return (
    <section aria-label="Promociones" className="mx-auto mt-6 max-w-2xl">
      <h2 className="px-4 text-xs font-semibold tracking-[0.14em] text-suave uppercase">Promociones</h2>
      <div className="sin-scrollbar mt-2.5 flex snap-x snap-mandatory scroll-px-4 gap-3 overflow-x-auto px-4 pb-1">
        {lista.map((p) => {
          const esHoy = p.dias?.includes(hoy)
          return (
            <article
              key={p.id}
              className={`relative w-[80%] max-w-sm shrink-0 snap-start overflow-hidden rounded-3xl bg-tinta p-5 text-white ${lista.length === 1 ? 'w-full' : ''}`}
            >
              {/* brillo sutil con el color de la marca */}
              <div className="absolute -top-16 -right-16 h-44 w-44 rounded-full bg-marca opacity-50 blur-3xl" aria-hidden />
              <div className="relative">
                <div className="flex items-center gap-2 text-[11px] font-semibold tracking-[0.12em] text-acento uppercase">
                  {p.dias ? diasTexto(p.dias) : 'Promoción'}
                  {esHoy && <span className="rounded-full bg-acento px-2 py-0.5 text-[10px] font-bold tracking-wider text-acento-texto">HOY</span>}
                </div>
                <h3 className="mt-2 text-xl leading-snug font-bold">{p.titulo}</h3>
                {p.descripcion && <p className="mt-1.5 text-sm leading-relaxed text-white/70">{p.descripcion}</p>}
              </div>
            </article>
          )
        })}
      </div>
    </section>
  )
}
