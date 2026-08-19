import { useNavigate } from 'react-router-dom'
import { formatDistanceToNowStrict, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'
import { useComidasPendientes } from './useReminders'

export function PendientesCard() {
  const navigate = useNavigate()
  const { pendientes } = useComidasPendientes()

  if (pendientes.length === 0) return null

  return (
    <section className="rounded-2xl border border-amber-300 bg-amber-50 p-4 dark:border-amber-500/30 dark:bg-amber-500/10">
      <h2 className="text-sm font-medium text-amber-900 dark:text-amber-200">
        {pendientes.length === 1
          ? 'Te falta registrar cómo te cayó una comida'
          : `Te faltan registrar ${pendientes.length} comidas`}
      </h2>
      <p className="mt-0.5 text-xs text-amber-800/80 dark:text-amber-200/70">
        Sin esto no se pueden detectar patrones.
      </p>
      <ul className="mt-3 flex flex-col gap-2">
        {pendientes.map((c) => (
          <li key={c.id}>
            <button
              type="button"
              onClick={() => navigate(`/sensacion/nueva?comida=${c.id}`)}
              className="flex w-full items-center justify-between gap-3 rounded-xl bg-white/70 px-3 py-2 text-left dark:bg-slate-900/50"
            >
              <span className="min-w-0">
                <span className="block truncate text-sm text-slate-800 dark:text-slate-100">
                  {c.nombre}
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  hace{' '}
                  {formatDistanceToNowStrict(parseISO(c.fechaHora), { locale: es })}
                </span>
              </span>
              <span className="shrink-0 text-xs font-medium text-emerald-700 dark:text-emerald-400">
                Registrar
              </span>
            </button>
          </li>
        ))}
      </ul>
    </section>
  )
}
