import { supabase } from '../../lib/supabaseClient'
import type { Sensacion, Sintoma, TipoSintoma, Valoracion } from '../../types/domain'

export interface SensacionInput {
  fechaHora: string
  comidaId: string | null
  valoracion: Valoracion
  intensidad: number | null
  notas: string
  sintomaIds: string[]
}

export async function fetchSintomas(usuarioId: string): Promise<Sintoma[]> {
  const { data, error } = await supabase
    .from('sintomas_catalogo')
    .select('*')
    .eq('usuario_id', usuarioId)
    .order('orden')
  if (error) throw error
  return (data ?? []).map((s) => ({
    id: s.id,
    nombre: s.nombre,
    tipo: s.tipo,
    activo: s.activo,
    orden: s.orden,
  }))
}

export async function crearSintoma(usuarioId: string, nombre: string, tipo: TipoSintoma) {
  const { data, error } = await supabase
    .from('sintomas_catalogo')
    .insert({ usuario_id: usuarioId, nombre, tipo })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function actualizarSintoma(
  id: string,
  updates: { nombre?: string; activo?: boolean; orden?: number },
) {
  const { error } = await supabase.from('sintomas_catalogo').update(updates).eq('id', id)
  if (error) throw error
}

export async function eliminarSintoma(id: string) {
  const { error } = await supabase.from('sintomas_catalogo').delete().eq('id', id)
  if (error) throw error
}

export async function crearSensacion(usuarioId: string, input: SensacionInput) {
  const { data: sensacion, error } = await supabase
    .from('sensaciones')
    .insert({
      usuario_id: usuarioId,
      comida_id: input.comidaId,
      fecha_hora: input.fechaHora,
      valoracion: input.valoracion,
      intensidad: input.intensidad,
      notas: input.notas || null,
    })
    .select()
    .single()
  if (error) throw error

  if (input.sintomaIds.length > 0) {
    const { error: errRel } = await supabase
      .from('sensacion_sintomas')
      .insert(input.sintomaIds.map((sintoma_id) => ({ sensacion_id: sensacion.id, sintoma_id })))
    if (errRel) throw errRel
  }

  return sensacion
}

export async function fetchSensacionPorId(id: string): Promise<Sensacion> {
  const { data, error } = await supabase
    .from('sensaciones')
    .select('*, sensacion_sintomas(sintoma_id)')
    .eq('id', id)
    .single()
  if (error) throw error
  return {
    id: data.id,
    comidaId: data.comida_id,
    fechaHora: data.fecha_hora,
    valoracion: data.valoracion,
    intensidad: data.intensidad,
    notas: data.notas,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    sintomaIds: ((data as any).sensacion_sintomas ?? []).map((r: any) => r.sintoma_id),
  }
}

export async function actualizarSensacion(id: string, input: SensacionInput) {
  const { error } = await supabase
    .from('sensaciones')
    .update({
      comida_id: input.comidaId,
      fecha_hora: input.fechaHora,
      valoracion: input.valoracion,
      intensidad: input.intensidad,
      notas: input.notas || null,
    })
    .eq('id', id)
  if (error) throw error

  await supabase.from('sensacion_sintomas').delete().eq('sensacion_id', id)
  if (input.sintomaIds.length > 0) {
    await supabase
      .from('sensacion_sintomas')
      .insert(input.sintomaIds.map((sintoma_id) => ({ sensacion_id: id, sintoma_id })))
  }
}

export async function eliminarSensacion(id: string) {
  const { error } = await supabase.from('sensaciones').delete().eq('id', id)
  if (error) throw error
}

export async function fetchSensacionesRango(
  usuarioId: string,
  desdeISO: string,
  hastaISO: string,
): Promise<Sensacion[]> {
  const { data, error } = await supabase
    .from('sensaciones')
    .select('*, sensacion_sintomas(sintoma_id)')
    .eq('usuario_id', usuarioId)
    .gte('fecha_hora', desdeISO)
    .lte('fecha_hora', hastaISO)
    .order('fecha_hora', { ascending: false })
  if (error) throw error

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (data ?? []).map((s: any) => ({
    id: s.id,
    comidaId: s.comida_id,
    fechaHora: s.fecha_hora,
    valoracion: s.valoracion,
    intensidad: s.intensidad,
    notas: s.notas,
    sintomaIds: (s.sensacion_sintomas ?? []).map((r: any) => r.sintoma_id),
  }))
}

export async function fetchComidasRecientes(usuarioId: string, horas = 8) {
  const desde = new Date(Date.now() - horas * 60 * 60 * 1000).toISOString()
  const { data, error } = await supabase
    .from('comidas')
    .select('id, nombre, fecha_hora')
    .eq('usuario_id', usuarioId)
    .gte('fecha_hora', desde)
    .order('fecha_hora', { ascending: false })
  if (error) throw error
  return data ?? []
}
