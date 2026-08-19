import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { useAuth } from '../auth/AuthProvider'
import { claveDiaLocal } from '../../lib/dateUtils'
import { COLOR_VALORACION, ETIQUETA_VALORACION } from '../stats/chartTokens'
import { construirGrillaMes, mismoDia, rangoDelMes, resumirPorDia } from './calendario'
import { fetchResumenMes } from './calendarioApi'

const DIAS_SEMANA = ['L', 'M', 'M', 'J', 'V', 'S', 'D']

export function CalendarioMes({
  mes,
  diaSeleccionado,
  onSeleccionarDia,
  onCambiarMes,
}: {
  mes: Date
  diaSeleccionado: Date
  onSeleccionarDia: (dia: Date) => void
  onCambiarMes: (mes: Date) => void
}) {
  const { user } = useAuth()
  const { desde, hasta } = useMemo(() => rangoDelMes(mes), [mes])

  const { data } = useQuery({
    queryKey: ['calendario', user?.id, desde, hasta],
    queryFn: () => fetchResumenMes(user!.id, desde, hasta),
    enabled: !!user,
  })

  const resumen = useMemo(
    () => resumirPorDia(data?.comidas ?? [], data?.sensaciones ?? []),
    [data],
  )
  const dias = useMemo(() => construirGrillaMes(mes), [mes])
  const hoy = new Date()

  function moverMes(delta: number) {
    onCambiarMes(new Date(mes.getFullYear(), mes.getMonth() + delta, 1))
  }

  return (
    <section className="px-4">
      <div className="flex items-center justify-between">
        <button
          onClick={() => moverMes(-1)}
          aria-label="Mes anterior"
          className="rounded-full px-3 py-1 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
        >
          ‹
        </button>
        <span className="text-sm font-medium capitalize text-slate-700 dark:text-slate-200">
          {format(mes, 'MMMM yyyy', { locale: es })}
        </span>
        <button
          onClick={() => moverMes(1)}
          aria-label="Mes siguiente"
          className="rounded-full px-3 py-1 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
        >
          ›
        </button>
      </div>

      <div className="mt-2 grid grid-cols-7 gap-1">
        {DIAS_SEMANA.map((d, i) => (
          <span key={i} className="pb-1 text-center text-[11px] text-slate-400">
            {d}
          </span>
        ))}

        {dias.map((dia) => {
          const clave = claveDiaLocal(dia)
          const info = resumen.get(clave)
          const delMes = dia.getMonth() === mes.getMonth()
          const seleccionado = mismoDia(dia, diaSeleccionado)
          const esHoy = mismoDia(dia, hoy)

          const descripcion = info
            ? `${info.comidas} ${info.comidas === 1 ? 'comida' : 'comidas'}${
                info.valoracion ? `, ${ETIQUETA_VALORACION[info.valoracion].toLowerCase()}` : ''
              }`
            : 'sin registros'

          return (
            <button
              key={clave}
              type="button"
              onClick={() => onSeleccionarDia(dia)}
              aria-label={`${format(dia, "d 'de' MMMM", { locale: es })}: ${descripcion}`}
              aria-current={seleccionado ? 'date' : undefined}
              className={`flex aspect-square flex-col items-center justify-center gap-1 rounded-xl text-sm transition-colors ${
                seleccionado
                  ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900'
                  : delMes
                    ? 'text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800'
                    : 'text-slate-300 dark:text-slate-600'
              }`}
            >
              <span className={esHoy && !seleccionado ? 'font-bold' : undefined}>
                {dia.getDate()}
              </span>
              {/* El punto resume el día; el número y la etiqueta accesible
                  siguen ahí, así que el color nunca es la única información. */}
              <span
                className="h-1.5 w-1.5 rounded-full"
                style={{
                  background: info?.valoracion
                    ? COLOR_VALORACION[info.valoracion]
                    : info?.comidas
                      ? 'currentColor'
                      : 'transparent',
                  opacity: info?.valoracion ? 1 : info?.comidas ? 0.35 : 0,
                }}
                aria-hidden
              />
            </button>
          )
        })}
      </div>

      <p className="mt-2 text-[11px] text-slate-400">
        El punto muestra cómo cayó el día. Gris tenue: hay comidas sin sensación registrada.
      </p>
    </section>
  )
}
