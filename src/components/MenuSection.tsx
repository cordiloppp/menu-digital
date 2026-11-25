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
    <section id={categoria.id} aria-labelledby={`t-${categoria.id}`} className="pt-8">
      <div className="mb-3.5 flex items-baseline justify-between">
        <h2 id={`t-${categoria.id}`} className="text-[1.6rem] font-bold tracking-tight">
          {categoria.nombre}
        </h2>
        <span className="text-xs text-suave">
          {productos.length} {productos.length === 1 ? 'opción' : 'opciones'}
        </span>
      </div>
      <ul className="grid gap-3 sm:grid-cols-2">
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
