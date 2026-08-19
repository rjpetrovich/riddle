import { useState } from 'react'
import { Card } from '../../components/ui/Card'
import { claveDiaLocal } from '../../lib/dateUtils'
import { mensajeDeError } from '../../lib/mensajeDeError'
import { useContadores, useContarBano } from './useContadores'
import { useMetaAgua } from './useMetaAgua'
import type { TipoContador } from './contadoresApi'

/**
 * Anillo de progreso hacia la meta del día.
 *
 * Se llena y al completarse cambia a verde: una recompensa diaria concreta,
 * sobre un hábito que no carga juicio moral como sí lo cargaría medir la
 * comida. Pasada la meta no muestra reproche ni "exceso", solo queda lleno.
 */
function AnilloMeta({ valor, meta }: { valor: number; meta: number }) {
  const proporcion = meta > 0 ? Math.min(1, valor / meta) : 0
  const completa = valor >= meta
  const radio = 13
  const circunferencia = 2 * Math.PI * radio

  return (
    <span
      className="relative flex h-8 w-8 shrink-0 items-center justify-center"
      aria-label={`${valor} de ${meta}`}
    >
      <svg viewBox="0 0 32 32" className="h-8 w-8 -rotate-90">
        <circle
          cx="16"
          cy="16"
          r={radio}
          fill="none"
          strokeWidth="3"
          className="stroke-slate-200 dark:stroke-slate-700"
        />
        <circle
          cx="16"
          cy="16"
          r={radio}
          fill="none"
          strokeWidth="3"
          strokeLinecap="round"
          className={completa ? 'stroke-emerald-500' : 'stroke-sky-500'}
          strokeDasharray={circunferencia}
          strokeDashoffset={circunferencia * (1 - proporcion)}
          style={{ transition: 'stroke-dashoffset 300ms' }}
        />
      </svg>
      <span className="absolute text-[10px]" aria-hidden>
        {completa ? '✓' : ''}
      </span>
    </span>
  )
}

function Fila({
  icono,
  etiqueta,
  valor,
  meta,
  onAjustar,
}: {
  icono: string
  etiqueta: string
  valor: number
  meta?: number
  onAjustar: (delta: number) => void
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="flex min-w-0 items-center gap-2">
        {meta ? (
          <AnilloMeta valor={valor} meta={meta} />
        ) : (
          <span aria-hidden className="text-lg">
            {icono}
          </span>
        )}
        <span className="min-w-0">
          <span className="block truncate text-sm text-slate-700 dark:text-slate-200">
            {etiqueta}
          </span>
          {meta ? (
            <span className="text-xs text-slate-400">
              {valor >= meta ? '¡meta del día cumplida!' : `meta: ${meta}`}
            </span>
          ) : null}
        </span>
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

/**
 * El texto vive en estado local y no en la caché remota.
 *
 * Si el valor del textarea viniera del dato del servidor, cada tecla tendría
 * que esperar un re-render y al escribir rápido React lo devolvería al valor
 * anterior, perdiendo caracteres. Acá se escribe fluido y el guardado va aparte.
 */
function Observaciones({
  inicial,
  onEscribir,
  guardando,
}: {
  inicial: string
  onEscribir: (texto: string) => void
  guardando: boolean
}) {
  const [texto, setTexto] = useState(inicial)

  return (
    <div className="flex flex-col gap-1 border-t border-slate-100 pt-3 dark:border-slate-800">
      <label
        htmlFor="observaciones-dia"
        className="flex items-center justify-between text-sm font-medium text-slate-700 dark:text-slate-300"
      >
        <span>📝 Observaciones del día</span>
        {guardando && <span className="text-xs font-normal text-slate-400">guardando…</span>}
      </label>
      <textarea
        id="observaciones-dia"
        value={texto}
        onChange={(e) => {
          setTexto(e.target.value)
          onEscribir(e.target.value)
        }}
        rows={2}
        placeholder="cómo dormiste, estrés, medicación, lo que quieras recordar..."
        className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-emerald-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
      />
    </div>
  )
}

export function ContadoresCard({ dia }: { dia: Date }) {
  const { contadores, cargado, ajustar, escribirObservaciones, guardando, error } =
    useContadores(dia)
  const { activo: contarBano } = useContarBano()
  const { meta } = useMetaAgua()

  const filas: { tipo: TipoContador; icono: string; etiqueta: string; meta?: number }[] = [
    { tipo: 'vasosAgua', icono: '💧', etiqueta: 'Vasos de agua', meta },
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
          meta={f.meta}
          onAjustar={(delta) => ajustar(f.tipo, delta)}
        />
      ))}
      {/* Se monta recién con el dato cargado: el texto inicial se toma una sola
          vez, así que montarlo antes dejaría el campo vacío en un día que sí
          tiene observaciones. La key por día lo reinicia al cambiar de fecha. */}
      {cargado && (
        <Observaciones
          key={claveDiaLocal(dia)}
          inicial={contadores.observaciones}
          onEscribir={escribirObservaciones}
          guardando={guardando}
        />
      )}

      {error && (
        // Se muestra el mensaje real y no uno genérico: decir "revisá la
        // conexión" ante cualquier fallo manda a buscar el problema donde no
        // está (una tabla que falta, un permiso) y deja sin pistas.
        <p className="text-xs text-red-600 dark:text-red-400">
          No se pudo guardar: {mensajeDeError(error)}
        </p>
      )}
    </Card>
  )
}
