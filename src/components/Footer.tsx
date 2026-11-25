import { MARCA } from '../config/brand'
import { negocio, restaurant } from '../data'
import { linkWhatsApp } from '../lib/format'

export function Footer() {
  return (
    <footer className="mx-auto mt-12 max-w-6xl px-4 pt-6 pb-36 md:px-8 text-center text-xs leading-relaxed text-stone-600">
      <p>
        © {new Date().getFullYear()} {negocio.nombre} · Precios en pesos mexicanos, sujetos a cambio.
      </p>
      <p className="mt-2">
        Menú digital por{' '}
        <a
          href={linkWhatsApp(MARCA.whatsapp, MARCA.mensaje.replace('{restaurante}', negocio.nombre))}
          target="_blank"
          rel="noopener"
          className="font-semibold text-tinta underline-offset-2 hover:underline"
        >
          {MARCA.nombre}
        </a>
        {restaurant.sitio.creditosFotos && (
          <>
            {' · '}
            <a href={restaurant.sitio.creditosFotos} className="underline underline-offset-2">
              Créditos de fotos
            </a>
          </>
        )}
      </p>
    </footer>
  )
}
