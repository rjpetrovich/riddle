import { useParams } from 'react-router-dom'
import { PageHeader } from '../../components/ui/PageHeader'
import { Card } from '../../components/ui/Card'
import { Spinner } from '../../components/ui/Spinner'
import { EmptyState } from '../../components/ui/EmptyState'
import { ValoracionBadge } from '../../components/ui/ValoracionBadge'
import { formatFechaHora } from '../../lib/dateUtils'
import { useFoodDetail } from './useFoodStats'

export function FoodDetailPage() {
  const { id } = useParams()
  const { nombre, ocurrencias, isLoading } = useFoodDetail(id)

  if (isLoading) {
    return (
      <div className="flex min-h-dvh items-center justify-center">
        <Spinner />
      </div>
    )
  }

  return (
    <div className="pb-24">
      <PageHeader title={nombre || 'Alimento'} />
      <div className="flex flex-col gap-3 px-4">
        {ocurrencias.length === 0 ? (
          <EmptyState title="No hay registros para este alimento" />
        ) : (
          ocurrencias.map((o) => (
            <Card key={o.comidaId}>
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs text-slate-400">{formatFechaHora(o.fechaHora)}</span>
                {o.valoracion ? (
                  <ValoracionBadge valoracion={o.valoracion} />
                ) : (
                  <span className="text-xs text-slate-400">sin sensación registrada</span>
                )}
              </div>
              <p className="mt-1 font-medium text-slate-900 dark:text-slate-100">{o.nombreComida}</p>
              {o.otrosIngredientes.length > 0 && (
                <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">
                  combinado con: {o.otrosIngredientes.join(', ')}
                </p>
              )}
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
