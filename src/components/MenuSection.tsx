import type { Categoria, Producto } from '../data/schema'
import { ProductCard } from './ProductCard'

type Props = {
  categoria: Categoria
  productos: Producto[]
  cantidades: Record<string, number>
  onAbrir: (p: Producto, c: Categoria) => void
  onAgregarRapido: (p: Producto) => void
}

export function MenuSection({ categoria, productos, cantidades, onAbrir, onAgregarRapido }: Props) {
  return (
    <section id={categoria.id} aria-labelledby={`t-${categoria.id}`} className="pt-10 md:pt-14">
      <div className="mb-4 flex items-baseline gap-3 md:mb-5">
        <h2 id={`t-${categoria.id}`} className="text-[1.65rem] font-bold tracking-tight md:text-[2rem]">
          {categoria.nombre}
        </h2>
        <span className="h-px flex-1 translate-y-[-0.3em] bg-linea" aria-hidden />
        <span className="text-[13px] text-suave tabular-nums">
          {productos.length} {productos.length === 1 ? 'opción' : 'opciones'}
        </span>
      </div>
      <ul className="grid gap-3 sm:grid-cols-2 md:gap-4 xl:grid-cols-3">
        {productos.map((p) => (
          <ProductCard
            key={p.id}
            producto={p}
            tipo={p.tipo ?? categoria.tipo}
            enCarrito={cantidades[p.id] ?? 0}
            onAbrir={() => onAbrir(p, categoria)}
            onAgregarRapido={() => onAgregarRapido(p)}
          />
        ))}
      </ul>
    </section>
  )
}
