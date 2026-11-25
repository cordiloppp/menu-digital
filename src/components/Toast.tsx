import { useCarrito } from '../hooks/useCart'

/** Aviso breve "Agregado: …" que confirma cada producto añadido. */
export function Toast() {
  const { aviso, piezas } = useCarrito()
  if (!aviso) return null
  return (
    <div
      key={aviso.id}
      role="status"
      aria-live="polite"
      className={`animate-toast pointer-events-none fixed left-1/2 z-40 flex max-w-[90vw] items-center gap-2 rounded-full bg-tinta px-4 py-2.5 text-sm font-medium whitespace-nowrap text-white shadow-lg ${
        piezas ? 'bottom-[calc(5.75rem+env(safe-area-inset-bottom))]' : 'bottom-6'
      }`}
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="shrink-0 text-acento" aria-hidden>
        <path d="M5 12.5l4.5 4.5L19 7.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <span className="truncate">Agregado: {aviso.texto}</span>
    </div>
  )
}
