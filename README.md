# Menú Digital para Restaurantes · Fábrica de demos

Menú digital con pedidos por WhatsApp para taquerías, loncherías, mariscos y cafeterías.
Sitio 100% estático (sin servidor ni base de datos), se publica gratis en Vercel.

Cada restaurante vive en su propia carpeta **`clients/<slug>/`**, así que puedes tener muchos demos y clientes en el mismo proyecto:

```
clients/
├── tacos-el-guero/            ← demo de ventas principal
│   ├── restaurant.json        ← TODOS los datos del negocio
│   ├── images/                ← fotos publicadas (WebP)
│   ├── fotos-originales/      ← aquí sueltas las fotos crudas (no se publica)
│   ├── fuentes/               ← capturas/PDF del menú original (no se publica)
│   ├── qr/                    ← QR generado
│   └── creditos-fotos.html    ← (opcional) páginas extra del cliente
└── mariscos-lupita/ …
src/config/brand.ts            ← TU marca y TU WhatsApp
```

---

## Comandos

> En Windows (PowerShell o cmd) el cliente se indica como argumento después de `--`.

| Comando | Para qué sirve |
|---|---|
| `npm install` | Instala dependencias (solo la primera vez) |
| `npm run new-client -- <slug> "<Nombre>"` | Crea un cliente nuevo en **modo demo**, con logo de iniciales, portada y JSON base |
| `npm run fotos -- <slug>` | Convierte `fotos-originales/` a WebP; si hay logo, **saca la paleta de colores**; genera la imagen para compartir |
| `npm run dev:client -- <slug>` | Abre ese menú en tu compu (http://localhost:5173). Agrega `--host` para verlo en tu celular |
| `npm run validar -- <slug>` | Revisa que el `restaurant.json` no tenga errores |
| `npm run deploy -- <slug>` | Compila y publica en Vercel; te imprime la URL final |
| `npm run qr -- <slug>` | Genera el QR (PNG 2048 px + SVG) en `clients/<slug>/qr/` |
| `npm run promote -- <slug>` | Cuando te compran: pasa a modo cliente y lo publica sin "-demo" |
| `npm run paleta -- <slug>` | Vuelve a sacar los colores del logo |
| `npm run og -- <slug>` | Regenera la imagen que sale al compartir el link |
| `npm run placeholders -- <slug>` | Crea el logo de iniciales / portada abstracta si faltan |
| `npm run build` | Compila (por defecto Tacos El Güero). En Git Bash: `CLIENT=<slug> npm run build` |

Si no indicas cliente, todos los comandos usan `tacos-el-guero`.

---

## 1. Crear un demo para un prospecto (menos de 15 minutos)

> Con Claude Code: solo di **"nuevo demo"** y pásale el nombre, las capturas del menú y las fotos. El procedimiento completo está en `CLAUDE.md`.

A mano:

1. `npm run new-client -- mariscos-lupita "Mariscos Lupita"`
2. Copia a `clients/mariscos-lupita/fotos-originales/` el **logo** (`logo.png`), una **portada** (`portada.jpg`) y las fotos de platillos con el id del producto como nombre (`coctel-camaron.jpg`).
3. Llena `clients/mariscos-lupita/restaurant.json` con las categorías y productos.
4. `npm run fotos -- mariscos-lupita` → fotos optimizadas + colores sacados del logo.
5. `npm run dev:client -- mariscos-lupita` para revisarlo.
6. `npm run deploy -- mariscos-lupita` → queda en **`https://mariscos-lupita-demo.vercel.app`** (si ese nombre ya existe en Vercel, el script usa la URL que te asignen y actualiza `sitio.url` solo).
7. Mándale el link al dueño.

### Modo demo vs. modo cliente (`"mode"` en el JSON)

| | `"demo"` (prospecto) | `"cliente"` (ya compró) |
|---|---|---|
| Franja superior "Vista previa preparada para… · Lo quiero" | Sí | No |
| Pedidos y botón de WhatsApp llegan a | **Tu** WhatsApp (`brand.ts`) | WhatsApp del negocio |
| Google | `noindex` (no aparece) | Indexable |
| Proyecto en Vercel | `<slug>-demo` | `<slug>` |

En modo demo, cuando el dueño prueba hacer un pedido **te llega a ti**, y el botón "Lo quiero" te abre WhatsApp con: *"Hola, vi el demo del menú de [Nombre] y me interesa"*.

### Cuando te compran

1. Agrega `"whatsapp": "52664XXXXXXX"` en `negocio` (y horario, dirección, etc. si faltaban).
2. `npm run promote -- mariscos-lupita` → modo cliente, publicado en `mariscos-lupita.vercel.app`.
3. `npm run qr -- mariscos-lupita` y manda imprimir el QR.

---

## 2. Tu marca

Edita **`src/config/brand.ts`**: tu nombre y tu WhatsApp (52 + 10 dígitos). Se usan en el pie de página de todos los menús ("Menú digital por…") y, en modo demo, para recibir los pedidos de prueba y los "Lo quiero".
Mientras siga el número de relleno, el build te avisa con un ⚠.

---

## 3. Editar los datos de un cliente (`clients/<slug>/restaurant.json`)

**Precio:** número sin comillas ni signo de pesos (`"precio": 42`).
**Agotado:** `"disponible": false` (sale en gris con "Agotado").
**Variantes** (tamaños/versiones; el `precio` principal es el más barato, se muestra "desde"):
```json
"precio": 35,
"variantes": [{ "nombre": "Chica", "precio": 35 }, { "nombre": "Grande", "precio": 50 }]
```
**Etiquetas:** `"mas-vendido"`, `"picante"`, `"nuevo"`, `"vegetariano"`.
**Promociones:** `{ "id": "martes-2x1", "titulo": "Martes 2x1", "dias": ["martes"] }` (con `dias`, el menú muestra "HOY"). Sin promociones: `[]`.

**Tipo de categoría** (ícono que se muestra en los platillos sin foto, nunca la foto de otro platillo):
`taco`, `burrito`, `torta`, `hamburguesa`, `hotdog`, `pizza`, `mariscos`, `sopa`, `ensalada`, `desayuno`, `cafe`, `bebida`, `cerveza`, `postre`, `helado`, `general`.
```json
{ "id": "caldos", "nombre": "Caldos", "tipo": "sopa", "productos": [ … ] }
```

**Datos opcionales — si no los tienes, quita el campo y la sección se oculta sola:**
`slogan`, `whatsapp` (obligatorio en modo cliente), `telefono`, `direccion`, `googleMaps`, `horario`, `redes`.

**Horario** (24 h; `[]` = cerrado ese día; si cierra después de medianoche pon la hora real, ej. `"cierra": "02:00"`):
```json
"horario": { "lunes": [], "martes": [{ "abre": "18:00", "cierra": "01:00" }], … }
```
"Abierto ahora / Cerrado" siempre usa la hora de Tijuana.

**Tema:**
```json
"tema": { "colorPrimario": "#9E3A22", "colorSecundario": "#C99A3E", "tipografia": "callejera" }
```
- Con logo, `npm run fotos` llena los colores solo. También puedes ponerlos a mano.
- **Contraste garantizado:** al compilar, si un color no cumple WCAG AA (4.5:1) se ajusta su luminosidad automáticamente (el build te dice si lo hizo).
- `tipografia`: `"callejera"` (taquerías, birrierías) · `"clasica"` (mariscos, restaurantes) · `"moderna"` (cafeterías, brunch).

**Si te equivocas**, el build y Vercel no publican y te dicen exactamente qué falta:
```
✖ restaurant.json de "mariscos-lupita" tiene errores:
  • categorias[0].productos[1].precio: debe ser un número sin comillas (ej. 45, no "45"), pero tiene "42"  (categoría "Cócteles" → producto "Tostada")
  • negocio.whatsapp: en modo "cliente" el WhatsApp del negocio es obligatorio (ahí llegan los pedidos)
```

---

## 4. Fotos

Suelta las fotos tal como llegan (JPG, PNG, de WhatsApp) en `clients/<slug>/fotos-originales/` y corre `npm run fotos -- <slug>`.

| Nombre del archivo | Resultado |
|---|---|
| `logo.png` / `.jpg` / `.svg` | `logo.webp` 512×512 sin recortar + **paleta de colores automática** |
| `portada.jpg` | `portada.webp` 1080×608 (la foto grande de arriba) |
| `og-image.jpg` | Opcional; si no la pones, se genera sola con portada + logo + nombre |
| cualquier otro (`coctel-camaron.jpg`) | `coctel-camaron.webp` 600×600 con recorte inteligente |

En el JSON: `"foto": "/images/coctel-camaron.webp"`. Un producto sin foto muestra el ícono de su tipo.
Sin portada propia se usa una portada abstracta con los colores de la marca (se actualiza sola si cambia la paleta).

**Fotos del demo de Tacos El Güero:** son de referencia con licencia Creative Commons (créditos en `clients/tacos-el-guero/creditos-fotos.html`, enlazados con `sitio.creditosFotos`). Para clientes reales usa sus propias fotos.

---

## 5. Publicar en Vercel

Una sola vez: `npx vercel login`. Después, `npm run deploy -- <slug>` hace todo:
compila ese cliente, lo sube como proyecto independiente (`<slug>-demo` o `<slug>`), verifica que esté en línea e imprime la URL.
Para cambiar la URL a algo más bonito o conectar un dominio propio: Vercel → proyecto → Settings → Domains; luego actualiza `sitio.url` y vuelve a correr `deploy` y `qr`.

---

## 6. El código QR

`npm run qr -- <slug>` crea `clients/<slug>/qr/<slug>.png` (2048 px, imprime hasta ~17 cm) y `.svg` (vectorial, para la imprenta).
Corrección de errores alta (funciona aunque se manche). Tamaño mínimo en mesa: 3×3 cm.
⚠ Si el cliente está en modo demo, el QR apunta al demo: genera el definitivo después de `promote`.

---

## Cómo funciona por dentro

```
vite.config.ts             plugin: elige el cliente (CLIENT), valida, sirve/copia sus imágenes,
                           inyecta Open Graph, noindex (demo) y colores con contraste AA
src/data/schema.ts         reglas del JSON + tipos (Zod)
src/data/index.ts          datos del cliente activo + a qué WhatsApp van los pedidos
scripts/cliente.ts         rutas por cliente
scripts/paleta.ts          contraste WCAG y paleta desde el logo
scripts/deploy.ts          build + Vercel (Build Output API) + corrección de URL
src/components/            interfaz (React + Tailwind)
```

- Carrito guardado en el celular del comensal durante su visita; nombre y dirección se recuerdan para el siguiente pedido.
- El botón "atrás" de Android cierra la ventana abierta en lugar de salir del menú.
- Animaciones sutiles que se desactivan con "reducir movimiento".
- Lighthouse móvil (Tacos El Güero, fotos reales): Rendimiento 91–92 · Accesibilidad 100 · Buenas prácticas 100 · SEO 100.
