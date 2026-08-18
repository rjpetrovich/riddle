import { useNavigate } from 'react-router-dom'
import { Card } from '../../components/ui/Card'
import { ValoracionBadge } from '../../components/ui/ValoracionBadge'
import { formatHora } from '../../lib/dateUtils'
import type { Comida, Sensacion, Sintoma } from '../../types/domain'
import { TIPOS_COMIDA } from '../../types/domain'

export function ComidaCard({
  comida,
  onEliminar,
}: {
  comida: Comida
  onEliminar: (id: string) => void
}) {
  const navigate = useNavigate()
  const tipoLabel = TIPOS_COMIDA.find((t) => t.value === comida.tipoComida)?.label

  return (
    <Card className="flex gap-3">
      {comida.fotoUrl && (
        <img
          src={comida.fotoUrl}
          alt={comida.nombre}
          className="h-16 w-16 flex-none rounded-xl object-cover"
        />
      )}
      <div className="flex-1">
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs font-medium uppercase tracking-wide text-emerald-600 dark:text-emerald-400">
            {tipoLabel} · {formatHora(comida.fechaHora)}
          </span>
          <div className="flex gap-2 text-xs text-slate-400">
            <button onClick={() => navigate(`/comida/${comida.id}/editar`)} aria-label="Editar">
              ✏️
            </button>
            <button
              onClick={() => window.confirm('¿Borrar este registro?') && onEliminar(comida.id)}
              aria-label="Borrar"
            >
              🗑️
            </button>
          </div>
        </div>
        <p className="mt-0.5 font-medium text-slate-900 dark:text-slate-100">{comida.nombre}</p>
        {comida.alimentos.length > 0 && (
          <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">
            {comida.alimentos.map((a) => a.nombre).join(', ')}
          </p>
        )}
        {comida.notas && <p className="mt-1 text-sm italic text-slate-400">{comida.notas}</p>}
      </div>
    </Card>
  )
}

export function SensacionCard({
  sensacion,
  sintomas,
  onEliminar,
}: {
  sensacion: Sensacion
  sintomas: Sintoma[]
  onEliminar: (id: string) => void
}) {
  const navigate = useNavigate()
  const nombresSintomas = sintomas
    .filter((s) => sensacion.sintomaIds.includes(s.id))
    .map((s) => s.nombre)

  return (
    <Card>
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <ValoracionBadge valoracion={sensacion.valoracion} />
          <span className="text-xs text-slate-400">{formatHora(sensacion.fechaHora)}</span>
        </div>
        <div className="flex gap-2 text-xs text-slate-400">
          <button onClick={() => navigate(`/sensacion/${sensacion.id}/editar`)} aria-label="Editar">
            ✏️
          </button>
          <button
            onClick={() => window.confirm('¿Borrar este registro?') && onEliminar(sensacion.id)}
            aria-label="Borrar"
          >
            🗑️
          </button>
        </div>
      </div>
      {nombresSintomas.length > 0 && (
        <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400">
          {nombresSintomas.join(', ')}
          {sensacion.intensidad ? ` · intensidad ${sensacion.intensidad}/5` : ''}
        </p>
      )}
      {sensacion.notas && <p className="mt-1 text-sm italic text-slate-400">{sensacion.notas}</p>}
    </Card>
  )
}
