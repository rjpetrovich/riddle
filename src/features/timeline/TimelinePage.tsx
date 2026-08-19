import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { PageHeader } from '../../components/ui/PageHeader'
import { EmptyState } from '../../components/ui/EmptyState'
import { Spinner } from '../../components/ui/Spinner'
import { useComidasRango, useEliminarComida } from '../meals/useMeals'
import { useEliminarSensacion, useSensacionesRango, useSintomas } from '../feelings/useFeelings'
import { ComidaCard, SensacionCard } from './RecordCard'
import { formatFechaCorta } from '../../lib/dateUtils'
import { TIPOS_COMIDA, type TipoComida, type Valoracion } from '../../types/domain'

function startEndOfDay(date: Date) {
  const start = new Date(date)
  start.setHours(0, 0, 0, 0)
  const end = new Date(date)
  end.setHours(23, 59, 59, 999)
  return { start: start.toISOString(), end: end.toISOString() }
}

type Item =
  | {
      tipo: 'comida'
      fechaHora: string
      data: import('../../types/domain').Comida
      sensaciones: import('../../types/domain').Sensacion[]
      tieneSensaciones: boolean
    }
  | { tipo: 'sensacion'; fechaHora: string; data: import('../../types/domain').Sensacion }

export function TimelinePage() {
  const navigate = useNavigate()
  const [fecha, setFecha] = useState(new Date())
  const [filtroTipoComida, setFiltroTipoComida] = useState<TipoComida | ''>('')
  const [filtroValoracion, setFiltroValoracion] = useState<Valoracion | ''>('')

  const { start, end } = useMemo(() => startEndOfDay(fecha), [fecha])
  const { data: comidas = [], isLoading: cargandoComidas } = useComidasRango(start, end)
  const { data: sensaciones = [], isLoading: cargandoSensaciones } = useSensacionesRango(start, end)
  const { data: sintomas = [] } = useSintomas()
  const eliminarComida = useEliminarComida()
  const eliminarSensacion = useEliminarSensacion()

  const items: Item[] = useMemo(() => {
    const comidasFiltradas = filtroTipoComida
      ? comidas.filter((c) => c.tipoComida === filtroTipoComida)
      : comidas
    // Las sensaciones asociadas a una comida se muestran dentro de su tarjeta.
    // Las independientes —y las que apuntan a una comida de otro día, que no
    // está en esta vista— van sueltas para que no desaparezcan del historial.
    //
    // El agrupado se hace sobre las sensaciones SIN filtrar: si filtrara antes,
    // una comida cuya sensación no pasa el filtro parecería no tener ninguna y
    // la tarjeta ofrecería "¿Cómo te cayó?", invitando a cargar una segunda
    // sensación para la misma comida y desbalanceando las estadísticas.
    const idsComidasVisibles = new Set(comidasFiltradas.map((c) => c.id))
    const sensacionesPorComida = new Map<string, typeof sensaciones>()
    const sensacionesSueltas: typeof sensaciones = []

    for (const s of sensaciones) {
      if (s.comidaId && idsComidasVisibles.has(s.comidaId)) {
        const previas = sensacionesPorComida.get(s.comidaId) ?? []
        sensacionesPorComida.set(s.comidaId, [...previas, s])
      } else {
        sensacionesSueltas.push(s)
      }
    }

    const coincideFiltro = (s: (typeof sensaciones)[number]) =>
      !filtroValoracion || s.valoracion === filtroValoracion

    const comidasItems = comidasFiltradas.flatMap((c) => {
      const propias = (sensacionesPorComida.get(c.id) ?? []).sort((a, b) =>
        a.fechaHora < b.fechaHora ? -1 : 1,
      )
      const visibles = propias.filter(coincideFiltro)
      // Con un filtro de valoración activo, una comida solo entra si alguna de
      // sus sensaciones coincide; las que no tienen ninguna no aplican.
      if (filtroValoracion && visibles.length === 0) return []
      return [
        {
          tipo: 'comida' as const,
          fechaHora: c.fechaHora,
          data: c,
          sensaciones: visibles,
          // La invitación a registrar depende de la realidad, no de lo filtrado.
          tieneSensaciones: propias.length > 0,
        },
      ]
    })

    const todos: Item[] = [
      ...comidasItems,
      ...sensacionesSueltas.filter(coincideFiltro).map((s) => ({
        tipo: 'sensacion' as const,
        fechaHora: s.fechaHora,
        data: s,
      })),
    ]
    return todos.sort((a, b) => (a.fechaHora < b.fechaHora ? 1 : -1))
  }, [comidas, sensaciones, filtroTipoComida, filtroValoracion])

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
      <PageHeader
        title="Cómo Me Cae"
        action={
          // Las sensaciones de una comida se cargan desde su tarjeta; esto es
          // para las que no dependen de haber comido (sueño, ánimo, energía).
          <button
            onClick={() => navigate('/sensacion/nueva')}
            className="rounded-full border border-slate-200 px-3 py-1.5 text-sm text-slate-600 transition-colors hover:border-emerald-500 hover:text-emerald-600 dark:border-slate-700 dark:text-slate-300 dark:hover:border-emerald-500 dark:hover:text-emerald-400"
          >
            🙂 Cómo me siento
          </button>
        }
      />

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
