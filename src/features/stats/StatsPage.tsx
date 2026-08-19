import { useMemo, useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { PageHeader } from '../../components/ui/PageHeader'
import { Card } from '../../components/ui/Card'
import { EmptyState } from '../../components/ui/EmptyState'
import { Spinner } from '../../components/ui/Spinner'
import { Chip } from '../../components/ui/Chip'
import { useAlimentosStatsEnRango } from '../foods/useFoodStats'
import { useNavigate } from 'react-router-dom'

type Periodo = 'semana' | 'mes'

function inicioDePeriodo(periodo: Periodo) {
  const dias = periodo === 'semana' ? 7 : 30
  return new Date(Date.now() - dias * 24 * 60 * 60 * 1000).toISOString()
}

export function StatsPage() {
  const navigate = useNavigate()
  const [periodo, setPeriodo] = useState<Periodo>('semana')
  const desde = useMemo(() => inicioDePeriodo(periodo), [periodo])
  const hasta = useMemo(() => new Date().toISOString(), [periodo])
  const { data: alimentos, isLoading } = useAlimentosStatsEnRango(desde, hasta)

  const sospechosos = alimentos.filter((a) => a.sospechoso).sort((a, b) => b.pctMal - a.pctMal)
  const seguros = alimentos.filter((a) => a.seguro).sort((a, b) => b.vecesComido - a.vecesComido)

  const chartData = alimentos
    .filter((a) => a.conSensacion > 0)
    .slice(0, 8)
    .map((a) => ({ nombre: a.nombre, bien: a.bien, neutro: a.neutro, mal: a.mal }))

  return (
    <div className="pb-24">
      <PageHeader title="Patrones" />

      <div className="flex gap-2 px-4">
        <Chip label="Última semana" selected={periodo === 'semana'} onClick={() => setPeriodo('semana')} />
        <Chip label="Último mes" selected={periodo === 'mes'} onClick={() => setPeriodo('mes')} />
      </div>

      {isLoading ? (
        <div className="flex justify-center py-10">
          <Spinner />
        </div>
      ) : alimentos.length === 0 ? (
        <div className="px-4 pt-4">
          <EmptyState title="Todavía no hay suficientes datos en este período" />
        </div>
      ) : (
        <div className="mt-4 flex flex-col gap-4 px-4">
          <Card>
            <h2 className="mb-1 font-medium text-slate-900 dark:text-slate-100">
              Posibles sospechosos
            </h2>
            <p className="mb-3 text-sm text-slate-500 dark:text-slate-400">
              Ingredientes con al menos 3 registros y más del 60% asociados a "mal".
            </p>
            {sospechosos.length === 0 ? (
              <p className="text-sm text-slate-400">Ninguno por ahora, buena señal.</p>
            ) : (
              <ul className="flex flex-col gap-2">
                {sospechosos.map((a) => (
                  <li
                    key={a.alimentoId}
                    onClick={() => navigate(`/ingredientes/${a.alimentoId}`)}
                    className="flex cursor-pointer items-center justify-between rounded-lg bg-red-50 px-3 py-2 text-sm dark:bg-red-500/10"
                  >
                    <span className="text-red-800 dark:text-red-300">{a.nombre}</span>
                    <span className="text-red-600 dark:text-red-400">
                      {Math.round(a.pctMal * 100)}% mal ({a.conSensacion} registros)
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          <Card>
            <h2 className="mb-1 font-medium text-slate-900 dark:text-slate-100">Ingredientes seguros</h2>
            <p className="mb-3 text-sm text-slate-500 dark:text-slate-400">
              Al menos 3 registros y siempre asociados a "bien".
            </p>
            {seguros.length === 0 ? (
              <p className="text-sm text-slate-400">Todavía no hay suficientes datos.</p>
            ) : (
              <ul className="flex flex-col gap-2">
                {seguros.map((a) => (
                  <li
                    key={a.alimentoId}
                    onClick={() => navigate(`/ingredientes/${a.alimentoId}`)}
                    className="flex cursor-pointer items-center justify-between rounded-lg bg-emerald-50 px-3 py-2 text-sm dark:bg-emerald-500/10"
                  >
                    <span className="text-emerald-800 dark:text-emerald-300">{a.nombre}</span>
                    <span className="text-emerald-600 dark:text-emerald-400">
                      {a.vecesComido} veces
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          {chartData.length > 0 && (
            <Card>
              <h2 className="mb-3 font-medium text-slate-900 dark:text-slate-100">
                Sensaciones por ingrediente (top 8)
              </h2>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} layout="vertical" margin={{ left: 8 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                    <XAxis type="number" allowDecimals={false} />
                    <YAxis type="category" dataKey="nombre" width={90} tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Bar dataKey="bien" stackId="a" fill="#16a34a" />
                    <Bar dataKey="neutro" stackId="a" fill="#d97706" />
                    <Bar dataKey="mal" stackId="a" fill="#dc2626" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>
          )}
        </div>
      )}
    </div>
  )
}
