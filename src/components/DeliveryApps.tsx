import { deliveryApps } from '../data'
import type { AppDelivery } from '../data/schema'

/** Nombre visible y color de marca de cada app (insignia con la inicial, para no competir con WhatsApp) */
const APPS: Record<AppDelivery['app'], { nombre: string; color: string; letra: string }> = {
  didi: { nombre: 'DiDi Food', color: '#FF6A13', letra: 'D' },
  rappi: { nombre: 'Rappi', color: '#FF441F', letra: 'R' },
  ubereats: { nombre: 'Uber Eats', color: '#06C167', letra: 'U' },
}

function Insignia({ app }: { app: AppDelivery['app'] }) {
  const { color, letra } = APPS[app]
  return (
    <span aria-hidden="true" className="grid h-5 w-5 shrink-0 place-items-center rounded-md text-[11px] leading-none font-extrabold text-white" style={{ backgroundColor: color }}>
      {letra}
    </span>
  )
}

/**
 * Botones discretos para pedir por DiDi Food / Rappi / Uber Eats.
 * Si no hay apps con link real, no renderiza nada.
 */
export function DeliveryApps({ titulo = '¿Prefieres pedir por app?', className = '', centrado = false }: { titulo?: string; className?: string; centrado?: boolean }) {
  if (!deliveryApps.length) return null
  return (
    <div className={className}>
      <p className={`text-xs text-suave ${centrado ? 'text-center' : ''}`}>{titulo}</p>
      <ul className={`mt-2 flex flex-wrap gap-2 ${centrado ? 'justify-center' : ''}`}>
        {deliveryApps.map(({ app, url }) => (
          <li key={app}>
            <a
              href={url}
              target="_blank"
              rel="noopener"
              className="flex h-9 items-center gap-2 rounded-full bg-white pr-3.5 pl-2 text-[13px] font-semibold text-tinta ring-1 ring-linea transition active:scale-95 active:bg-fondo"
            >
              <Insignia app={app} />
              {APPS[app].nombre}
            </a>
          </li>
        ))}
      </ul>
    </div>
  )
}
