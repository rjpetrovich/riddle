import type { ReactNode } from 'react'

/**
 * Un número que se lee de un vistazo. Para un valor suelto conviene esto y no
 * un gráfico de una sola barra.
 */
export function StatTile({
  valor,
  etiqueta,
  detalle,
  acento,
}: {
  valor: ReactNode
  etiqueta: string
  detalle?: string
  /** Color del número. El texto siempre va en tinta neutra. */
  acento?: string
}) {
  return (
    <div className="flex flex-1 flex-col rounded-2xl border border-slate-200 bg-white px-3 py-2.5 dark:border-slate-800 dark:bg-slate-900">
      <span
        className="text-2xl font-semibold tabular-nums text-slate-900 dark:text-slate-100"
        style={acento ? { color: acento } : undefined}
      >
        {valor}
      </span>
      <span className="text-xs text-slate-500 dark:text-slate-400">{etiqueta}</span>
      {detalle && <span className="mt-0.5 text-[11px] text-slate-400">{detalle}</span>}
    </div>
  )
}
