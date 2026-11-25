import { MARCA } from '../config/brand'
import { esDemo, negocio } from '../data'
import { linkWhatsApp } from '../lib/format'

/** Franja superior que solo aparece en modo demo: deja claro que es una vista previa y lleva a tu WhatsApp. */
export function DemoBanner() {
  if (!esDemo) return null
  return (
    <aside aria-label="Vista previa" className="bg-tinta text-white">
      <div className="mx-auto flex max-w-2xl items-center gap-3 px-4 py-2.5">
        <p className="min-w-0 flex-1 text-[12.5px] leading-snug text-white/75">
          Vista previa preparada para <strong className="font-semibold text-white">{negocio.nombre}</strong>
          <span className="text-white/40"> · </span>
          Hecho por <span className="font-medium text-white/90">{MARCA.nombre}</span>
        </p>
        <a
          href={linkWhatsApp(MARCA.whatsapp, MARCA.mensajeDemo.replace('{restaurante}', negocio.nombre))}
          target="_blank"
          rel="noopener"
          className="shrink-0 rounded-full bg-acento px-3.5 py-1.5 text-[12.5px] font-semibold text-acento-texto transition active:scale-95"
        >
          Lo quiero
        </a>
      </div>
    </aside>
  )
}
