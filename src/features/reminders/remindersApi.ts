import { supabase } from '../../lib/supabaseClient'

export interface ComidaPendiente {
  id: string
  nombre: string
  fechaHora: string
}

/**
 * Comidas de las últimas `horas` que todavía no tienen ninguna sensación.
 *
 * Es el corazón del recordatorio: los efectos de una comida (digestión,
 * hinchazón, energía) aparecen horas después, así que sin algo que las traiga
 * de vuelta a la vista quedan sin registrar y no alimentan ningún patrón.
 */
export async function fetchComidasSinSensacion(
  usuarioId: string,
  horas = 12,
): Promise<ComidaPendiente[]> {
  const desde = new Date(Date.now() - horas * 60 * 60 * 1000).toISOString()

  const { data: comidas, error: errComidas } = await supabase
    .from('comidas')
    .select('id, nombre, fecha_hora')
    .eq('usuario_id', usuarioId)
    .gte('fecha_hora', desde)
    .order('fecha_hora', { ascending: false })
  if (errComidas) throw errComidas
  if (!comidas || comidas.length === 0) return []

  // Se buscan las sensaciones por id de comida y no por fecha: la hora de una
  // sensación es editable, así que un filtro temporal podría no encontrarla y
  // haría reaparecer como pendiente una comida ya registrada.
  const { data: sensaciones, error: errSens } = await supabase
    .from('sensaciones')
    .select('comida_id')
    .eq('usuario_id', usuarioId)
    .in(
      'comida_id',
      comidas.map((c) => c.id),
    )
  if (errSens) throw errSens

  const yaRegistradas = new Set((sensaciones ?? []).map((s) => s.comida_id))
  return comidas
    .filter((c) => !yaRegistradas.has(c.id))
    .map((c) => ({ id: c.id, nombre: c.nombre, fechaHora: c.fecha_hora }))
}
