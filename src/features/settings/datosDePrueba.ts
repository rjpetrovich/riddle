import { supabase } from '../../lib/supabaseClient'
import { claveDiaLocal } from '../../lib/dateUtils'
import { ensureAlimentos, normalizarIngredientes } from '../meals/mealsApi'
import { PLAN_COMIDAS, PLAN_DIAS, fechaDelPlan } from './planDePrueba'

/**
 * Marca que llevan todas las filas de ejemplo.
 *
 * Es lo que permite borrarlas después sin tocar nada real: el borrado filtra
 * por esta marca en las notas, nunca por fecha. Si se filtrara por rango de
 * fechas, borraría también las comidas de verdad de esos días.
 */
export const MARCA_PRUEBA = '[prueba]'

const NOTA_COMIDA = `${MARCA_PRUEBA} comida de ejemplo`
const NOTA_SENSACION = `${MARCA_PRUEBA} sensación de ejemplo`

/** Cuántas comidas de ejemplo hay cargadas ahora mismo. */
export async function contarDatosDePrueba(usuarioId: string): Promise<number> {
  const { count, error } = await supabase
    .from('comidas')
    .select('id', { count: 'exact', head: true })
    .eq('usuario_id', usuarioId)
    .like('notas', `${MARCA_PRUEBA}%`)
  if (error) throw error
  return count ?? 0
}

export async function sembrarDatosDePrueba(usuarioId: string): Promise<number> {
  const hoy = new Date()

  // 1. Catálogo de ingredientes. Se reutiliza el mismo camino que una comida
  //    normal, así los de ejemplo no se duplican con los que ya existan
  //    escritos distinto ("Café" / "café").
  const nombres = [...new Set(PLAN_COMIDAS.flatMap((p) => p.ingredientes))]
  const limpios = normalizarIngredientes(nombres)
  const ids = await ensureAlimentos(usuarioId, nombres)
  const idPorNombre = new Map(limpios.map((n, i) => [n.toLowerCase(), ids[i]]))

  // 2. Comidas. Los ids se generan acá para poder armar las relaciones y las
  //    sensaciones sin ir y volver al servidor por cada fila.
  const comidas = PLAN_COMIDAS.map((p) => ({
    plan: p,
    id: crypto.randomUUID(),
    fecha: fechaDelPlan(hoy, p.diasAtras, p.hora),
  }))

  const { error: errComidas } = await supabase.from('comidas').insert(
    comidas.map(({ id, plan, fecha }) => ({
      id,
      usuario_id: usuarioId,
      fecha_hora: fecha.toISOString(),
      tipo_comida: plan.tipo,
      nombre: plan.nombre,
      notas: NOTA_COMIDA,
    })),
  )
  if (errComidas) throw errComidas

  // 3. Ingredientes de cada comida.
  const relaciones = comidas.flatMap(({ id, plan }) =>
    plan.ingredientes
      .map((n) => idPorNombre.get(n.toLowerCase()))
      .filter((alimentoId): alimentoId is string => !!alimentoId)
      .map((alimento_id) => ({ comida_id: id, alimento_id })),
  )
  const { error: errRel } = await supabase.from('comida_alimentos').insert(relaciones)
  if (errRel) throw errRel

  // 4. Sensaciones, una hora y media después de cada comida.
  const conSensacion = comidas.filter((c) => c.plan.valoracion)
  const sensaciones = conSensacion.map(({ id, plan, fecha }) => ({
    id: crypto.randomUUID(),
    usuario_id: usuarioId,
    comida_id: id,
    fecha_hora: new Date(fecha.getTime() + 90 * 60_000).toISOString(),
    valoracion: plan.valoracion,
    intensidad: plan.intensidad ?? null,
    notas: NOTA_SENSACION,
    sintomas: plan.sintomas ?? [],
  }))
  const { error: errSens } = await supabase
    .from('sensaciones')
    .insert(sensaciones.map(({ sintomas: _s, ...fila }) => fila))
  if (errSens) throw errSens

  // 5. Síntomas: se enlazan por nombre contra el catálogo del usuario, que
  //    puede haber editado. Los que no encuentre, simplemente no se enlazan.
  const { data: catalogo } = await supabase
    .from('sintomas_catalogo')
    .select('id, nombre')
    .eq('usuario_id', usuarioId)
  const idPorSintoma = new Map((catalogo ?? []).map((s) => [s.nombre.toLowerCase(), s.id]))
  const enlaces = sensaciones.flatMap((s) =>
    s.sintomas
      .map((n) => idPorSintoma.get(n.toLowerCase()))
      .filter((sintomaId): sintomaId is string => !!sintomaId)
      .map((sintoma_id) => ({ sensacion_id: s.id, sintoma_id })),
  )
  if (enlaces.length > 0) {
    const { error: errSint } = await supabase.from('sensacion_sintomas').insert(enlaces)
    if (errSint) throw errSint
  }

  // 6. Vasos de agua y observaciones, solo en los días que estén vacíos: si ya
  //    veníais registrando algo real en esta quincena, no se pisa.
  const fechasPlan = PLAN_DIAS.map((d) => claveDiaLocal(fechaDelPlan(hoy, d.diasAtras, '12:00')))
  const { data: yaExisten } = await supabase
    .from('contadores_dia')
    .select('fecha')
    .eq('usuario_id', usuarioId)
    .in('fecha', fechasPlan)
  const ocupadas = new Set((yaExisten ?? []).map((f) => f.fecha))

  const contadores = PLAN_DIAS.map((d, i) => ({
    usuario_id: usuarioId,
    fecha: fechasPlan[i],
    vasos_agua: d.vasos,
    idas_bano: 0,
    observaciones: `${MARCA_PRUEBA} ${d.observacion}`,
  })).filter((c) => !ocupadas.has(c.fecha))

  if (contadores.length > 0) {
    const { error: errCont } = await supabase.from('contadores_dia').insert(contadores)
    if (errCont) throw errCont
  }

  return comidas.length
}

export async function borrarDatosDePrueba(usuarioId: string): Promise<void> {
  // Las sensaciones van primero: su comida_id es "on delete set null", así que
  // borrar la comida no se las lleva y quedarían sueltas en el historial.
  const { error: errSens } = await supabase
    .from('sensaciones')
    .delete()
    .eq('usuario_id', usuarioId)
    .like('notas', `${MARCA_PRUEBA}%`)
  if (errSens) throw errSens

  // comida_alimentos sí cae por cascada con la comida.
  const { error: errComidas } = await supabase
    .from('comidas')
    .delete()
    .eq('usuario_id', usuarioId)
    .like('notas', `${MARCA_PRUEBA}%`)
  if (errComidas) throw errComidas

  const { error: errCont } = await supabase
    .from('contadores_dia')
    .delete()
    .eq('usuario_id', usuarioId)
    .like('observaciones', `${MARCA_PRUEBA}%`)
  if (errCont) throw errCont

  await borrarIngredientesHuerfanos(usuarioId)
}

/**
 * Ingredientes que ya no están en ninguna comida.
 *
 * Sin esto, "Salsa de tomate" y compañía quedarían para siempre en la pestaña
 * Ingredientes con cero registros. Se calcula por referencias reales y no por
 * nombre, así no se lleva puesto un ingrediente que también uses de verdad.
 */
async function borrarIngredientesHuerfanos(usuarioId: string): Promise<void> {
  const { data: catalogo, error: errCat } = await supabase
    .from('alimentos_catalogo')
    .select('id')
    .eq('usuario_id', usuarioId)
  if (errCat) throw errCat
  if (!catalogo?.length) return

  const { data: usados, error: errUsados } = await supabase
    .from('comida_alimentos')
    .select('alimento_id')
    .in(
      'alimento_id',
      catalogo.map((a) => a.id),
    )
  if (errUsados) throw errUsados

  const enUso = new Set((usados ?? []).map((u) => u.alimento_id))
  const huerfanos = catalogo.map((a) => a.id).filter((id) => !enUso.has(id))
  if (huerfanos.length === 0) return

  const { error } = await supabase.from('alimentos_catalogo').delete().in('id', huerfanos)
  if (error) throw error
}
