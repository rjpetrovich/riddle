import { supabase } from '../../lib/supabaseClient'
import { claveDiaLocal } from '../../lib/dateUtils'

/**
 * El registro del día: los contadores y las observaciones libres. Viven en la
 * misma fila (una por usuario y día), así que se leen y escriben juntos.
 */
export interface ContadoresDia {
  vasosAgua: number
  idasBano: number
  observaciones: string
}

export const CONTADORES_VACIOS: ContadoresDia = {
  vasosAgua: 0,
  idasBano: 0,
  observaciones: '',
}

export type TipoContador = 'vasosAgua' | 'idasBano'

export async function fetchContadores(usuarioId: string, dia: Date): Promise<ContadoresDia> {
  const { data, error } = await supabase
    .from('contadores_dia')
    .select('vasos_agua, idas_bano, observaciones')
    .eq('usuario_id', usuarioId)
    .eq('fecha', claveDiaLocal(dia))
    .maybeSingle()
  if (error) throw error
  if (!data) return CONTADORES_VACIOS
  return {
    vasosAgua: data.vasos_agua,
    idasBano: data.idas_bano,
    observaciones: data.observaciones ?? '',
  }
}

/**
 * Guarda los totales del día, no un incremento.
 *
 * Se manda el total y no un "+1" a propósito: si un toque se reenvía por una
 * conexión intermitente, sumaría dos veces. Con el total, repetir el pedido
 * deja el mismo resultado.
 *
 * Y se mandan siempre las dos columnas, aunque solo haya cambiado una: en un
 * upsert que enviara una sola, la otra podría terminar tomando el valor por
 * defecto de la fila nueva y volver a cero.
 */
export async function guardarContadores(
  usuarioId: string,
  dia: Date,
  contadores: ContadoresDia,
): Promise<void> {
  const limpio = (n: number) => Math.max(0, Math.round(n))
  const { error } = await supabase.from('contadores_dia').upsert(
    {
      usuario_id: usuarioId,
      fecha: claveDiaLocal(dia),
      vasos_agua: limpio(contadores.vasosAgua),
      idas_bano: limpio(contadores.idasBano),
      observaciones: contadores.observaciones.trim() || null,
    },
    { onConflict: 'usuario_id,fecha' },
  )
  if (error) throw error
}

export async function fetchContarBano(usuarioId: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('profiles')
    .select('contar_bano')
    .eq('id', usuarioId)
    .maybeSingle()
  if (error) throw error
  return data?.contar_bano ?? false
}

export async function guardarContarBano(usuarioId: string, activo: boolean): Promise<void> {
  // upsert y no update: un update sobre un perfil inexistente no falla, afecta
  // cero filas en silencio. El interruptor se vería encendido y volvería solo a
  // apagarse al recargar, sin ningún error que lo explique.
  const { error } = await supabase
    .from('profiles')
    .upsert({ id: usuarioId, contar_bano: activo }, { onConflict: 'id' })
  if (error) throw error
}
