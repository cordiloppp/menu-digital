import { useEffect, useRef, useState, type ReactNode } from 'react'

type Props = {
  titulo: string
  onClose: () => void
  children: (cerrar: () => void) => ReactNode
}

const DURACION_SALIDA = 220

/**
 * Hoja inferior (bottom sheet) accesible, con animación de entrada y salida.
 * El botón "atrás" de Android la cierra en lugar de salir del menú.
 */
export function Sheet({ titulo, onClose, children }: Props) {
  const panel = useRef<HTMLDivElement>(null)
  const onCloseRef = useRef(onClose)
  onCloseRef.current = onClose
  const [saliendo, setSaliendo] = useState(false)
  const saliendoRef = useRef(false)

  // Anima la salida y luego desmonta
  const animarYCerrar = () => {
    if (saliendoRef.current) return
    saliendoRef.current = true
    setSaliendo(true)
    setTimeout(() => onCloseRef.current(), DURACION_SALIDA)
  }

  useEffect(() => {
    history.pushState({ hoja: true }, '')
    const onPop = () => animarYCerrar()
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && cerrar()
    const overflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    window.addEventListener('popstate', onPop)
    window.addEventListener('keydown', onKey)
    panel.current?.focus({ preventScroll: true })
    return () => {
      document.body.style.overflow = overflow
      window.removeEventListener('popstate', onPop)
      window.removeEventListener('keydown', onKey)
    }
  }, [])

  function cerrar() {
    if (history.state?.hoja) history.back() // dispara popstate → animarYCerrar
    else animarYCerrar()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center md:items-center md:p-6" role="dialog" aria-modal="true" aria-label={titulo}>
      <div
        className={`absolute inset-0 bg-tinta/50 backdrop-blur-[3px] ${saliendo ? 'animate-desvanecer' : 'animate-aparecer'}`}
        onClick={cerrar}
      />
      <div
        ref={panel}
        tabIndex={-1}
        className={`relative flex max-h-[92dvh] w-full max-w-lg flex-col overflow-hidden rounded-t-[28px] bg-white shadow-2xl outline-none md:max-h-[86dvh] md:max-w-xl md:rounded-[28px] ${
          saliendo ? 'animate-bajar md:animate-escala-salir' : 'animate-subir md:animate-escala'
        }`}
      >
        <div className="pointer-events-none absolute top-2 left-1/2 z-10 h-1 w-10 -translate-x-1/2 rounded-full bg-black/15 md:hidden" aria-hidden />
        {children(cerrar)}
      </div>
    </div>
  )
}
