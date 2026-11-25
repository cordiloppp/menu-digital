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
    <section aria-labelledby="t-promos" className="mx-auto mt-8 max-w-6xl md:mt-10">
      <h2 id="t-promos" className="px-4 text-xl font-bold tracking-tight md:px-8 md:text-2xl">
        Promociones
      </h2>
      {/* Carrusel en celular, rejilla completa desde tableta */}
      <div className="sin-scrollbar mt-3 flex snap-x snap-mandatory scroll-px-4 gap-3 overflow-x-auto px-4 pb-1 md:grid md:grid-cols-2 md:overflow-visible md:px-8 lg:grid-cols-3">
        {lista.map((p, i) => {
          const esHoy = p.dias?.includes(hoy)
          return (
            <article
              key={p.id}
              style={{ animationDelay: `${i * 70}ms` }}
              className={`animate-entrar relative w-[82%] max-w-sm shrink-0 snap-start overflow-hidden rounded-3xl p-5 md:w-auto md:max-w-none ${
                esHoy ? 'bg-marca text-marca-texto' : 'bg-tinta text-white'
              } ${lista.length === 1 ? 'w-full' : ''}`}
            >
              <div className="flex items-center gap-2 text-[12.5px] font-semibold opacity-85">
                {p.dias ? diasTexto(p.dias) : 'Promoción'}
                {esHoy && <span className="rounded-full bg-acento px-2 py-0.5 text-[11px] font-bold text-acento-texto">Hoy</span>}
              </div>
              <h3 className="mt-2 text-xl leading-snug font-bold md:text-[1.35rem]">{p.titulo}</h3>
              {p.descripcion && <p className="mt-1.5 text-sm leading-relaxed opacity-75">{p.descripcion}</p>}
            </article>
          )
        })}
      </div>
    </section>
  )
}
