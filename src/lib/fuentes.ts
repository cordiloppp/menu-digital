import type { Tipografia } from '../data/schema'

/** Las 3 combinaciones tipográficas disponibles en restaurant.json → tema.tipografia */
export const FUENTES: Record<Tipografia, { paquetes: string[]; titulos: string; texto: string }> = {
  // Limpia y actual. Ideal para cafeterías y lugares modernos.
  moderna: {
    paquetes: ['@fontsource-variable/plus-jakarta-sans'],
    titulos: "'Plus Jakarta Sans Variable'",
    texto: "'Plus Jakarta Sans Variable'",
  },
  // Serif elegante en títulos. Ideal para restaurantes, mariscos, cocina de autor.
  clasica: {
    paquetes: ['@fontsource-variable/fraunces', '@fontsource-variable/inter'],
    titulos: "'Fraunces Variable'",
    texto: "'Inter Variable'",
  },
  // Con personalidad, de cartel. Ideal para taquerías, loncherías, birrierías.
  callejera: {
    paquetes: ['@fontsource-variable/bricolage-grotesque', '@fontsource-variable/inter'],
    titulos: "'Bricolage Grotesque Variable'",
    texto: "'Inter Variable'",
  },
}
