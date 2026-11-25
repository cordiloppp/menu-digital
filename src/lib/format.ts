const entero = new Intl.NumberFormat('es-MX', { maximumFractionDigits: 0 })
const decimal = new Intl.NumberFormat('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

/** 1234 → "$1,234" · 42.5 → "$42.50" */
export const precio = (n: number) => '$' + (Number.isInteger(n) ? entero : decimal).format(n)

/** Quita acentos y pasa a minúsculas para buscar ("guero" encuentra "Güero") */
export const normalizar = (s: string) => s.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase().trim()

export const linkWhatsApp = (telefono: string, texto?: string) =>
  `https://wa.me/${telefono}${texto ? `?text=${encodeURIComponent(texto)}` : ''}`
