import { useState } from 'react'
import { COLOR_VALORACION, ETIQUETA_VALORACION } from './chartTokens'
import type { AlimentoStats } from './patternDetection'

/**
 * Barra divergente apilada, centrada en el neutro.
 *
 * Es la forma que corresponde a una escala ordenada de sentimiento: al quedar
 * todas las filas alineadas sobre un mismo eje central, se compara de un
 * vistazo cuánto se inclina cada ingrediente hacia "mal" (izquierda) o hacia
 * "bien" (derecha), algo que una barra apilada común no deja ver.
 *
 * Como es habitual en este tipo de gráfico, el neutro se reparte mitad y mitad
 * a cada lado del centro.
 */
function Fila({
  stats,
  onSeleccionar,
}: {
  stats: AlimentoStats
  onSeleccionar: () => void
}) {
  const [activo, setActivo] = useState<string | null>(null)
  const total = stats.conSensacion
  if (total === 0) return null

  const pctMal = stats.mal / total
  const pctNeutro = stats.neutro / total
  const pctBien = stats.bien / total
  const mitadNeutro = pctNeutro / 2

  // Ordenados desde el centro hacia afuera: el neutro se apoya sobre el eje y
  // los polos crecen por fuera. Cada mitad representa hasta el 100% de los
  // registros de esa fila, así que el ancho es el porcentaje dentro de la
  // mitad; usar el porcentaje sobre el total desbordaba y flex lo encogía,
  // dejando las filas sin un eje común (que es lo único que hace útil a una
  // barra divergente).
  const segmentos = [
    { clave: 'neutro-izq', valor: stats.neutro, ancho: mitadNeutro, lado: 'izq' as const },
    { clave: 'mal' as const, valor: stats.mal, ancho: pctMal, lado: 'izq' as const },
    { clave: 'neutro-der', valor: stats.neutro, ancho: mitadNeutro, lado: 'der' as const },
    { clave: 'bien' as const, valor: stats.bien, ancho: pctBien, lado: 'der' as const },
  ]

  function colorDe(clave: string) {
    if (clave.startsWith('neutro')) return COLOR_VALORACION.neutro
    return COLOR_VALORACION[clave as 'mal' | 'bien']
  }

  function etiquetaDe(clave: string) {
    if (clave.startsWith('neutro')) return ETIQUETA_VALORACION.neutro
    return ETIQUETA_VALORACION[clave as 'mal' | 'bien']
  }

  const izquierdos = segmentos.filter((s) => s.lado === 'izq')
  const derechos = segmentos.filter((s) => s.lado === 'der')

  return (
    <li>
      <button
        type="button"
        onClick={onSeleccionar}
        className="w-full text-left"
        aria-label={`${stats.nombre}: ${stats.mal} mal, ${stats.neutro} neutro, ${stats.bien} bien de ${total} registros`}
      >
        <div className="flex items-baseline justify-between gap-2">
          <span className="truncate text-sm text-slate-700 dark:text-slate-200">{stats.nombre}</span>
          <span className="shrink-0 text-[11px] tabular-nums text-slate-400">
            {total} de {stats.vecesComido}
          </span>
        </div>

        <div className="relative mt-1 flex h-5 items-stretch">
          {/* Mitad izquierda: se llena desde el centro hacia afuera. */}
          <div className="flex flex-1 flex-row-reverse overflow-hidden">
            {izquierdos.map((s, i) =>
              s.ancho > 0 ? (
                <div
                  key={s.clave}
                  onMouseEnter={() => setActivo(s.clave)}
                  onMouseLeave={() => setActivo(null)}
                  className="h-full shrink-0"
                  style={{
                    width: `${s.ancho * 100}%`,
                    background: colorDe(s.clave),
                    // 2px de superficie entre rellenos, y extremo redondeado
                    // solo del lado de afuera: el centro queda a ras del eje.
                    marginRight: i === 0 ? 0 : 2,
                    borderTopLeftRadius: 4,
                    borderBottomLeftRadius: 4,
                  }}
                />
              ) : null,
            )}
          </div>

          {/* Eje central: recesivo, es referencia, no dato. */}
          <div className="w-px shrink-0 bg-slate-300 dark:bg-slate-600" />

          <div className="flex flex-1 flex-row overflow-hidden">
            {derechos.map((s, i) =>
              s.ancho > 0 ? (
                <div
                  key={s.clave}
                  onMouseEnter={() => setActivo(s.clave)}
                  onMouseLeave={() => setActivo(null)}
                  className="h-full shrink-0"
                  style={{
                    width: `${s.ancho * 100}%`,
                    background: colorDe(s.clave),
                    marginLeft: i === 0 ? 0 : 2,
                    borderTopRightRadius: 4,
                    borderBottomRightRadius: 4,
                  }}
                />
              ) : null,
            )}
          </div>

          {activo && (
            <div className="pointer-events-none absolute -top-7 left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded-lg bg-slate-900 px-2 py-1 text-[11px] text-white shadow-lg dark:bg-slate-700">
              {etiquetaDe(activo)}: {segmentos.find((s) => s.clave === activo)?.valor} de {total}
            </div>
          )}
        </div>
      </button>
    </li>
  )
}

export function DivergingSentimentBar({
  datos,
  onSeleccionar,
}: {
  datos: AlimentoStats[]
  onSeleccionar: (alimentoId: string) => void
}) {
  return (
    <div>
      <ul className="flex flex-col gap-3">
        {datos.map((d) => (
          <Fila key={d.alimentoId} stats={d} onSeleccionar={() => onSeleccionar(d.alimentoId)} />
        ))}
      </ul>
      <p className="mt-3 text-[11px] text-slate-400">
        Cada barra se reparte desde el centro: lo que cayó mal va a la izquierda y lo que cayó bien
        a la derecha. "3 de 5" son los registros con sensación anotada sobre las veces que lo comiste.
      </p>
    </div>
  )
}

/** Identidad nunca por color solo: la leyenda acompaña siempre al gráfico. */
export function LeyendaValoracion() {
  return (
    <ul className="flex flex-wrap items-center gap-x-4 gap-y-1">
      {(['mal', 'neutro', 'bien'] as const).map((v) => (
        <li key={v} className="flex items-center gap-1.5">
          <span
            className="h-2.5 w-2.5 rounded-sm"
            style={{ background: COLOR_VALORACION[v] }}
            aria-hidden
          />
          <span className="text-xs text-slate-500 dark:text-slate-400">
            {ETIQUETA_VALORACION[v]}
          </span>
        </li>
      ))}
    </ul>
  )
}
