import data from 'virtual:restaurant'
import { MARCA } from '../config/brand'
import type { Restaurant } from './schema'

/** Datos del cliente activo (clients/<CLIENT>/restaurant.json, validados al compilar) */
export const restaurant = data as Restaurant
export const { negocio, tema, categorias } = restaurant
export const promociones = restaurant.promociones ?? []
export const esDemo = restaurant.mode === 'demo'
/** Productos sin foto: tarjeta solo de texto (sin ícono genérico) */
export const sinFotoTexto = tema.sinFoto === 'texto'
/** Apps de delivery con link real (las que dicen "PENDIENTE" no se muestran) */
export const deliveryApps = (restaurant.deliveryApps ?? []).filter((a) => /^https:\/\//i.test(a.url))

/** A dónde llegan pedidos y preguntas: en modo demo a TU WhatsApp; en modo cliente al del negocio. */
// Excepción: "pedidosAlNegocio": true manda los pedidos del demo al negocio (la franja "Lo quiero" sigue yendo a ti).
export const whatsappDestino = esDemo && !restaurant.pedidosAlNegocio ? MARCA.whatsapp : (negocio.whatsapp ?? MARCA.whatsapp)
