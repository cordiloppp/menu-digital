# Menú digital — fábrica de demos

Menú digital estático (Vite + React + TypeScript + Tailwind) para restaurantes de Tijuana, con pedidos por WhatsApp.
Cada restaurante es una carpeta en `clients/<slug>/`; el build elige el cliente con la variable `CLIENT`
(por defecto `tacos-el-guero`). Todo el texto de la interfaz va en español de México.

## Estructura

```
clients/<slug>/restaurant.json     datos del negocio (esquema: src/data/schema.ts)
clients/<slug>/images/             imágenes publicadas (WebP), se sirven como /images/...
clients/<slug>/fotos-originales/   fotos crudas → `npm run fotos -- <slug>` (no se publica)
clients/<slug>/fuentes/            capturas/PDF del menú original (no se publica)
clients/<slug>/qr/                 QR generado (no se publica)
src/config/brand.ts                marca del dueño del proyecto (nombre + WhatsApp), usada en modo demo
```

- `"mode": "demo"` → franja "Vista previa preparada para…", pedidos y preguntas al WhatsApp de `brand.ts`, `noindex`.
- `"pedidosAlNegocio": true` (solo demo, requiere `negocio.whatsapp`) → pedidos y preguntas al negocio; "Lo quiero" sigue a `brand.ts`.
- `"mode": "cliente"` → sin franja, pedidos al `negocio.whatsapp`, indexable.
- Los colores se ajustan solos a contraste WCAG AA al compilar (`scripts/paleta.ts`).
- Sin `horario` / `direccion` / `googleMaps` / `redes` → esas secciones se ocultan solas.
- `deliveryApps: [{ "app": "didi" | "rappi" | "ubereats", "url": "https://..." }]` (opcional) → botones discretos
  "¿Prefieres pedir por app?" en el carrito y en la tarjeta de ubicación. Con `"url": "PENDIENTE"` ese botón no se muestra.
- `negocio.entrega.envioPorConfirmar: true` → el envío a domicilio se muestra "Por confirmar" en el carrito y el mensaje dice "Envío: por confirmar".
- `tema.sinFoto: "texto"` → los productos sin foto se muestran como tarjeta solo de texto (sin ícono genérico).
- Ojo: `npm run fotos` vuelve a sacar la paleta si hay `logo.*` en `fotos-originales/`; si ajustaste colores a mano, revísalos después.
- Producto sin `foto` → ícono genérico según `tipo` de la categoría (o del producto).
  Tipos: taco, burrito, torta, hamburguesa, hotdog, pizza, mariscos, sopa, ensalada, desayuno, cafe, bebida, cerveza, postre, helado, general.

## Comandos (Windows: el slug va como argumento; `CLIENT=x` solo funciona en Git Bash)

| Comando | Qué hace |
|---|---|
| `npm run new-client -- <slug> "<Nombre>"` | Crea el cliente en modo demo con logo de iniciales y portada abstracta |
| `npm run fotos -- <slug>` | `fotos-originales/` → `images/` en WebP; si hay `logo.*` saca la paleta; regenera la imagen para compartir |
| `npm run validar -- <slug>` | Valida el JSON con mensajes claros |
| `npm run dev:client -- <slug>` | Servidor local de ese cliente (añade `--host` para verlo en el celular) |
| `npm run deploy -- <slug>` | Compila y publica en Vercel: demo → proyecto `<slug>-demo`, cliente → `<slug>`. Corrige `sitio.url` si Vercel asigna otra URL |
| `npm run qr -- <slug>` | QR PNG + SVG de `sitio.url` en `clients/<slug>/qr/` |
| `npm run promote -- <slug>` | Pasa a modo cliente (requiere `negocio.whatsapp`) y publica como `<slug>` |
| `npm run paleta -- <slug>` | Vuelve a sacar la paleta del logo |
| `CLIENT=<slug> npm run build` | Build normal (Git Bash / Vercel) |

Requiere sesión de Vercel CLI (`npx vercel login`, una sola vez). Nunca uses tokens que el usuario pegue en el chat.

## Procedimiento: "nuevo demo"

Cuando el usuario diga **"nuevo demo"** y te dé nombre, capturas del menú y fotos:

1. **Crear el cliente.** Slug = nombre en minúsculas, sin acentos, con guiones (ej. "Mariscos Lupita" → `mariscos-lupita`).
   Si ya existe, pregunta antes de tocarlo. Corre `npm run new-client -- <slug> "<Nombre exacto>"`.
   Copia las capturas/PDF del menú a `clients/<slug>/fuentes/` (nunca a `fotos-originales/`).

2. **Transcribir el menú completo.** Lee TODAS las imágenes/PDF (en PDF largos usa el parámetro `pages`).
   Transcribe cada platillo con nombre, descripción corta, precio (número, MXN) y categoría.
   - Tamaños o versiones (chico/grande, sencillo/con carne, orden de 3) → `variantes`; `precio` = el más barato.
   - Cada categoría lleva su `tipo` para el ícono genérico.
   - `id` en minúsculas con guiones, único en todo el menú.
   - **Si un precio no se lee o es ambiguo, NO lo inventes:** deja ese platillo fuera del JSON y anótalo en la lista de dudosos.
     Lo mismo si un nombre es ilegible. Al final pregúntale al usuario.

3. **Asignar fotos.** Para cada foto que te dé, decide qué platillo muestra y cópiala a `fotos-originales/` con el `id`
   del producto como nombre (ej. `coctel-camaron.jpg`); en el JSON pon `"foto": "/images/<id>.webp"`.
   - Solo asigna una foto si claramente es ese platillo. Si dudas, déjalo sin foto.
   - Nunca uses la foto de un platillo para otro, ni la misma foto en dos platillos.
   - Los que no tengan foto no llevan `foto`: el menú muestra el ícono genérico del `tipo`.
   - La foto más antojable y horizontal también va como `portada.jpg`; el logo como `logo.png` (o .jpg/.svg).

4. **Descripciones.** Si el menú no trae descripción, escribe una corta y antojable de **máximo 80 caracteres**,
   basada solo en lo que el nombre deja claro (no inventes ingredientes raros, gramajes ni promesas como "orgánico").

5. **Datos del negocio.** Llena `horario`, `direccion`, `googleMaps`, `telefono`, `redes`, `slogan` y `negocio.whatsapp`
   solo si el usuario los dio. Si no, **quita esos campos** (no pongas datos de relleno): las secciones se ocultan solas.
   Ajusta `negocio.descripcion` (≤200 caracteres) y `tema.tipografia`:
   `callejera` (taquerías, birrierías, loncherías), `clasica` (mariscos, restaurantes), `moderna` (cafeterías, brunch).
   Deja `mode: "demo"`.

6. **Imágenes.** `npm run fotos -- <slug>` (WebP, paleta desde el logo con contraste AA, imagen para compartir).
   Si no hubo logo, se queda el logo de iniciales. Revisa que los colores resultantes se vean bien.

7. **Validar, publicar y entregar.**
   - `npm run validar -- <slug>` y corrige lo que marque.
   - `npm run deploy -- <slug>` (compila y publica; imprime la URL final).
   - `npm run qr -- <slug>` si el usuario lo quiere.
   - Entrega al usuario, en este orden:
     1. **URL** del demo.
     2. **Platillos dudosos** (precio/nombre ilegible, foto incierta), o "ninguno".
     3. **Mensaje de WhatsApp para el dueño**, listo para copiar, por ejemplo:

     ```
     ¡Hola! 👋 Le preparé una muestra de cómo se vería el menú digital de *<Nombre>*:
     <URL>

     Sus clientes lo abren desde el celular (con un QR en la mesa o por WhatsApp), ven fotos y precios, y le mandan su pedido ya armado por WhatsApp.
     Puede probar hacer un pedido. Si le gusta, lo dejamos listo con sus datos en un día. 😊
     ```

## Reglas

- No modifiques `clients/tacos-el-guero/` salvo que el usuario lo pida (es el demo de ventas principal).
- Después de cambios en código compartido, verifica: `CLIENT=tacos-el-guero npm run build`.
- `npm run promote` solo cuando el usuario confirme que el cliente compró.
- Fotos de internet solo con licencia libre (CC0/CC BY/CC BY-SA vía Openverse) y con su página de créditos
  (`sitio.creditosFotos`); para clientes reales, preferir siempre fotos propias del negocio.
