import { negocio, whatsappDestino } from '../data'
import { useCarrito } from '../hooks/useCart'
import { linkWhatsApp } from '../lib/format'
import { IconWhatsApp } from './Icons'

/** Botón flotante para preguntas. Se oculta cuando aparece la barra del pedido, para no saturar la pantalla. */
export function WhatsAppFab() {
  const { piezas } = useCarrito()
  return (
    <a
      href={linkWhatsApp(whatsappDestino, `¡Hola ${negocio.nombre}! Tengo una pregunta:`)}
      target="_blank"
      rel="noopener"
      aria-label="Escríbenos por WhatsApp"
      aria-hidden={piezas > 0 || undefined}
      tabIndex={piezas > 0 ? -1 : undefined}
      className={`fixed left-4 bottom-[calc(1.25rem+env(safe-area-inset-bottom))] z-40 grid h-13 w-13 place-items-center rounded-full bg-[#25D366] text-white shadow-[0_10px_28px_-8px_rgba(0,0,0,0.45)] transition-all duration-300 ease-out active:scale-90 ${
        piezas ? 'pointer-events-none translate-y-4 scale-75 opacity-0' : ''
      }`}
    >
      <IconWhatsApp width={26} height={26} />
    </a>
  )
}
