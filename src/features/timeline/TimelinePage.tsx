import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { PageHeader } from '../../components/ui/PageHeader'
import { EmptyState } from '../../components/ui/EmptyState'
import { Spinner } from '../../components/ui/Spinner'
import { useComidasRango, useEliminarComida } from '../meals/useMeals'
import { useEliminarSensacion, useSensacionesRango, useSintomas } from '../feelings/useFeelings'
import { ComidaCard, SensacionCard } from './RecordCard'
import { PendientesCard } from '../reminders/PendientesCard'
import { agruparTimeline } from './agruparTimeline'
import { CalendarioMes } from './CalendarioMes'
import { mismoDia } from './calendario'
import { ContadoresCard } from '../contadores/ContadoresCard'
import { claveDiaLocal, diaDesdeClave, formatFechaCorta } from '../../lib/dateUtils'
import { TIPOS_COMIDA, type TipoComida, type Valoracion } from '../../types/domain'

function startEndOfDay(date: Date) {
  const start = new Date(date)
  start.setHours(0, 0, 0, 0)
  const end = new Date(date)
  end.setHours(23, 59, 59, 999)
  return { start: start.toISOString(), end: end.toISOString() }
}

export function TimelinePage() {
  // El día elegido vive en la URL (?dia=YYYY-MM-DD) y no en un useState: así lo
  // puede leer también el botón + para abrir la comida nueva ya ubicada en ese
  // día, y el día sobrevive a ir y volver del formulario.
  const [searchParams, setSearchParams] = useSearchParams()
  const claveDia = searchParams.get('dia')
  const fecha = useMemo(() => diaDesdeClave(claveDia) ?? new Date(), [claveDia])
  const [mes, setMes] = useState(() => {
    const inicial = diaDesdeClave(claveDia) ?? new Date()
    return new Date(inicial.getFullYear(), inicial.getMonth(), 1)
  })

  function seleccionarDia(d: Date) {
    const params = new URLSearchParams(searchParams)
    // Hoy es el valor por defecto, no hace falta ensuciar la URL con él.
    if (mismoDia(d, new Date())) params.delete('dia')
    else params.set('dia', claveDiaLocal(d))
    // replace para que el botón de atrás no recorra cada día que se tocó.
    setSearchParams(params, { replace: true })
  }
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

  // Se cuenta sobre TODAS las comidas del día, sin los filtros de la vista:
  // es el progreso real del día, no el de lo que se está mostrando.
  const totalComidas = comidas.length
  const conSensacion = comidas.filter((c) =>
    sensaciones.some((s) => s.comidaId === c.id),
  ).length

  const cargando = cargandoComidas || cargandoSensaciones

  return (
    <div className="pb-24">
      <PageHeader title="Cómo Me Cae" />

      {/* Fuera del filtro por día a propósito: una comida de anoche sin
          registrar tiene que verse aunque estés mirando hoy. */}
      <div className="px-4 pb-1">
        <PendientesCard />
      </div>

      <CalendarioMes
        mes={mes}
        diaSeleccionado={fecha}
        onSeleccionarDia={(d) => {
          seleccionarDia(d)
          // Tocar un día del mes vecino mueve también la vista del mes.
          if (d.getMonth() !== mes.getMonth()) setMes(new Date(d.getFullYear(), d.getMonth(), 1))
        }}
        onCambiarMes={setMes}
      />

      <div className="mt-3 flex items-center justify-between px-4">
        <h2 className="font-medium capitalize text-slate-700 dark:text-slate-200">
          {formatFechaCorta(fecha.toISOString())}
        </h2>
        {!mismoDia(fecha, new Date()) && (
          <button
            onClick={() => {
              const hoy = new Date()
              seleccionarDia(hoy)
              setMes(new Date(hoy.getFullYear(), hoy.getMonth(), 1))
            }}
            className="rounded-full border border-slate-200 px-3 py-1 text-xs text-slate-600 dark:border-slate-700 dark:text-slate-300"
          >
            Ir a hoy
          </button>
        )}
      </div>

      {/* Progreso de lo que realmente hace falta para detectar patrones: no
          cuántas comidas cargaste, sino cuántas tienen su sensación anotada. */}
      {totalComidas > 0 && (
        <div className="mt-2 px-4">
          <div className="flex items-center justify-between gap-3 text-xs">
            <span className="text-slate-500 dark:text-slate-400">
              {conSensacion === totalComidas
                ? '✅ Todas las comidas del día tienen su sensación'
                : `${conSensacion} de ${totalComidas} comidas con sensación registrada`}
            </span>
          </div>
          <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
            <div
              className={`h-full rounded-full transition-all ${
                conSensacion === totalComidas ? 'bg-emerald-500' : 'bg-sky-500'
              }`}
              style={{ width: `${(conSensacion / totalComidas) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* Los contadores son del día que se está mirando, así que van debajo de
          su encabezado y no del calendario. */}
      <div className="mt-2 px-4">
        <ContadoresCard dia={fecha} />
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
