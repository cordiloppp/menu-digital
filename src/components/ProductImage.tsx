import { useState } from 'react'
import type { TipoPlatillo } from '../data/schema'
import { PlatilloIcono } from './PlatilloIcono'

type Props = { src?: string; alt: string; tipo?: TipoPlatillo; className?: string; eager?: boolean }

/** Foto del producto con fundido al cargar. Si no hay foto, muestra un ícono genérico del tipo de platillo. */
export function ProductImage({ src, alt, tipo, className = '', eager }: Props) {
  const [lista, setLista] = useState(false)

  if (!src)
    return (
      <div className={`grid place-items-center bg-gradient-to-br from-marca/[0.07] to-acento/[0.12] text-marca/55 ${className}`} aria-hidden>
        <PlatilloIcono tipo={tipo} className="h-[42%] w-[42%]" />
      </div>
    )

  return (
    <div className={`overflow-hidden bg-linea/70 ${className}`}>
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
        className="foto h-full w-full object-cover"
      />
    </div>
  )
}
