import type { Valoracion } from '../../types/domain'

export interface ComidaCruda {
  id: string
  fechaHora: string
  nombre: string
  alimentoIds: string[]
}

export interface SensacionCruda {
  comidaId: string
  valoracion: Valoracion
}

export interface AlimentoStats {
  alimentoId: string
  nombre: string
  vecesComido: number
  conSensacion: number
  bien: number
  neutro: number
  mal: number
  pctBien: number
  pctMal: number
  sospechoso: boolean
  seguro: boolean
}

export interface OcurrenciaAlimento {
  comidaId: string
  fechaHora: string
  nombreComida: string
  otrosIngredientes: string[]
  valoracion: Valoracion | null
}

const PRIORIDAD: Record<Valoracion, number> = { mal: 2, neutro: 1, bien: 0 }
const UMBRAL_MIN_REGISTROS = 3
const UMBRAL_PCT_SOSPECHOSO = 0.6

// Si una comida tiene varias sensaciones asociadas, nos quedamos con la peor
// reportada (mal > neutro > bien) para no diluir una mala señal.
export function peorValoracionPorComida(sensaciones: SensacionCruda[]): Map<string, Valoracion> {
  const resultado = new Map<string, Valoracion>()
  for (const s of sensaciones) {
    const actual = resultado.get(s.comidaId)
    if (!actual || PRIORIDAD[s.valoracion] > PRIORIDAD[actual]) {
      resultado.set(s.comidaId, s.valoracion)
    }
  }
  return resultado
}

export function calcularStatsPorAlimento(
  comidas: ComidaCruda[],
  sensaciones: SensacionCruda[],
): AlimentoStats[] {
  const valoracionPorComida = peorValoracionPorComida(sensaciones)
  const porAlimento = new Map<string, { nombre: string; comidas: ComidaCruda[] }>()

  for (const comida of comidas) {
    for (const alimentoId of comida.alimentoIds) {
      if (!porAlimento.has(alimentoId)) porAlimento.set(alimentoId, { nombre: '', comidas: [] })
      porAlimento.get(alimentoId)!.comidas.push(comida)
    }
  }

  const stats: AlimentoStats[] = []
  for (const [alimentoId, { comidas: comidasDelAlimento }] of porAlimento) {
    let bien = 0
    let neutro = 0
    let mal = 0
    for (const c of comidasDelAlimento) {
      const v = valoracionPorComida.get(c.id)
      if (v === 'bien') bien++
      else if (v === 'neutro') neutro++
      else if (v === 'mal') mal++
    }
    const conSensacion = bien + neutro + mal
    const pctBien = conSensacion > 0 ? bien / conSensacion : 0
    const pctMal = conSensacion > 0 ? mal / conSensacion : 0

    stats.push({
      alimentoId,
      nombre: '',
      vecesComido: comidasDelAlimento.length,
      conSensacion,
      bien,
      neutro,
      mal,
      pctBien,
      pctMal,
      sospechoso: conSensacion >= UMBRAL_MIN_REGISTROS && pctMal > UMBRAL_PCT_SOSPECHOSO,
      seguro: conSensacion >= UMBRAL_MIN_REGISTROS && mal === 0 && neutro === 0,
    })
  }

  return stats.sort((a, b) => b.vecesComido - a.vecesComido)
}

export function ocurrenciasDeAlimento(
  alimentoId: string,
  comidas: ComidaCruda[],
  sensaciones: SensacionCruda[],
): OcurrenciaAlimento[] {
  const valoracionPorComida = peorValoracionPorComida(sensaciones)
  return comidas
    .filter((c) => c.alimentoIds.includes(alimentoId))
    .map((c) => ({
      comidaId: c.id,
      fechaHora: c.fechaHora,
      nombreComida: c.nombre,
      otrosIngredientes: [],
      valoracion: valoracionPorComida.get(c.id) ?? null,
    }))
    .sort((a, b) => (a.fechaHora < b.fechaHora ? 1 : -1))
}
