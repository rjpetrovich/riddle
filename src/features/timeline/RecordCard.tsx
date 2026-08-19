import { useNavigate } from 'react-router-dom'
import { Card } from '../../components/ui/Card'
import { ValoracionBadge } from '../../components/ui/ValoracionBadge'
import { formatHora } from '../../lib/dateUtils'
import type { Comida, Sensacion, Sintoma } from '../../types/domain'
import { TIPOS_COMIDA } from '../../types/domain'

function AccionesRegistro({
  onEditar,
  onEliminar,
}: {
  onEditar: () => void
  onEliminar: () => void
}) {
  return (
    <div className="flex gap-2 text-xs text-slate-400">
      <button onClick={onEditar} aria-label="Editar">
        ✏️
      </button>
      <button
        onClick={() => window.confirm('¿Borrar este registro?') && onEliminar()}
        aria-label="Borrar"
      >
        🗑️
      </button>
    </div>
  )
}

function DetalleSensacion({
  sensacion,
  sintomas,
}: {
  sensacion: Sensacion
  sintomas: Sintoma[]
}) {
  const nombres = sintomas
    .filter((s) => sensacion.sintomaIds.includes(s.id))
    .map((s) => s.nombre)

  return (
    <>
      {nombres.length > 0 && (
        <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400">
          {nombres.join(', ')}
          {sensacion.intensidad ? ` · intensidad ${sensacion.intensidad}/5` : ''}
        </p>
      )}
      {sensacion.notas && <p className="mt-1 text-sm italic text-slate-400">{sensacion.notas}</p>}
    </>
  )
}

export function ComidaCard({
  comida,
  sensaciones,
  tieneSensaciones,
  sintomas,
  onEliminar,
  onEliminarSensacion,
}: {
  comida: Comida
  /** Las que se muestran acá dentro; pueden venir recortadas por un filtro. */
  sensaciones: Sensacion[]
  /** Si la comida tiene alguna sensación en la base, más allá del filtro. */
  tieneSensaciones: boolean
  sintomas: Sintoma[]
  onEliminar: (id: string) => void
  onEliminarSensacion: (id: string) => void
}) {
  const navigate = useNavigate()
  const tipoLabel = TIPOS_COMIDA.find((t) => t.value === comida.tipoComida)?.label

  return (
    <Card>
      <div className="flex gap-3">
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
            <AccionesRegistro
              onEditar={() => navigate(`/comida/${comida.id}/editar`)}
              onEliminar={() => onEliminar(comida.id)}
            />
          </div>
          <p className="mt-0.5 font-medium text-slate-900 dark:text-slate-100">{comida.nombre}</p>
          {comida.alimentos.length > 0 && (
            <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">
              {comida.alimentos.map((a) => a.nombre).join(', ')}
            </p>
          )}
          {comida.notas && <p className="mt-1 text-sm italic text-slate-400">{comida.notas}</p>}
        </div>
      </div>

      {sensaciones.length > 0 ? (
        <div className="mt-3 space-y-2 border-t border-slate-100 pt-3 dark:border-slate-800">
          {sensaciones.map((s) => (
            <div key={s.id}>
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <ValoracionBadge valoracion={s.valoracion} />
                  <span className="text-xs text-slate-400">{formatHora(s.fechaHora)}</span>
                </div>
                <AccionesRegistro
                  onEditar={() => navigate(`/sensacion/${s.id}/editar`)}
                  onEliminar={() => onEliminarSensacion(s.id)}
                />
              </div>
              <DetalleSensacion sensacion={s} sintomas={sintomas} />
            </div>
          ))}
        </div>
      ) : tieneSensaciones ? null : (
        <button
          onClick={() => navigate(`/sensacion/nueva?comida=${comida.id}`)}
          className="mt-3 w-full rounded-xl border border-dashed border-slate-300 py-2 text-sm text-slate-500 transition-colors hover:border-emerald-500 hover:text-emerald-600 dark:border-slate-700 dark:text-slate-400 dark:hover:border-emerald-500 dark:hover:text-emerald-400"
        >
          ¿Cómo te cayó?
        </button>
      )}
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

  return (
    <Card>
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <ValoracionBadge valoracion={sensacion.valoracion} />
          <span className="text-xs text-slate-400">{formatHora(sensacion.fechaHora)}</span>
        </div>
        <AccionesRegistro
          onEditar={() => navigate(`/sensacion/${sensacion.id}/editar`)}
          onEliminar={() => onEliminar(sensacion.id)}
        />
      </div>
      <DetalleSensacion sensacion={sensacion} sintomas={sintomas} />
    </Card>
  )
}
