import { createContext, useContext, useEffect, useMemo, useReducer, useState, type ReactNode } from 'react'
import { negocio } from '../data'
import { subtotal, type ItemCarrito } from '../lib/whatsapp'

type Accion =
  | { tipo: 'agregar'; item: Omit<ItemCarrito, 'key'> }
  | { tipo: 'cantidad'; key: string; cantidad: number }
  | { tipo: 'quitar'; key: string }
  | { tipo: 'vaciar' }

const CLAVE = `carrito:${negocio.nombre}`

function reducer(items: ItemCarrito[], a: Accion): ItemCarrito[] {
  switch (a.tipo) {
    case 'agregar': {
      // Mismo producto + misma variante + misma nota = se suma la cantidad
      const key = [a.item.productoId, a.item.variante ?? '', a.item.notas ?? ''].join('|')
      const existe = items.find((i) => i.key === key)
      if (existe) return items.map((i) => (i.key === key ? { ...i, cantidad: i.cantidad + a.item.cantidad } : i))
      return [...items, { ...a.item, key }]
    }
    case 'cantidad':
      return a.cantidad <= 0 ? items.filter((i) => i.key !== a.key) : items.map((i) => (i.key === a.key ? { ...i, cantidad: a.cantidad } : i))
    case 'quitar':
      return items.filter((i) => i.key !== a.key)
    case 'vaciar':
      return []
  }
}

function inicial(): ItemCarrito[] {
  try {
    const guardado = JSON.parse(sessionStorage.getItem(CLAVE) ?? '[]')
    return Array.isArray(guardado) ? guardado : []
  } catch {
    return []
  }
}

type Ctx = {
  items: ItemCarrito[]
  total: number
  piezas: number
  agregar: (item: Omit<ItemCarrito, 'key'>) => void
  cambiarCantidad: (key: string, cantidad: number) => void
  quitar: (key: string) => void
  vaciar: () => void
  /** Último producto agregado (para el aviso "Agregado") */
  aviso: { id: number; texto: string } | null
}

const CarritoCtx = createContext<Ctx | null>(null)

export function CarritoProvider({ children }: { children: ReactNode }) {
  const [items, dispatch] = useReducer(reducer, undefined, inicial)
  const [aviso, setAviso] = useState<Ctx['aviso']>(null)

  useEffect(() => {
    try {
      sessionStorage.setItem(CLAVE, JSON.stringify(items))
    } catch {
      /* modo privado: el carrito funciona igual, solo no se guarda */
    }
  }, [items])

  const valor = useMemo<Ctx>(
    () => ({
      items,
      total: subtotal(items),
      piezas: items.reduce((n, i) => n + i.cantidad, 0),
      agregar: (item) => {
        dispatch({ tipo: 'agregar', item })
        setAviso({ id: Date.now(), texto: `${item.cantidad > 1 ? `${item.cantidad}× ` : ''}${item.nombre}${item.variante ? ` (${item.variante})` : ''}` })
      },
      cambiarCantidad: (key, cantidad) => dispatch({ tipo: 'cantidad', key, cantidad }),
      quitar: (key) => dispatch({ tipo: 'quitar', key }),
      vaciar: () => dispatch({ tipo: 'vaciar' }),
      aviso,
    }),
    [items, aviso],
  )

  return <CarritoCtx.Provider value={valor}>{children}</CarritoCtx.Provider>
}

export function useCarrito() {
  const c = useContext(CarritoCtx)
  if (!c) throw new Error('useCarrito debe usarse dentro de <CarritoProvider>')
  return c
}
