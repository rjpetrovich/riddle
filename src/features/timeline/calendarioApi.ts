import { supabase } from '../../lib/supabaseClient'
import type { RegistroDia, SensacionDia } from './calendario'

/**
 * Datos mínimos para pintar el mes: solo fecha y valoración.
 *
 * Se consulta aparte del timeline del día en vez de reusar los datos de
 * patrones, que traen ingredientes y notas de todo el historial: para colorear
 * casillas alcanza con esto, y el mes se navega seguido.
 */
export async function fetchResumenMes(
  usuarioId: string,
  desdeISO: string,
  hastaISO: string,
): Promise<{ comidas: RegistroDia[]; sensaciones: SensacionDia[] }> {
  const [{ data: comidas, error: errC }, { data: sensaciones, error: errS }] = await Promise.all([
    supabase
      .from('comidas')
      .select('fecha_hora')
      .eq('usuario_id', usuarioId)
      .gte('fecha_hora', desdeISO)
      .lte('fecha_hora', hastaISO),
    supabase
      .from('sensaciones')
      .select('fecha_hora, valoracion')
      .eq('usuario_id', usuarioId)
      .gte('fecha_hora', desdeISO)
      .lte('fecha_hora', hastaISO),
  ])

  if (errC) throw errC
  if (errS) throw errS

  return {
    comidas: (comidas ?? []).map((c) => ({ fechaHora: c.fecha_hora })),
    sensaciones: (sensaciones ?? []).map((s) => ({
      fechaHora: s.fecha_hora,
      valoracion: s.valoracion,
    })),
  }
}
