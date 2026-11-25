import type { ReactNode } from 'react'
import { negocio, whatsappDestino } from '../data'
import { useOpenStatus } from '../hooks/useOpenStatus'
import { linkWhatsApp } from '../lib/format'
import { IconReloj, IconUbicacion, IconWhatsApp } from './Icons'

type Acceso = { href: string; externo: boolean; icono: ReactNode; texto: string }

export function Hero() {
  const estado = useOpenStatus(negocio.horario)
  const punto = estado?.abierto ? (estado.pronto ? 'bg-amber-400' : 'bg-emerald-400') : 'bg-white/50'

  // Los accesos rápidos solo aparecen si hay datos para ellos
  const accesos: Acceso[] = []
  if (negocio.googleMaps) accesos.push({ href: negocio.googleMaps, externo: true, icono: <IconUbicacion width={17} height={17} className="text-marca" />, texto: 'Cómo llegar' })
  if (negocio.horario) accesos.push({ href: '#horario', externo: false, icono: <IconReloj width={17} height={17} className="text-marca" />, texto: 'Horario' })
  accesos.push({
    href: linkWhatsApp(whatsappDestino, `¡Hola ${negocio.nombre}! Tengo una pregunta:`),
    externo: true,
    icono: <IconWhatsApp width={17} height={17} className="text-[#1fa855]" />,
    texto: 'Preguntar',
  })

  return (
    <header>
      {/* Portada con el nombre encima */}
      <div className="relative h-[19rem] overflow-hidden bg-tinta sm:h-[21rem]">
        <img src={negocio.portada} alt="" width={1080} height={608} fetchPriority="high" decoding="async" className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-black/10" />

        <div className="absolute inset-x-0 bottom-0 mx-auto max-w-2xl px-5 pb-5">
          <div className="flex items-end gap-3.5">
            <img
              src={negocio.logo}
              alt={`Logo de ${negocio.nombre}`}
              width={96}
              height={96}
              // 96 px en celular (legible sobre la foto), fondo blanco redondeado; object-contain para no recortar logos con texto
              className="h-24 w-24 shrink-0 rounded-[1.4rem] bg-white object-contain p-1 shadow-lg ring-2 ring-white/90 sm:h-28 sm:w-28"
            />
            <div className="min-w-0 text-white">
              <h1 className="text-[1.9rem] leading-[1.05] font-bold tracking-tight">{negocio.nombre}</h1>
              {negocio.slogan && <p className="mt-1 truncate text-[15px] text-white/80">{negocio.slogan}</p>}
            </div>
          </div>
          {estado && (
            <a
              href="#horario"
              className="mt-4 inline-flex items-center gap-2 rounded-full bg-white/12 px-3 py-1.5 text-[13px] font-medium text-white ring-1 ring-white/20 backdrop-blur-md"
            >
              <span className="relative flex h-2 w-2">
                {estado.abierto && <span className={`absolute inline-flex h-full w-full animate-ping rounded-full opacity-60 ${punto}`} />}
                <span className={`relative inline-flex h-2 w-2 rounded-full ${punto}`} />
              </span>
              <span className="font-semibold">{estado.abierto ? 'Abierto' : 'Cerrado'}</span>
              <span className="text-white/75">· {estado.detalle}</span>
            </a>
          )}
        </div>
      </div>

      {/* Accesos rápidos */}
      <nav aria-label="Accesos rápidos" className="mx-auto max-w-2xl px-4">
        <ul className={`grid gap-2 pt-4 text-[13px] font-semibold ${['grid-cols-1', 'grid-cols-2', 'grid-cols-3'][accesos.length - 1]}`}>
          {accesos.map((a) => (
            <li key={a.texto}>
              <a href={a.href} {...(a.externo ? { target: '_blank', rel: 'noopener' } : {})} className={boton}>
                {a.icono} {a.texto}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  )
}

const boton =
  'flex items-center justify-center gap-1.5 whitespace-nowrap rounded-full bg-white px-2 py-2.5 text-tinta ring-1 ring-linea transition active:scale-[0.97] active:bg-fondo'
