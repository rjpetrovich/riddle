import { useNavigate } from 'react-router-dom'
import { PageHeader } from '../../components/ui/PageHeader'
import { EmptyState } from '../../components/ui/EmptyState'
import { Spinner } from '../../components/ui/Spinner'
import { Card } from '../../components/ui/Card'
import { useAlimentosStats } from './useFoodStats'
import type { AlimentoStats } from '../stats/patternDetection'

function colorDot(stats: AlimentoStats) {
  if (stats.conSensacion === 0) return 'bg-slate-300 dark:bg-slate-600'
  if (stats.sospechoso) return 'bg-red-500'
  if (stats.pctBien >= 0.6) return 'bg-emerald-500'
  return 'bg-amber-500'
}

export function FoodsListPage() {
  const navigate = useNavigate()
  const { data: alimentos, isLoading } = useAlimentosStats()

  return (
    <div className="pb-24">
      <PageHeader title="Ingredientes" />
      <div className="flex flex-col gap-2 px-4">
        {isLoading ? (
          <div className="flex justify-center py-10">
            <Spinner />
          </div>
        ) : alimentos.length === 0 ? (
          <EmptyState
            title="Todavía no registraste ingredientes"
            subtitle="Salen del campo Ingredientes de cada comida. Si cargaste comidas sin completarlo, editalas y agregalos para empezar a ver patrones."
          />
        ) : (
          alimentos.map((a) => (
            <Card
              key={a.alimentoId}
              className="flex cursor-pointer items-center justify-between gap-3"
              onClick={() => navigate(`/ingredientes/${a.alimentoId}`)}
            >
              <div className="flex items-center gap-3">
                <span className={`h-2.5 w-2.5 flex-none rounded-full ${colorDot(a)}`} />
                <div>
                  <p className="font-medium text-slate-900 dark:text-slate-100">{a.nombre}</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    {/* El porcentaje se calcula sobre los registros con
                        sensación, no sobre las veces que se comió: mostrarlos
                        juntos sin aclararlo hacía leer el "% bien" como si
                        fuera sobre el total. */}
                    {a.vecesComido} {a.vecesComido === 1 ? 'vez' : 'veces'}
                    {a.conSensacion > 0
                      ? ` · ${Math.round(a.pctBien * 100)}% bien de ${a.conSensacion} con registro`
                      : ' · sin sensaciones registradas'}
                  </p>
                </div>
              </div>
              {a.sospechoso && (
                <span className="rounded-full bg-red-100 px-2 py-1 text-xs font-medium text-red-700 dark:bg-red-500/15 dark:text-red-400">
                  posible sospechoso
                </span>
              )}
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
