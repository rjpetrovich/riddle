import { supabase } from '../../lib/supabaseClient'
import type { ComidaCruda, SensacionCruda } from '../stats/patternDetection'

export interface DatosCrudos {
  comidas: ComidaCruda[]
  sensaciones: SensacionCruda[]
  nombresPorAlimentoId: Map<string, string>
}

export async function fetchDatosParaPatrones(usuarioId: string): Promise<DatosCrudos> {
  const [{ data: comidasData, error: errComidas }, { data: sensacionesData, error: errSensaciones }] =
    await Promise.all([
      supabase
        .from('comidas')
        .select('id, fecha_hora, nombre, comida_alimentos(alimento_id, alimentos_catalogo(id, nombre))')
        .eq('usuario_id', usuarioId),
      supabase
        .from('sensaciones')
        .select('comida_id, valoracion')
        .eq('usuario_id', usuarioId)
        .not('comida_id', 'is', null),
    ])

  if (errComidas) throw errComidas
  if (errSensaciones) throw errSensaciones

  const nombresPorAlimentoId = new Map<string, string>()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const comidas: ComidaCruda[] = (comidasData ?? []).map((c: any) => {
    const alimentoIds: string[] = []
    for (const ca of c.comida_alimentos ?? []) {
      if (ca.alimento_id) {
        alimentoIds.push(ca.alimento_id)
        if (ca.alimentos_catalogo?.nombre) {
          nombresPorAlimentoId.set(ca.alimento_id, ca.alimentos_catalogo.nombre)
        }
      }
    }
    return { id: c.id, fechaHora: c.fecha_hora, nombre: c.nombre, alimentoIds }
  })

  const sensaciones: SensacionCruda[] = (sensacionesData ?? [])
    .filter((s) => s.comida_id)
    .map((s) => ({ comidaId: s.comida_id as string, valoracion: s.valoracion }))

  return { comidas, sensaciones, nombresPorAlimentoId }
}
