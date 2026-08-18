import { supabase } from '../../lib/supabaseClient'
import type { Comida, TipoComida } from '../../types/domain'

export interface ComidaInput {
  fechaHora: string
  tipoComida: TipoComida
  nombre: string
  notas: string
  ingredientes: string[]
  foto?: File | null
}

async function ensureAlimentos(usuarioId: string, nombres: string[]) {
  const limpios = [...new Set(nombres.map((n) => n.trim()).filter(Boolean))]
  if (limpios.length === 0) return []

  const { data: existentes, error: errBusqueda } = await supabase
    .from('alimentos_catalogo')
    .select('id, nombre')
    .eq('usuario_id', usuarioId)
    .in('nombre', limpios)
  if (errBusqueda) throw errBusqueda

  const existentesPorNombre = new Map(existentes?.map((a) => [a.nombre.toLowerCase(), a.id]))
  const faltantes = limpios.filter((n) => !existentesPorNombre.has(n.toLowerCase()))

  if (faltantes.length > 0) {
    const { data: creados, error: errInsert } = await supabase
      .from('alimentos_catalogo')
      .insert(faltantes.map((nombre) => ({ usuario_id: usuarioId, nombre })))
      .select('id, nombre')
    if (errInsert) throw errInsert
    creados?.forEach((a) => existentesPorNombre.set(a.nombre.toLowerCase(), a.id))
  }

  return limpios.map((n) => existentesPorNombre.get(n.toLowerCase())!).filter(Boolean)
}

export async function subirFotoComida(usuarioId: string, comidaId: string, file: File) {
  const ext = file.name.split('.').pop() ?? 'jpg'
  const path = `${usuarioId}/${comidaId}/${Date.now()}.${ext}`
  const { error } = await supabase.storage.from('comida-fotos').upload(path, file, {
    cacheControl: '3600',
    upsert: true,
  })
  if (error) throw error
  const { data } = supabase.storage.from('comida-fotos').getPublicUrl(path)
  return data.publicUrl
}

export async function crearComida(usuarioId: string, input: ComidaInput): Promise<Comida> {
  const { data: comida, error: errComida } = await supabase
    .from('comidas')
    .insert({
      usuario_id: usuarioId,
      fecha_hora: input.fechaHora,
      tipo_comida: input.tipoComida,
      nombre: input.nombre,
      notas: input.notas || null,
    })
    .select()
    .single()
  if (errComida) throw errComida

  let fotoUrl: string | null = null
  if (input.foto) {
    fotoUrl = await subirFotoComida(usuarioId, comida.id, input.foto)
    await supabase.from('comidas').update({ foto_url: fotoUrl }).eq('id', comida.id)
  }

  const alimentoIds = await ensureAlimentos(usuarioId, input.ingredientes)
  if (alimentoIds.length > 0) {
    const { error: errRel } = await supabase
      .from('comida_alimentos')
      .insert(alimentoIds.map((alimento_id) => ({ comida_id: comida.id, alimento_id })))
    if (errRel) throw errRel
  }

  return mapComida({ ...comida, foto_url: fotoUrl }, input.ingredientes)
}

export async function actualizarComida(
  comidaId: string,
  usuarioId: string,
  input: Omit<ComidaInput, 'foto'>,
) {
  const { error } = await supabase
    .from('comidas')
    .update({
      fecha_hora: input.fechaHora,
      tipo_comida: input.tipoComida,
      nombre: input.nombre,
      notas: input.notas || null,
    })
    .eq('id', comidaId)
  if (error) throw error

  await supabase.from('comida_alimentos').delete().eq('comida_id', comidaId)
  const alimentoIds = await ensureAlimentos(usuarioId, input.ingredientes)
  if (alimentoIds.length > 0) {
    await supabase
      .from('comida_alimentos')
      .insert(alimentoIds.map((alimento_id) => ({ comida_id: comidaId, alimento_id })))
  }
}

export async function eliminarComida(comidaId: string) {
  const { error } = await supabase.from('comidas').delete().eq('id', comidaId)
  if (error) throw error
}

export async function fetchComidasRango(
  usuarioId: string,
  desdeISO: string,
  hastaISO: string,
): Promise<Comida[]> {
  const { data, error } = await supabase
    .from('comidas')
    .select('*, comida_alimentos(alimento_id, alimentos_catalogo(id, nombre))')
    .eq('usuario_id', usuarioId)
    .gte('fecha_hora', desdeISO)
    .lte('fecha_hora', hastaISO)
    .order('fecha_hora', { ascending: false })
  if (error) throw error

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (data ?? []).map((c: any) =>
    mapComida(
      c,
      (c.comida_alimentos ?? []).map((ca: any) => ca.alimentos_catalogo?.nombre).filter(Boolean),
      (c.comida_alimentos ?? []).map((ca: any) => ({
        id: ca.alimento_id,
        nombre: ca.alimentos_catalogo?.nombre ?? '',
      })),
    ),
  )
}

export async function fetchComidaPorId(comidaId: string): Promise<Comida> {
  const { data, error } = await supabase
    .from('comidas')
    .select('*, comida_alimentos(alimento_id, alimentos_catalogo(id, nombre))')
    .eq('id', comidaId)
    .single()
  if (error) throw error
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const d = data as any
  return mapComida(
    d,
    [],
    (d.comida_alimentos ?? []).map((ca: any) => ({
      id: ca.alimento_id,
      nombre: ca.alimentos_catalogo?.nombre ?? '',
    })),
  )
}

export async function fetchAlimentosCatalogo(usuarioId: string, search = '') {
  let query = supabase
    .from('alimentos_catalogo')
    .select('id, nombre')
    .eq('usuario_id', usuarioId)
    .order('nombre')
    .limit(20)
  if (search.trim()) {
    query = query.ilike('nombre', `%${search.trim()}%`)
  }
  const { data, error } = await query
  if (error) throw error
  return data ?? []
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapComida(row: any, ingredientesNombres: string[], alimentos?: { id: string; nombre: string }[]): Comida {
  return {
    id: row.id,
    fechaHora: row.fecha_hora,
    tipoComida: row.tipo_comida,
    nombre: row.nombre,
    fotoUrl: row.foto_url,
    notas: row.notas,
    alimentos: alimentos ?? ingredientesNombres.map((nombre, i) => ({ id: String(i), nombre })),
  }
}
