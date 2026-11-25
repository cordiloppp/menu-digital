import { sinFotoTexto } from '../data'
import type { Producto, TipoPlatillo } from '../data/schema'
import { precio } from '../lib/format'
import { IconMas } from './Icons'
import { ProductImage } from './ProductImage'
import { Tags } from './Tags'

type Props = {
  producto: Producto
  tipo?: TipoPlatillo
  enCarrito: number
  onAbrir: () => void
  onAgregarRapido: () => void
}

export function ProductCard({ producto: p, tipo, enCarrito, onAbrir, onAgregarRapido }: Props) {
  const agotado = !p.disponible
  const desde = p.variantes ? Math.min(...p.variantes.map((v) => v.precio)) : p.precio
  // Sin foto y con tema.sinFoto = "texto": tarjeta solo de texto (sin ícono genérico)
  const soloTexto = !p.foto && sinFotoTexto

  return (
    <li className="revelar group relative h-full">
      <button
        type="button"
        onClick={onAbrir}
        disabled={agotado}
        className={`sombra-suave flex h-full w-full gap-4 rounded-[22px] bg-white p-3 pl-4 text-left ring-1 ring-linea/60 transition-[box-shadow,transform] duration-300 ease-suave hover:sombra-elevada active:scale-[0.985] disabled:cursor-not-allowed ${
          soloTexto ? 'min-h-[5.5rem] pr-14' : ''
        } ${agotado ? 'opacity-80' : ''}`}
      >
        <div className="flex min-w-0 flex-1 flex-col py-1">
          <h3 className={`text-[16.5px] leading-snug font-semibold ${agotado ? 'text-suave' : ''}`}>{p.nombre}</h3>
          {p.descripcion && <p className="mt-1 line-clamp-2 text-[13.5px] leading-snug text-suave">{p.descripcion}</p>}
          <Tags etiquetas={p.etiquetas} className="mt-2.5" />
          <p className={`mt-auto pt-3 text-[16px] font-bold tabular-nums ${agotado ? 'text-suave line-through' : 'text-tinta'}`}>
            {p.variantes && <span className="mr-1 text-xs font-medium text-suave">desde</span>}
            {precio(desde)}
          </p>
        </div>
        {!soloTexto && (
          <div className="relative shrink-0">
            <ProductImage
              src={p.foto}
              alt={p.nombre}
              tipo={tipo}
              zoom={!agotado}
              className={`h-28 w-28 rounded-2xl sm:h-32 sm:w-32 ${agotado ? 'grayscale' : ''}`}
            />
            {agotado && (
              <span className="absolute inset-0 grid place-items-center rounded-2xl bg-white/40">
                <span className="rounded-full bg-tinta px-3 py-1 text-[11px] font-semibold text-white">Agotado</span>
              </span>
            )}
          </div>
        )}
        {soloTexto && agotado && (
          <span className="absolute top-3 right-3 rounded-full bg-tinta px-2.5 py-1 text-[11px] font-semibold text-white">Agotado</span>
        )}
      </button>

      {!agotado && (
        <button
          type="button"
          onClick={p.variantes ? onAbrir : onAgregarRapido}
          aria-label={`Agregar ${p.nombre}${enCarrito ? ` (llevas ${enCarrito})` : ''}`}
          // Anclado a la esquina inferior de la FOTO (top fijo), no de la tarjeta: así no se mueve si el texto ocupa más líneas
          className={`absolute ${soloTexto ? 'right-3 bottom-3' : 'top-[92px] right-2 sm:top-[108px]'} grid h-9 min-w-9 place-items-center rounded-full px-2 text-sm font-bold shadow-md ring-[3px] ring-white transition-[background-color,color,transform] duration-200 hover:scale-105 active:scale-90 ${
            enCarrito ? 'bg-marca text-marca-texto' : 'bg-white text-tinta hover:bg-tinta hover:text-white'
          }`}
        >
          {enCarrito > 0 ? (
            <span key={enCarrito} className="animate-pop tabular-nums">
              {enCarrito}
            </span>
          ) : (
            <IconMas width={18} height={18} strokeWidth={2.4} />
          )}
        </button>
      )}
    </li>
  )
}
