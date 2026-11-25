import { IconBasura, IconMas, IconMenos } from './Icons'

type Props = { valor: number; min?: number; onChange: (n: number) => void; pequeno?: boolean; etiqueta?: string }

/** Control − cantidad +. Si min = 0 y la cantidad es 1, el botón izquierdo muestra un bote de basura. */
export function Stepper({ valor, min = 0, onChange, pequeno, etiqueta = 'Cantidad' }: Props) {
  const tam = pequeno ? 'h-8 w-8' : 'h-11 w-11'
  const borrar = min === 0 && valor === 1
  const boton = `${tam} grid place-items-center rounded-full bg-white text-tinta shadow-sm transition duration-150 active:scale-90 disabled:opacity-35`
  return (
    <div className="flex items-center rounded-full bg-fondo p-1 ring-1 ring-linea" role="group" aria-label={etiqueta}>
      <button type="button" onClick={() => onChange(valor - 1)} disabled={valor <= min} aria-label={borrar ? 'Quitar' : 'Uno menos'} className={boton}>
        {borrar ? <IconBasura width={15} height={15} /> : <IconMenos width={15} height={15} strokeWidth={2.5} />}
      </button>
      <span key={valor} className={`animate-pop ${pequeno ? 'w-7 text-sm' : 'w-9'} text-center font-semibold tabular-nums`} aria-live="polite">
        {valor}
      </span>
      <button type="button" onClick={() => onChange(valor + 1)} disabled={valor >= 99} aria-label="Uno más" className={boton}>
        <IconMas width={15} height={15} strokeWidth={2.5} />
      </button>
    </div>
  )
}
