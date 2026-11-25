import { useEffect, useRef, useState } from 'react'

/**
 * Devuelve el id de la sección visible. `offset` = alto de la barra sticky.
 * `pausar()` evita que el resaltado "salte" mientras hacemos scroll programático.
 */
export function useScrollSpy(ids: string[], offset: number) {
  const [activo, setActivo] = useState(ids[0] ?? '')
  const pausadoHasta = useRef(0)

  useEffect(() => {
    let raf = 0
    const calcular = () => {
      raf = 0
      if (Date.now() < pausadoHasta.current) return
      let actual = ids[0] ?? ''
      for (const id of ids) {
        const el = document.getElementById(id)
        if (el && el.getBoundingClientRect().top - offset - 24 <= 0) actual = id
      }
      // Al llegar al fondo, activa la última sección
      if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4) {
        const visibles = ids.filter((id) => document.getElementById(id))
        actual = visibles[visibles.length - 1] ?? actual
      }
      setActivo(actual)
    }
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(calcular)
    }
    // Al terminar un scroll (también el suave al tocar un chip) se quita la pausa y se recalcula
    const onFin = () => {
      pausadoHasta.current = 0
      onScroll()
    }
    calcular()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('scrollend', onFin)
    window.addEventListener('resize', onScroll)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('scrollend', onFin)
      window.removeEventListener('resize', onScroll)
      if (raf) cancelAnimationFrame(raf)
    }
  }, [ids, offset])

  // Tope de seguridad por si el navegador no emite "scrollend" (se quita antes al terminar el scroll)
  const pausar = (ms = 2000) => {
    pausadoHasta.current = Date.now() + ms
  }

  return { activo, setActivo, pausar }
}
