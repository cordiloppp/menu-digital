/**
 * ─────────────────────────────────────────────────────────
 *  TU MARCA — se usa en todos los menús
 * ─────────────────────────────────────────────────────────
 *  - Pie de página: "Menú digital por <nombre>"
 *  - Modo demo: los pedidos y el botón de WhatsApp llegan a ESTE número,
 *    y la franja superior "Lo quiero" abre tu WhatsApp.
 */
export const MARCA = {
  nombre: 'Jona',
  /** 52 + 10 dígitos, sin espacios ni "+" */
  whatsapp: '526640000000',
  /** Mensaje del link del pie de página. {restaurante} se reemplaza por el nombre del negocio */
  mensaje: 'Hola, vi el menú digital de {restaurante} y me interesa uno para mi negocio.',
  /** Mensaje del botón "Lo quiero" de la franja de demo */
  mensajeDemo: 'Hola, vi el demo del menú de {restaurante} y me interesa',
}
