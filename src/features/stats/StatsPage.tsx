import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { PageHeader } from '../../components/ui/PageHeader'
import { Card } from '../../components/ui/Card'
import { EmptyState } from '../../components/ui/EmptyState'
import { Spinner } from '../../components/ui/Spinner'
import { Chip } from '../../components/ui/Chip'
import { StatTile } from '../../components/ui/StatTile'
import { useAlimentosStatsEnRango } from '../foods/useFoodStats'
import { DivergingSentimentBar, LeyendaValoracion } from './DivergingSentimentBar'
import { COLOR_VALORACION } from './chartTokens'

type Periodo = 'semana' | 'mes'

function inicioDePeriodo(periodo: Periodo) {
  const dias = periodo === 'semana' ? 7 : 30
  return new Date(Date.now() - dias * 24 * 60 * 60 * 1000).toISOString()
}

export function StatsPage() {
  const navigate = useNavigate()
  const [periodo, setPeriodo] = useState<Periodo>('semana')
  const desde = useMemo(() => inicioDePeriodo(periodo), [periodo])
  const hasta = useMemo(() => new Date().toISOString(), [])
  const { data: alimentos, isLoading } = useAlimentosStatsEnRango(desde, hasta)

  const conRegistros = alimentos.filter((a) => a.conSensacion > 0)
  const sospechosos = alimentos.filter((a) => a.sospechoso)
  const seguros = alimentos.filter((a) => a.seguro)

  // Ordenados por cuánto se inclinan hacia "mal": lo accionable primero.
  const ordenados = [...conRegistros].sort((a, b) => b.pctMal - a.pctMal || b.conSensacion - a.conSensacion)

  const totales = conRegistros.reduce(
    (acc, a) => ({ bien: acc.bien + a.bien, neutro: acc.neutro + a.neutro, mal: acc.mal + a.mal }),
    { bien: 0, neutro: 0, mal: 0 },
  )
  const totalRegistros = totales.bien + totales.neutro + totales.mal
  const pctBienGlobal = totalRegistros > 0 ? Math.round((totales.bien / totalRegistros) * 100) : 0

  // Cuántos ingredientes aún no tienen registros suficientes para concluir algo.
  const sinDatosSuficientes = alimentos.filter((a) => a.conSensacion > 0 && a.conSensacion < 3).length

  return (
    // Más margen inferior que otras pantallas: acá el contenido termina en
    // texto explicativo, que el botón flotante tapaba.
    <div className="pb-36">
      <PageHeader title="Patrones" />

      <div className="flex gap-2 px-4">
        <Chip
          label="Última semana"
          selected={periodo === 'semana'}
          onClick={() => setPeriodo('semana')}
        />
        <Chip label="Último mes" selected={periodo === 'mes'} onClick={() => setPeriodo('mes')} />
      </div>

      {isLoading ? (
        <div className="flex justify-center py-10">
          <Spinner />
        </div>
      ) : conRegistros.length === 0 ? (
        <div className="px-4 pt-4">
          <EmptyState
            title="Todavía no hay datos para este período"
            subtitle="Los patrones salen de comidas que tengan ingredientes cargados y una sensación registrada."
          />
        </div>
      ) : (
        <div className="mt-4 flex flex-col gap-4 px-4">
          <div className="flex gap-2">
            <StatTile
              valor={`${pctBienGlobal}%`}
              etiqueta="te cayó bien"
              detalle={`${totalRegistros} registros`}
              acento={COLOR_VALORACION.bien}
            />
            <StatTile
              valor={sospechosos.length}
              etiqueta={sospechosos.length === 1 ? 'sospechoso' : 'sospechosos'}
              detalle="+60% mal"
              acento={sospechosos.length > 0 ? COLOR_VALORACION.mal : undefined}
            />
            <StatTile
              valor={seguros.length}
              etiqueta={seguros.length === 1 ? 'seguro' : 'seguros'}
              detalle="siempre bien"
            />
          </div>

          {sospechosos.length > 0 && (
            <Card>
              <h2 className="font-medium text-slate-900 dark:text-slate-100">
                {sospechosos.length === 1
                  ? 'Este ingrediente te viene cayendo mal'
                  : 'Estos ingredientes te vienen cayendo mal'}
              </h2>
              <p className="mt-1 mb-3 text-sm text-slate-500 dark:text-slate-400">
                Al menos 3 registros y más del 60% asociados a "mal". Es una señal para observar, no
                un diagnóstico.
              </p>
              <ul className="flex flex-col gap-2">
                {sospechosos.map((a) => (
                  <li key={a.alimentoId}>
                    <button
                      type="button"
                      onClick={() => navigate(`/ingredientes/${a.alimentoId}`)}
                      className="flex w-full items-center justify-between gap-3 rounded-xl border border-red-200 px-3 py-2 text-left dark:border-red-500/30"
                    >
                      <span className="truncate text-sm text-slate-800 dark:text-slate-100">
                        {a.nombre}
                      </span>
                      <span className="shrink-0 text-sm tabular-nums text-slate-500 dark:text-slate-400">
                        {Math.round(a.pctMal * 100)}% mal · {a.conSensacion} reg.
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </Card>
          )}

          <Card>
            <div className="mb-1 flex items-baseline justify-between gap-2">
              <h2 className="font-medium text-slate-900 dark:text-slate-100">
                Cómo te cayó cada ingrediente
              </h2>
            </div>
            <div className="mb-3">
              <LeyendaValoracion />
            </div>
            <DivergingSentimentBar
              datos={ordenados}
              onSeleccionar={(id) => navigate(`/ingredientes/${id}`)}
            />
          </Card>

          {sinDatosSuficientes > 0 && (
            <p className="px-1 text-xs text-slate-400">
              {sinDatosSuficientes}{' '}
              {sinDatosSuficientes === 1
                ? 'ingrediente todavía tiene menos de 3 registros'
                : 'ingredientes todavía tienen menos de 3 registros'}
              , hace falta ese mínimo para marcarlos como sospechosos o seguros.
            </p>
          )}
        </div>
      )}
    </div>
  )
}
