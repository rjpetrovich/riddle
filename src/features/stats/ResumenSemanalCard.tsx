import { Card } from '../../components/ui/Card'
import { COLOR_VALORACION } from './chartTokens'
import type { ResumenSemanal } from './patternDetection'

function Linea({ icono, children }: { icono: string; children: React.ReactNode }) {
  return (
    <li className="flex gap-2 text-sm text-slate-700 dark:text-slate-200">
      <span aria-hidden>{icono}</span>
      <span className="min-w-0">{children}</span>
    </li>
  )
}

/**
 * Celebra conocimiento ganado, no obediencia.
 *
 * A propósito no hay rachas ni puntos: en una app de comida, premiar la
 * constancia empuja a registrar para no "perder" la racha, y eso ensucia los
 * datos —se anotan menos los días malos— además de traer la culpa que esta app
 * quiere evitar. Lo que motiva acá es ver que registrar sirvió para saber algo.
 */
export function ResumenSemanalCard({ resumen }: { resumen: ResumenSemanal }) {
  const {
    nuevosConDatos,
    nuevosSospechosos,
    nuevosSeguros,
    registrosNuevos,
    aUnRegistro,
  } = resumen

  const hayNovedades =
    nuevosConDatos.length > 0 || nuevosSospechosos.length > 0 || nuevosSeguros.length > 0
  // Sin registros nuevos ni nada por delante, la tarjeta no aporta.
  if (!hayNovedades && aUnRegistro.length === 0 && registrosNuevos === 0) return null

  return (
    <Card>
      <h2 className="font-medium text-slate-900 dark:text-slate-100">Lo que aprendiste</h2>
      <p className="mt-0.5 mb-3 text-sm text-slate-500 dark:text-slate-400">
        {registrosNuevos > 0
          ? `${registrosNuevos} ${registrosNuevos === 1 ? 'sensación registrada' : 'sensaciones registradas'} en este período.`
          : 'Todavía sin sensaciones nuevas en este período.'}
      </p>

      <ul className="flex flex-col gap-2">
        {nuevosSospechosos.length > 0 && (
          <Linea icono="🔍">
            Ahora sabés que{' '}
            <strong style={{ color: COLOR_VALORACION.mal }}>{nuevosSospechosos.join(', ')}</strong>{' '}
            te viene cayendo mal.
          </Linea>
        )}
        {nuevosSeguros.length > 0 && (
          <Linea icono="✅">
            <strong style={{ color: COLOR_VALORACION.bien }}>{nuevosSeguros.join(', ')}</strong>{' '}
            {nuevosSeguros.length === 1 ? 'demostró' : 'demostraron'} caerte siempre bien.
          </Linea>
        )}
        {nuevosConDatos.length > 0 && (
          <Linea icono="📊">
            {nuevosConDatos.length}{' '}
            {nuevosConDatos.length === 1
              ? 'ingrediente llegó a tener datos suficientes'
              : 'ingredientes llegaron a tener datos suficientes'}
            : {nuevosConDatos.join(', ')}.
          </Linea>
        )}
        {aUnRegistro.length > 0 && (
          // Lo más accionable: a estos les falta una sola sensación.
          <Linea icono="🎯">
            A un solo registro de saber algo: <strong>{aUnRegistro.join(', ')}</strong>.
          </Linea>
        )}
      </ul>
    </Card>
  )
}
