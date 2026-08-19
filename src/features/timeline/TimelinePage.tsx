import { useMemo, useState } from 'react'
import { PageHeader } from '../../components/ui/PageHeader'
import { EmptyState } from '../../components/ui/EmptyState'
import { Spinner } from '../../components/ui/Spinner'
import { useComidasRango, useEliminarComida } from '../meals/useMeals'
import { useEliminarSensacion, useSensacionesRango, useSintomas } from '../feelings/useFeelings'
import { ComidaCard, SensacionCard } from './RecordCard'
import { PendientesCard } from '../reminders/PendientesCard'
import { agruparTimeline } from './agruparTimeline'
import { formatFechaCorta } from '../../lib/dateUtils'
import { TIPOS_COMIDA, type TipoComida, type Valoracion } from '../../types/domain'

function startEndOfDay(date: Date) {
  const start = new Date(date)
  start.setHours(0, 0, 0, 0)
  const end = new Date(date)
  end.setHours(23, 59, 59, 999)
  return { start: start.toISOString(), end: end.toISOString() }
}

export function TimelinePage() {
  const [fecha, setFecha] = useState(new Date())
  const [filtroTipoComida, setFiltroTipoComida] = useState<TipoComida | ''>('')
  const [filtroValoracion, setFiltroValoracion] = useState<Valoracion | ''>('')

  const { start, end } = useMemo(() => startEndOfDay(fecha), [fecha])
  const { data: comidas = [], isLoading: cargandoComidas } = useComidasRango(start, end)
  const { data: sensaciones = [], isLoading: cargandoSensaciones } = useSensacionesRango(start, end)
  const { data: sintomas = [] } = useSintomas()
  const eliminarComida = useEliminarComida()
  const eliminarSensacion = useEliminarSensacion()

  const items = useMemo(
    () => agruparTimeline(comidas, sensaciones, { tipoComida: filtroTipoComida, valoracion: filtroValoracion }),
    [comidas, sensaciones, filtroTipoComida, filtroValoracion],
  )

  function cambiarDia(delta: number) {
    setFecha((prev) => {
      const next = new Date(prev)
      next.setDate(next.getDate() + delta)
      return next
    })
  }

  const cargando = cargandoComidas || cargandoSensaciones

  return (
    <div className="pb-24">
      <PageHeader title="Cómo Me Cae" />

      {/* Fuera del filtro por día a propósito: una comida de anoche sin
          registrar tiene que verse aunque estés mirando hoy. */}
      <div className="px-4 pb-1">
        <PendientesCard />
      </div>

      <div className="flex items-center justify-between px-4">
        <button
          onClick={() => cambiarDia(-1)}
          className="rounded-full p-2 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
          aria-label="Día anterior"
        >
          ‹
        </button>
        <span className="font-medium text-slate-700 dark:text-slate-200">
          {formatFechaCorta(fecha.toISOString())}
        </span>
        <button
          onClick={() => cambiarDia(1)}
          className="rounded-full p-2 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
          aria-label="Día siguiente"
        >
          ›
        </button>
      </div>

      <div className="mt-3 flex gap-2 overflow-x-auto px-4 pb-1">
        <select
          value={filtroTipoComida}
          onChange={(e) => setFiltroTipoComida(e.target.value as TipoComida | '')}
          className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
        >
          <option value="">Todas las comidas</option>
          {TIPOS_COMIDA.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>
        <select
          value={filtroValoracion}
          onChange={(e) => setFiltroValoracion(e.target.value as Valoracion | '')}
          className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
        >
          <option value="">Todas las sensaciones</option>
          <option value="bien">Solo bien</option>
          <option value="neutro">Solo neutro</option>
          <option value="mal">Solo mal</option>
        </select>
      </div>

      <div className="mt-3 flex flex-col gap-3 px-4">
        {cargando ? (
          <div className="flex justify-center py-10">
            <Spinner />
          </div>
        ) : items.length === 0 ? (
          <EmptyState
            title="Todavía no hay registros este día"
            subtitle="Tocá el botón + para agregar una comida."
          />
        ) : (
          items.map((item) =>
            item.tipo === 'comida' ? (
              <ComidaCard
                key={`comida-${item.data.id}`}
                comida={item.data}
                sensaciones={item.sensaciones}
                tieneSensaciones={item.tieneSensaciones}
                sintomas={sintomas}
                onEliminar={(id) => eliminarComida.mutate(id)}
                onEliminarSensacion={(id) => eliminarSensacion.mutate(id)}
              />
            ) : (
              <SensacionCard
                key={`sensacion-${item.data.id}`}
                sensacion={item.data}
                sintomas={sintomas}
                onEliminar={(id) => eliminarSensacion.mutate(id)}
              />
            ),
          )
        )}
      </div>
    </div>
  )
}
