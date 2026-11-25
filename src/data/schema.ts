/**
 * Esquema de clients/<slug>/restaurant.json.
 * De aquí salen (1) la validación al compilar y (2) los tipos de TypeScript.
 * Este archivo NO se incluye en el sitio publicado (solo se importan sus tipos).
 */
import { z } from 'zod'

export const DIAS = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado', 'domingo'] as const
export const ETIQUETAS = ['mas-vendido', 'picante', 'nuevo', 'vegetariano'] as const
export const TIPOGRAFIAS = ['moderna', 'clasica', 'callejera'] as const
export const MODOS = ['demo', 'cliente'] as const
/** Apps de delivery con botón propio (carrito y sección de ubicación) */
export const APPS_DELIVERY = ['didi', 'rappi', 'ubereats'] as const
/** Tipo de platillo: decide el ícono genérico que se muestra cuando un producto no tiene foto */
export const TIPOS_PLATILLO = [
  'taco', 'burrito', 'torta', 'hamburguesa', 'hotdog', 'pizza', 'mariscos', 'sopa',
  'ensalada', 'desayuno', 'cafe', 'bebida', 'cerveza', 'postre', 'helado', 'general',
] as const

const texto = z.string().trim().min(1, 'no puede estar vacío')
const url = z.url({ message: 'debe ser una URL completa que empiece con https://' })
const imagen = z
  .string()
  .regex(/^\/images\/[\w\-./]+\.(webp|jpg|jpeg|png|svg)$/i, 'debe ser una ruta como "/images/mi-foto.webp"')
const hora = z
  .string()
  .regex(/^(([01]\d|2[0-3]):[0-5]\d|24:00)$/, 'debe ser una hora en formato 24 h "HH:MM" (ej. "09:00", "23:30")')
const precio = z.number().positive('debe ser mayor que 0').max(100000, 'parece demasiado alto, revísalo')
const hex = z.string().regex(/^#([0-9a-f]{6}|[0-9a-f]{3})$/i, 'debe ser un color hex como "#C2410C"')
const slug = z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, 'solo minúsculas, números y guiones (ej. "tacos-de-asada")')
const whatsapp = z.string().regex(/^52\d{10}$/, 'debe ser 52 + 10 dígitos, sin espacios ni "+" (ej. "526641234567")')

const rango = z.strictObject({ abre: hora, cierra: hora })

export const restaurantSchema = z
  .strictObject({
    /** "demo": prospecto (franja de vista previa, pedidos a TU WhatsApp, noindex). "cliente": ya compró. */
    mode: z.enum(MODOS),
    /**
     * Solo en modo demo: true → pedidos y preguntas van al negocio.whatsapp (para que el dueño vea llegar el pedido).
     * La franja "Lo quiero" y el pie de página siguen yendo a tu WhatsApp (brand.ts).
     */
    pedidosAlNegocio: z.boolean().optional(),
    sitio: z.strictObject({
      url,
      /** Página con créditos de fotos Creative Commons (ej. "/creditos-fotos.html", archivo en la carpeta del cliente). */
      creditosFotos: z.string().regex(/^\/[\w\-./]+\.html$/, 'debe ser una ruta como "/creditos-fotos.html"').optional(),
    }),
    negocio: z.strictObject({
      nombre: texto,
      slogan: z.string().optional(),
      descripcion: texto.max(200, 'máximo 200 caracteres (WhatsApp lo recorta)'),
      logo: imagen,
      portada: imagen,
      imagenCompartir: imagen.optional(),
      /** WhatsApp del negocio. Obligatorio en modo "cliente"; en modo "demo" los pedidos van a tu WhatsApp. */
      whatsapp: whatsapp.optional(),
      telefono: z.string().optional(),
      direccion: z.string().optional(),
      googleMaps: url.optional(),
      /** Si no se conoce el horario, quita este campo y se ocultan el indicador "Abierto/Cerrado" y la tarjeta de horario. */
      horario: z
        .strictObject(
          Object.fromEntries(DIAS.map((d) => [d, z.array(rango)])) as Record<(typeof DIAS)[number], z.ZodArray<typeof rango>>,
        )
        .optional(),
      redes: z
        .strictObject({
          facebook: url.optional(),
          instagram: url.optional(),
          tiktok: url.optional(),
          google: url.optional(),
        })
        .optional(),
      entrega: z.strictObject({
        paraLlevar: z.boolean(),
        domicilio: z.boolean(),
        costoEnvio: z.number().min(0, 'no puede ser negativo').optional(),
        /** true → el envío se muestra como "Por confirmar" (en el carrito y en el mensaje de WhatsApp) en lugar de un monto */
        envioPorConfirmar: z.boolean().optional(),
        notaDomicilio: z.string().optional(),
      }),
    }),
    tema: z.strictObject({
      colorPrimario: hex,
      colorSecundario: hex,
      tipografia: z.enum(TIPOGRAFIAS),
      /** Productos sin foto: "icono" (por defecto, ícono genérico del tipo) o "texto" (tarjeta solo con nombre y precio, sin imagen) */
      sinFoto: z.enum(['icono', 'texto']).optional(),
    }),
    /**
     * Botones "¿Prefieres pedir por app?" (carrito y sección de ubicación).
     * Mientras la url sea "PENDIENTE" ese botón no se muestra. Sin el campo o vacío → no se muestra nada.
     */
    deliveryApps: z
      .array(
        z.strictObject({
          app: z.enum(APPS_DELIVERY),
          url: z.union([url, z.literal('PENDIENTE')]),
        }),
      )
      .optional(),
    promociones: z
      .array(
        z.strictObject({
          id: slug,
          titulo: texto,
          descripcion: z.string().optional(),
          dias: z.array(z.enum(DIAS)).optional(),
        }),
      )
      .optional(),
    categorias: z
      .array(
        z.strictObject({
          id: slug,
          nombre: texto,
          /** Ícono genérico para los productos sin foto de esta categoría */
          tipo: z.enum(TIPOS_PLATILLO).optional(),
          productos: z
            .array(
              z.strictObject({
                id: slug,
                nombre: texto,
                descripcion: z.string().max(140, 'máximo 140 caracteres para que se vea bien en la tarjeta').optional(),
                precio,
                foto: imagen.optional(),
                /** Sobrescribe el tipo de la categoría para elegir el ícono genérico */
                tipo: z.enum(TIPOS_PLATILLO).optional(),
                etiquetas: z.array(z.enum(ETIQUETAS)).optional(),
                disponible: z.boolean(),
                variantes: z
                  .array(z.strictObject({ nombre: texto, precio }))
                  .min(2, 'si usas variantes pon al menos 2 (o quita el campo)')
                  .optional(),
              }),
            )
            .min(1, 'la categoría no tiene productos'),
        }),
      )
      .min(1, 'debe haber al menos una categoría'),
  })
  .superRefine((r, ctx) => {
    if (r.mode === 'cliente' && !r.negocio.whatsapp) {
      ctx.addIssue({
        code: 'custom',
        path: ['negocio', 'whatsapp'],
        message: 'en modo "cliente" el WhatsApp del negocio es obligatorio (ahí llegan los pedidos)',
      })
    }
    if (r.pedidosAlNegocio && !r.negocio.whatsapp) {
      ctx.addIssue({
        code: 'custom',
        path: ['negocio', 'whatsapp'],
        message: 'con "pedidosAlNegocio": true necesitas el WhatsApp del negocio (ahí llegan los pedidos del demo)',
      })
    }
  })

export type Restaurant = z.infer<typeof restaurantSchema>
export type Negocio = Restaurant['negocio']
export type Categoria = Restaurant['categorias'][number]
export type Producto = Categoria['productos'][number]
export type Variante = NonNullable<Producto['variantes']>[number]
export type Promocion = NonNullable<Restaurant['promociones']>[number]
export type Dia = (typeof DIAS)[number]
export type Etiqueta = (typeof ETIQUETAS)[number]
export type Tipografia = (typeof TIPOGRAFIAS)[number]
export type TipoPlatillo = (typeof TIPOS_PLATILLO)[number]
export type Horario = NonNullable<Negocio['horario']>
export type AppDelivery = NonNullable<Restaurant['deliveryApps']>[number]
