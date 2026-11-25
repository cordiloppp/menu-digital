import type { ComponentType, SVGProps } from 'react'
import { deliveryApps, negocio } from '../data'
import { DeliveryApps } from './DeliveryApps'
import { ahoraEnTijuana, DIAS, horaLegible, NOMBRE_DIA } from '../lib/hours'
import { IconFacebook, IconFlecha, IconGoogle, IconInstagram, IconTelefono, IconTikTok } from './Icons'

const REDES: { clave: keyof NonNullable<typeof negocio.redes>; nombre: string; Icono: ComponentType<SVGProps<SVGSVGElement>> }[] = [
  { clave: 'instagram', nombre: 'Instagram', Icono: IconInstagram },
  { clave: 'facebook', nombre: 'Facebook', Icono: IconFacebook },
  { clave: 'tiktok', nombre: 'TikTok', Icono: IconTikTok },
  { clave: 'google', nombre: 'Reseñas en Google', Icono: IconGoogle },
]

const digitos = (negocio.telefono ?? '').replace(/\D/g, '')
const telHref = `tel:+${digitos.length === 10 ? '52' + digitos : digitos}`

export function InfoSection() {
  const hoy = ahoraEnTijuana().dia
  const redes = REDES.filter((r) => negocio.redes?.[r.clave])
  const horario = negocio.horario
  // Cada tarjeta solo aparece si hay datos; si no hay ninguno, la sección completa se oculta
  const hayUbicacion = !!(negocio.direccion || negocio.googleMaps || negocio.telefono || redes.length || deliveryApps.length)
  if (!horario && !hayUbicacion) return null

  return (
    <section aria-label="Información del negocio" className="mx-auto mt-14 max-w-2xl px-4">
      <div className={`grid gap-3 ${horario && hayUbicacion ? 'sm:grid-cols-2' : ''}`}>
        {/* Horario */}
        {horario && (
        <div id="horario" className="sombra-suave scroll-mt-20 rounded-3xl bg-white p-5">
          <h2 className="text-lg font-bold">Horario</h2>
          <ul className="mt-3 text-[14px]">
            {DIAS.map((d, i) => {
              const rangos = horario[d]
              const esHoy = i === hoy
              return (
                <li key={d} className={`flex justify-between gap-3 rounded-xl px-3 py-2 ${esHoy ? 'bg-fondo font-semibold' : ''}`}>
                  <span className="flex shrink-0 items-center gap-2">
                    {NOMBRE_DIA[d]}
                    {esHoy && <span className="rounded-full bg-tinta px-1.5 py-px text-[10px] font-semibold tracking-wider text-white uppercase">Hoy</span>}
                  </span>
                  <span className={`flex flex-col items-end text-right tabular-nums ${rangos.length ? '' : 'text-suave'}`}>
                    {rangos.length
                      ? rangos.map((r) => (
                          // Cada horario en su propio renglón y sin cortarse ("1:00 a.m." nunca se parte)
                          <span key={r.abre} className="whitespace-nowrap">
                            {horaLegible(r.abre)} – {horaLegible(r.cierra)}
                          </span>
                        ))
                      : 'Cerrado'}
                  </span>
                </li>
              )
            })}
          </ul>
        </div>
        )}

        {/* Ubicación y contacto */}
        {hayUbicacion && (
        <div className="sombra-suave flex flex-col rounded-3xl bg-white p-5">
          <h2 className="text-lg font-bold">{negocio.direccion || negocio.googleMaps ? 'Ubicación' : 'Contacto'}</h2>
          {negocio.direccion && <address className="mt-2 text-[14px] leading-relaxed text-suave not-italic">{negocio.direccion}</address>}
          {negocio.googleMaps && (
          <a
            href={negocio.googleMaps}
            target="_blank"
            rel="noopener"
            className="mt-4 flex items-center justify-center gap-2 rounded-full bg-tinta py-3 text-sm font-semibold text-white transition active:scale-[0.98]"
          >
            Abrir en Google Maps <IconFlecha width={16} height={16} />
          </a>
          )}
          {negocio.telefono && (
            <a
              href={telHref}
              className="mt-2 flex items-center justify-center gap-2 rounded-full py-3 text-sm font-semibold ring-1 ring-linea transition active:bg-fondo"
            >
              <IconTelefono width={16} height={16} /> Llamar · {negocio.telefono}
            </a>
          )}

          <DeliveryApps titulo="También estamos en" className="mt-5" />

          {redes.length > 0 && (
            <div className="mt-auto pt-6">
              <p className="text-xs font-semibold tracking-[0.12em] text-suave uppercase">Síguenos</p>
              <ul className="mt-2.5 flex gap-2">
                {redes.map(({ clave, nombre, Icono }) => (
                  <li key={clave}>
                    <a
                      href={negocio.redes![clave]}
                      target="_blank"
                      rel="noopener"
                      aria-label={nombre}
                      className="grid h-11 w-11 place-items-center rounded-full bg-fondo text-tinta transition active:scale-90"
                    >
                      <Icono />
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
        )}
      </div>
    </section>
  )
}
