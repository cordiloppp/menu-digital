import { useState } from 'react'
import type { TipoPlatillo } from '../data/schema'
import { PlatilloIcono } from './PlatilloIcono'

type Props = { src?: string; alt: string; tipo?: TipoPlatillo; className?: string; eager?: boolean; zoom?: boolean }

/**
 * Foto del producto: un destello suave mientras carga y un fundido al terminar.
 * Si no hay foto, muestra un ícono genérico del tipo de platillo.
 */
export function ProductImage({ src, alt, tipo, className = '', eager, zoom }: Props) {
  const [lista, setLista] = useState(false)

  if (!src)
    return (
      <div className={`grid place-items-center bg-gradient-to-br from-marca/[0.08] to-acento/[0.16] text-marca/60 ${className}`} aria-hidden>
        <PlatilloIcono tipo={tipo} className="h-[42%] w-[42%]" />
      </div>
    )

  return (
    <div className={`overflow-hidden ${lista ? 'bg-linea/70' : 'esqueleto'} ${className}`}>
      <img
        src={src}
        alt={alt}
        width={600}
        height={600}
        loading={eager ? 'eager' : 'lazy'}
        decoding="async"
        onLoad={() => setLista(true)}
        ref={(img) => {
          if (img?.complete && img.naturalWidth) setLista(true)
        }}
        data-lista={lista || undefined}
        className={`foto h-full w-full object-cover ${zoom ? 'transition-transform duration-700 ease-suave group-hover:scale-[1.06]' : ''}`}
      />
    </div>
  )
}
