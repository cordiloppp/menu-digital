import type { Dia, Horario } from '../data/schema'

export const ZONA = 'America/Tijuana'
export const DIAS: Dia[] = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado', 'domingo']
export const NOMBRE_DIA: Record<Dia, string> = {
  lunes: 'Lunes',
  martes: 'Martes',
  miercoles: 'Miércoles',
  jueves: 'Jueves',
  viernes: 'Viernes',
  sabado: 'Sábado',
  domingo: 'Domingo',
}

const fmt = new Intl.DateTimeFormat('en-US', { timeZone: ZONA, weekday: 'short', hour: 'numeric', minute: 'numeric', hourCycle: 'h23' })
const CORTO = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

/** Día (0 = lunes) y minutos desde medianoche, en hora de Tijuana — sin importar la zona del celular. */
export function ahoraEnTijuana(fecha = new Date()): { dia: number; minutos: number } {
  const partes = Object.fromEntries(fmt.formatToParts(fecha).map((p) => [p.type, p.value]))
  return { dia: CORTO.indexOf(partes.weekday), minutos: (Number(partes.hour) % 24) * 60 + Number(partes.minute) }
}

const aMin = (h: string) => {
  const [hh, mm] = h.split(':').map(Number)
  return hh * 60 + mm
}

/** "18:00" → "6:00 p.m." */
export function horaLegible(h: string): string {
  const m = aMin(h) % 1440
  const hh = Math.floor(m / 60)
  const mm = String(m % 60).padStart(2, '0')
  return `${hh % 12 || 12}:${mm} ${hh < 12 ? 'a.m.' : 'p.m.'}`
}

/** "a la 1:00 a.m." / "a las 6:00 p.m." — en español la 1 va en singular */
export function aLaHora(h: string): string {
  const hh = Math.floor((aMin(h) % 1440) / 60) % 12 || 12
  return `${hh === 1 ? 'a la' : 'a las'} ${horaLegible(h)}`
}

export type Estado = { abierto: boolean; pronto: boolean; detalle: string }

export function estadoNegocio(horario: Horario, fecha = new Date()): Estado {
  const { dia, minutos } = ahoraEnTijuana(fecha)
  const hoy = horario[DIAS[dia]]
  const ayer = horario[DIAS[(dia + 6) % 7]]

  // ¿Abierto ahora? Rango de hoy, o rango de ayer que cruza la medianoche.
  let cierre: { hora: string; faltan: number } | null = null
  for (const { abre, cierra } of hoy) {
    const a = aMin(abre)
    const c = aMin(cierra)
    if (c > a && minutos >= a && minutos < c) cierre = { hora: cierra, faltan: c - minutos }
    if (c <= a && minutos >= a) cierre = { hora: cierra, faltan: 1440 - minutos + c }
  }
  for (const { abre, cierra } of ayer) {
    const c = aMin(cierra)
    if (c <= aMin(abre) && minutos < c) cierre = { hora: cierra, faltan: c - minutos }
  }

  if (cierre) {
    const pronto = cierre.faltan <= 30
    const h = horaLegible(cierre.hora)
    return { abierto: true, pronto, detalle: pronto ? `Cierra pronto · ${h}` : `Cierra ${aLaHora(cierre.hora)}` }
  }

  // ¿Cuándo abre?
  for (let i = 0; i < 8; i++) {
    const d = (dia + i) % 7
    const rangos = [...horario[DIAS[d]]].sort((x, y) => aMin(x.abre) - aMin(y.abre))
    const siguiente = rangos.find((rg) => i > 0 || aMin(rg.abre) > minutos)
    if (siguiente) {
      const cuando = i === 0 ? 'hoy' : i === 1 ? 'mañana' : `el ${NOMBRE_DIA[DIAS[d]].toLowerCase()}`
      return { abierto: false, pronto: false, detalle: `Abre ${cuando} ${aLaHora(siguiente.abre)}` }
    }
  }
  return { abierto: false, pronto: false, detalle: 'Temporalmente cerrado' }
}
