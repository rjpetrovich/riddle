import { Card } from '../../components/ui/Card'
import { useContadores, useContarBano } from './useContadores'
import type { TipoContador } from './contadoresApi'

function Fila({
  icono,
  etiqueta,
  valor,
  onAjustar,
}: {
  icono: string
  etiqueta: string
  valor: number
  onAjustar: (delta: number) => void
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="flex min-w-0 items-center gap-2">
        <span aria-hidden className="text-lg">
          {icono}
        </span>
        <span className="truncate text-sm text-slate-700 dark:text-slate-200">{etiqueta}</span>
      </span>

      <span className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => onAjustar(-1)}
          disabled={valor === 0}
          aria-label={`Quitar uno a ${etiqueta}`}
          className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 text-lg leading-none text-slate-600 disabled:opacity-30 dark:border-slate-700 dark:text-slate-300"
        >
          −
        </button>
        <span
          className="w-8 text-center text-lg font-semibold tabular-nums text-slate-900 dark:text-slate-100"
          aria-live="polite"
          aria-label={`${etiqueta}: ${valor}`}
        >
          {valor}
        </span>
        <button
          type="button"
          onClick={() => onAjustar(1)}
          aria-label={`Sumar uno a ${etiqueta}`}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-600 text-lg leading-none text-white active:scale-95"
        >
          +
        </button>
      </span>
    </div>
  )
}

export function ContadoresCard({ dia }: { dia: Date }) {
  const { contadores, ajustar, error } = useContadores(dia)
  const { activo: contarBano } = useContarBano()

  const filas: { tipo: TipoContador; icono: string; etiqueta: string }[] = [
    { tipo: 'vasosAgua', icono: '💧', etiqueta: 'Vasos de agua' },
  ]
  if (contarBano) {
    filas.push({ tipo: 'idasBano', icono: '🚽', etiqueta: 'Idas al baño' })
  }

  return (
    <Card className="flex flex-col gap-3">
      {filas.map((f) => (
        <Fila
          key={f.tipo}
          icono={f.icono}
          etiqueta={f.etiqueta}
          valor={contadores[f.tipo]}
          onAjustar={(delta) => ajustar(f.tipo, delta)}
        />
      ))}
      {error && (
        // Se muestra el mensaje real y no uno genérico: decir "revisá la
        // conexión" ante cualquier fallo manda a buscar el problema donde no
        // está (una tabla que falta, un permiso) y deja sin pistas.
        <p className="text-xs text-red-600 dark:text-red-400">
          No se pudo guardar: {error instanceof Error ? error.message : String(error)}
        </p>
      )}
    </Card>
  )
}
