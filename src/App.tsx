import { useLayoutEffect, useMemo, useRef, useState } from 'react'
import { CartBar } from './components/CartBar'
import { CartDrawer } from './components/CartDrawer'
import { CategoryNav } from './components/CategoryNav'
import { DemoBanner } from './components/DemoBanner'
import { Footer } from './components/Footer'
import { Hero } from './components/Hero'
import { InfoSection } from './components/InfoSection'
import { MenuSection } from './components/MenuSection'
import { ProductSheet } from './components/ProductSheet'
import { Promotions } from './components/Promotions'
import { SearchBar } from './components/SearchBar'
import { Toast } from './components/Toast'
import { WhatsAppFab } from './components/WhatsAppFab'
import { categorias, whatsappDestino } from './data'
import type { Producto, TipoPlatillo } from './data/schema'
import { useCarrito } from './hooks/useCart'
import { useScrollSpy } from './hooks/useScrollSpy'
import { linkWhatsApp, normalizar } from './lib/format'

export default function App() {
  const { items, agregar } = useCarrito()
  const [busqueda, setBusqueda] = useState('')
  const [abierto, setAbierto] = useState<{ p: Producto; tipo?: TipoPlatillo } | null>(null)
  const [carritoAbierto, setCarritoAbierto] = useState(false)
  const inputBusqueda = useRef<HTMLInputElement>(null)

  // Alto real de la barra sticky, para calcular el scroll exacto
  const nav = useRef<HTMLDivElement>(null)
  const [altoNav, setAltoNav] = useState(57)
  useLayoutEffect(() => {
    if (!nav.current) return
    const ro = new ResizeObserver(([e]) => setAltoNav(e.target.getBoundingClientRect().height))
    ro.observe(nav.current)
    return () => ro.disconnect()
  }, [])

  // Filtrado por búsqueda (sin acentos: "guero" encuentra "Güero")
  const secciones = useMemo(() => {
    const q = normalizar(busqueda)
    return categorias
      .map((c) => ({
        c,
        productos: q ? c.productos.filter((p) => normalizar(`${p.nombre} ${p.descripcion ?? ''} ${c.nombre}`).includes(q)) : c.productos,
      }))
      .filter((s) => s.productos.length)
  }, [busqueda])

  const ids = useMemo(() => secciones.map((s) => s.c.id), [secciones])
  const { activo, setActivo, pausar } = useScrollSpy(ids, altoNav)

  const cantidades = useMemo(() => {
    const m: Record<string, number> = {}
    for (const i of items) m[i.productoId] = (m[i.productoId] ?? 0) + i.cantidad
    return m
  }, [items])

  function irA(id: string) {
    const el = document.getElementById(id)
    if (!el) return
    setActivo(id)
    pausar()
    window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - altoNav - 4, behavior: 'smooth' })
  }

  // El ícono de lupa en la barra sube al buscador y lo enfoca
  function enfocarBusqueda() {
    const input = inputBusqueda.current
    if (!input) return
    window.scrollTo({ top: input.getBoundingClientRect().top + window.scrollY - 90, behavior: 'smooth' })
    input.focus({ preventScroll: true })
  }

  function buscar(q: string) {
    setBusqueda(q)
    // Si el usuario ya bajó por el menú, regresa al inicio de los resultados
    const menu = document.getElementById('menu')
    if (q && menu && menu.getBoundingClientRect().top < altoNav) {
      window.scrollTo({ top: menu.getBoundingClientRect().top + window.scrollY - altoNav })
    }
  }

  const totalResultados = secciones.reduce((n, s) => n + s.productos.length, 0)

  return (
    <>
      <DemoBanner />
      <Hero />
      {!busqueda && <Promotions />}
      <SearchBar ref={inputBusqueda} valor={busqueda} onChange={buscar} />

      <CategoryNav ref={nav} categorias={secciones.map((s) => s.c)} activo={activo} onSelect={irA} onBuscar={enfocarBusqueda} />

      <main id="menu" className="mx-auto min-h-[50vh] max-w-6xl scroll-mt-16 px-4 md:px-8">
        {busqueda && totalResultados > 0 && (
          <p className="animate-aparecer pt-5 text-sm text-suave" role="status">
            {totalResultados} {totalResultados === 1 ? 'resultado' : 'resultados'} para “{busqueda}”
          </p>
        )}

        {secciones.map(({ c, productos }) => (
          <MenuSection
            key={c.id}
            categoria={c}
            productos={productos}
            cantidades={cantidades}
            onAbrir={(p, cat) => setAbierto({ p, tipo: p.tipo ?? cat.tipo })}
            onAgregarRapido={(p) => agregar({ productoId: p.id, nombre: p.nombre, precioUnitario: p.precio, cantidad: 1 })}
          />
        ))}

        {secciones.length === 0 && (
          <div className="animate-aparecer py-16 text-center" role="status">
            <p className="font-semibold">No encontramos “{busqueda}”</p>
            <p className="mt-1.5 text-sm text-suave">
              ¿Buscas algo en especial?{' '}
              <a className="font-semibold text-marca underline underline-offset-2" href={linkWhatsApp(whatsappDestino, `¡Hola! ¿Tienen ${busqueda}?`)} target="_blank" rel="noopener">
                Pregúntanos por WhatsApp
              </a>
            </p>
            <button type="button" onClick={() => buscar('')} className="mt-5 rounded-full bg-white px-5 py-2.5 text-sm font-semibold ring-1 ring-linea">
              Ver todo el menú
            </button>
          </div>
        )}
      </main>

      <InfoSection />
      <Footer />

      <Toast />
      <WhatsAppFab />
      <CartBar onAbrir={() => setCarritoAbierto(true)} />

      {abierto && <ProductSheet producto={abierto.p} tipo={abierto.tipo} onClose={() => setAbierto(null)} />}
      {carritoAbierto && <CartDrawer onClose={() => setCarritoAbierto(false)} />}
    </>
  )
}
