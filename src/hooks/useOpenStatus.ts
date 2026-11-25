import { useEffect, useState } from 'react'
import type { Horario } from '../data/schema'
import { estadoNegocio, type Estado } from '../lib/hours'

/** Estado abierto/cerrado, recalculado cada minuto. Devuelve null si el negocio no tiene horario capturado. */
export function useOpenStatus(horario: Horario | undefined): Estado | null {
  const [estado, setEstado] = useState(() => (horario ? estadoNegocio(horario) : null))
  useEffect(() => {
    if (!horario) return
    const id = setInterval(() => setEstado(estadoNegocio(horario)), 60_000)
    return () => clearInterval(id)
  }, [horario])
  return estado
}
