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
  if (negocio.googleMaps) accesos.push({ href: negocio.googleMaps, externo: true, icono: <IconUbicacion width={17} height={17} />, texto: 'Cómo llegar' })
  if (negocio.horario) accesos.push({ href: '#horario', externo: false, icono: <IconReloj width={17} height={17} />, texto: 'Horario' })
  accesos.push({
    href: linkWhatsApp(whatsappDestino, `¡Hola ${negocio.nombre}! Tengo una pregunta:`),
    externo: true,
    icono: <IconWhatsApp width={17} height={17} />,
    texto: 'Preguntar',
  })

  return (
    <header className="relative isolate overflow-hidden bg-tinta text-white">
      {/* Portada a todo lo ancho; el texto vive sobre la parte oscura de la foto */}
      <img
        src={negocio.portada}
        alt=""
        width={1080}
        height={608}
        fetchPriority="high"
        decoding="async"
        className="animate-aparecer absolute inset-0 -z-10 h-full w-full object-cover"
      />
      <div className="absolute inset-0 -z-10 bg-gradient-to-t from-black/90 via-black/50 to-black/15 md:bg-gradient-to-r md:from-black/85 md:via-black/55 md:to-black/10" />

      <div className="mx-auto flex min-h-[27rem] max-w-6xl flex-col justify-end px-5 pt-28 pb-6 sm:min-h-[30rem] md:min-h-[34rem] md:px-8 md:pb-12">
        <div className="animate-entrar flex items-end gap-4">
          <img
            src={negocio.logo}
            alt={`Logo de ${negocio.nombre}`}
            width={112}
            height={112}
            // Fondo blanco redondeado y object-contain para no recortar logos con texto
            className="h-20 w-20 shrink-0 rounded-[1.25rem] bg-white object-contain p-1 shadow-lg ring-2 ring-white/90 sm:h-24 sm:w-24 md:h-28 md:w-28 md:rounded-[1.5rem]"
          />
          <div className="min-w-0">
            <h1 className="text-[2.1rem] leading-[1.02] font-bold tracking-tight sm:text-5xl md:text-6xl">{negocio.nombre}</h1>
            {negocio.slogan && <p className="mt-1.5 text-[15px] text-white/80 md:text-lg">{negocio.slogan}</p>}
          </div>
        </div>

        {negocio.descripcion && (
          <p className="animate-entrar retraso-1 mt-5 hidden max-w-xl text-[17px] leading-relaxed text-white/75 md:block">{negocio.descripcion}</p>
        )}

        {estado && (
          <a
            href="#horario"
            className="animate-entrar retraso-2 mt-5 inline-flex w-fit items-center gap-2 rounded-full bg-white/12 px-3.5 py-1.5 text-[13px] font-medium ring-1 ring-white/20 backdrop-blur-md transition-colors hover:bg-white/20"
          >
            <span className="relative flex h-2 w-2">
              {estado.abierto && <span className={`absolute inline-flex h-full w-full animate-ping rounded-full opacity-60 ${punto}`} />}
              <span className={`relative inline-flex h-2 w-2 rounded-full ${punto}`} />
            </span>
            <span className="font-semibold">{estado.abierto ? 'Abierto' : 'Cerrado'}</span>
            <span className="text-white/75">· {estado.detalle}</span>
          </a>
        )}

        <nav aria-label="Accesos rápidos" className="animate-entrar retraso-3 mt-5 md:mt-7">
          <ul className="grid grid-cols-3 gap-2 text-[13px] font-semibold md:flex md:flex-wrap md:gap-2.5 md:text-[13.5px]">
            <li className="hidden md:block">
              <a
                href="#menu"
                className="flex h-11 items-center rounded-full bg-marca px-6 text-marca-texto shadow-lg transition-[filter,transform] hover:brightness-110 active:scale-[0.97]"
              >
                Ver el menú
              </a>
            </li>
            {accesos.map((a) => (
              <li key={a.texto}>
                <a
                  href={a.href}
                  {...(a.externo ? { target: '_blank', rel: 'noopener' } : {})}
                  className="flex h-11 items-center justify-center gap-1.5 rounded-full bg-white/12 px-2 whitespace-nowrap ring-1 ring-white/25 backdrop-blur-md transition-[background-color,transform] hover:bg-white/22 active:scale-[0.97] md:px-5"
                >
                  {a.icono} {a.texto}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  )
}
