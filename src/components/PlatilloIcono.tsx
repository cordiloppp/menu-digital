import type { ReactNode } from 'react'
import type { TipoPlatillo } from '../data/schema'

/**
 * Íconos genéricos de línea para productos sin foto, según el tipo de platillo.
 * Nunca se usa la foto de otro platillo: así el menú no "miente".
 */
const ICONOS: Record<TipoPlatillo, ReactNode> = {
  taco: (
    <>
      <path d="M3 17a9 9 0 0 1 18 0z" />
      <path d="M7 14c1-1 2 .5 3-.5s2 .5 3-.5 2 .5 3-.5" />
    </>
  ),
  burrito: (
    <>
      <rect x="3" y="8" width="18" height="8" rx="4" transform="rotate(-20 12 12)" />
      <path d="M8 7.5l2 7M12.5 6l2 7" />
    </>
  ),
  torta: (
    <>
      <path d="M4 11a8 5 0 0 1 16 0z" />
      <path d="M3.5 14h17M4 17h16a0 0 0 0 1 0 0 2 2 0 0 1-2 2H6a2 2 0 0 1-2-2z" />
    </>
  ),
  hamburguesa: (
    <>
      <path d="M4 10a8 6 0 0 1 16 0z" />
      <path d="M3 13.5h18M4 16.5h16v.5a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2z" />
    </>
  ),
  hotdog: (
    <>
      <rect x="2.5" y="9" width="19" height="6" rx="3" />
      <path d="M4 12.5c2-1.5 3 1 5-.5s3 1 5-.5 3 1 5-.5" />
    </>
  ),
  pizza: (
    <>
      <path d="M12 21L3.5 6.5a14 14 0 0 1 17 0z" />
      <circle cx="10" cy="10" r="1.2" />
      <circle cx="13.5" cy="13" r="1.2" />
      <circle cx="14" cy="8.5" r="1" />
    </>
  ),
  mariscos: (
    <>
      <path d="M3 12c3-5 10-6 14 0-4 6-11 5-14 0z" />
      <path d="M17 12l4-3.5v7z" />
      <circle cx="8" cy="11" r=".8" fill="currentColor" />
    </>
  ),
  sopa: (
    <>
      <path d="M3 12h18a9 7 0 0 1-18 0z" />
      <path d="M9 4c-1 1.5 1 2 0 4M13 4c-1 1.5 1 2 0 4" />
    </>
  ),
  ensalada: (
    <>
      <path d="M3 12h18a9 7 0 0 1-18 0z" />
      <path d="M8 12c0-3 2-5 4-6M12 12c0-3 2-5 5-5M7 9c1 0 2 1 2 3" />
    </>
  ),
  desayuno: (
    <>
      <circle cx="10" cy="13" r="7" />
      <circle cx="10" cy="13" r="2.5" />
      <path d="M17 8l4-4" />
    </>
  ),
  cafe: (
    <>
      <path d="M4 9h12v6a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5z" />
      <path d="M16 11h1.5a2.5 2.5 0 0 1 0 5H16M8 3c-.8 1.2.8 1.8 0 3M12 3c-.8 1.2.8 1.8 0 3" />
    </>
  ),
  bebida: (
    <>
      <path d="M6 7h12l-1.5 13a1 1 0 0 1-1 1h-7a1 1 0 0 1-1-1z" />
      <path d="M13 7l2-5h3M6.5 11h11" />
    </>
  ),
  cerveza: (
    <>
      <path d="M5 8h10v11a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2z" />
      <path d="M15 11h2a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2h-2M5 8a2.5 2.5 0 0 1 3-3.5 3 3 0 0 1 5 0A2.5 2.5 0 0 1 15 8" />
    </>
  ),
  postre: (
    <>
      <path d="M3 18l18-5v5z" />
      <path d="M3 18V14l18-5v4" />
      <path d="M14 7.5a1.5 1.5 0 1 1 3 0" />
    </>
  ),
  helado: (
    <>
      <path d="M8 11l4 10 4-10" />
      <path d="M7 11a5 5 0 1 1 10 0z" />
    </>
  ),
  general: (
    <>
      <circle cx="12" cy="13" r="7" />
      <circle cx="12" cy="13" r="4" />
      <path d="M3 4v5a1.5 1.5 0 0 0 3 0V4M4.5 9v11M20 4c-1.5 0-2 2-2 5h2v11" />
    </>
  ),
}

export function PlatilloIcono({ tipo = 'general', className = '' }: { tipo?: TipoPlatillo; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      {ICONOS[tipo]}
    </svg>
  )
}
