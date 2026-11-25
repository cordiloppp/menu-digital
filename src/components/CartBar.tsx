import { useCarrito } from '../hooks/useCart'
import { precio } from '../lib/format'

/** Barra flotante inferior: aparece en cuanto hay algo en el carrito. */
export function CartBar({ onAbrir }: { onAbrir: () => void }) {
  const { piezas, total } = useCarrito()
  if (!piezas) return null

  return (
    <div className="pb-seguro animate-subir fixed inset-x-0 bottom-0 z-40 px-4 pt-3">
      <button
        type="button"
        onClick={onAbrir}
        className="mx-auto flex h-14 w-full max-w-lg items-center gap-3 rounded-full bg-marca pr-6 pl-2 font-semibold text-marca-texto shadow-[0_12px_32px_-10px_rgba(0,0,0,0.5)] transition active:scale-[0.98]"
      >
        <span key={piezas} className="animate-pop grid h-10 min-w-10 place-items-center rounded-full bg-black/20 px-2 text-[15px] font-bold tabular-nums">
          {piezas}
        </span>
        <span className="flex-1 text-left">Ver mi pedido</span>
        <span className="tabular-nums">{precio(total)}</span>
      </button>
    </div>
  )
}
