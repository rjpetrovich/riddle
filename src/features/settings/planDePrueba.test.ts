import { describe, expect, it } from 'vitest'
import { PLAN_COMIDAS, PLAN_DIAS, fechaDelPlan } from './planDePrueba'
import {
  calcularStatsPorAlimento,
  detectarParesInseparables,
  faltanParaConcluir,
  type ComidaCruda,
  type SensacionCruda,
} from '../stats/patternDetection'

// Se corre el algoritmo de verdad sobre el plan: si cambian los umbrales o el
// plan, este test avisa en vez de dejar unos datos de ejemplo que ya no
// demuestran nada. Los ids son los nombres, que acá alcanzan.
function datosCrudos() {
  const hoy = new Date()
  const comidas: ComidaCruda[] = PLAN_COMIDAS.map((p, i) => ({
    id: `c${i}`,
    fechaHora: fechaDelPlan(hoy, p.diasAtras, p.hora).toISOString(),
    nombre: p.nombre,
    alimentoIds: p.ingredientes,
  }))
  const sensaciones: SensacionCruda[] = PLAN_COMIDAS.flatMap((p, i) =>
    p.valoracion ? [{ comidaId: `c${i}`, valoracion: p.valoracion }] : [],
  )
  return { comidas, sensaciones }
}

function stats() {
  const { comidas, sensaciones } = datosCrudos()
  return new Map(calcularStatsPorAlimento(comidas, sensaciones).map((s) => [s.alimentoId, s]))
}

describe('plan de datos de prueba', () => {
  it('cubre dos semanas completas', () => {
    const dias = new Set(PLAN_COMIDAS.map((p) => p.diasAtras))
    expect(dias.size).toBe(14)
    expect(Math.max(...dias)).toBe(13)
    expect(PLAN_DIAS).toHaveLength(14)
  })

  it('marca como sospechosos justo a los ingredientes pensados para eso', () => {
    const sospechosos = [...stats().values()]
      .filter((s) => s.sospechoso)
      .map((s) => s.alimentoId)
      .sort()
    expect(sospechosos).toEqual(['Fideos', 'Leche', 'Queso', 'Salsa de tomate'])
  })

  it('deja limpio al café, que acompaña a la leche pero también aparece solo', () => {
    const cafe = stats().get('Café')!
    expect(cafe.sospechoso).toBe(false)
    expect(cafe.conSensacion).toBeGreaterThanOrEqual(8)
    // El caso interesante: comparte muchas comidas con el sospechoso.
    expect(cafe.mal).toBeGreaterThan(0)
  })

  it('marca como seguros a los que siempre cayeron bien', () => {
    const seguros = [...stats().values()]
      .filter((s) => s.seguro)
      .map((s) => s.alimentoId)
      .sort()
    expect(seguros).toEqual(['Arroz', 'Huevo', 'Lechuga', 'Pollo'])
  })

  it('deja un único par inseparable, para que se vea esa tarjeta', () => {
    const { comidas, sensaciones } = datosCrudos()
    const pares = detectarParesInseparables(comidas, sensaciones)
    expect(pares).toHaveLength(1)
    expect([pares[0].alimentoA, pares[0].alimentoB].sort()).toEqual(['Fideos', 'Salsa de tomate'])
    expect(pares[0].vecesJuntos).toBe(4)
  })

  it('deja ingredientes a un registro de concluir, que es el motor del progreso', () => {
    const aUno = [...stats().values()]
      .filter((s) => faltanParaConcluir(s) === 1)
      .map((s) => s.alimentoId)
      .sort()
    expect(aUno).toEqual(['Banana', 'Palta'])
  })

  it('deja comidas sin sensación, para ver los pendientes y la barra del día', () => {
    const sinSensacion = PLAN_COMIDAS.filter((p) => p.valoracion === null)
    expect(sinSensacion.length).toBeGreaterThanOrEqual(2)
    expect(sinSensacion.some((p) => p.diasAtras === 0)).toBe(true)
  })

  it('reparte las comidas en horarios y tipos variados', () => {
    expect(new Set(PLAN_COMIDAS.map((p) => p.tipo)).size).toBeGreaterThanOrEqual(4)
    for (const p of PLAN_COMIDAS) expect(p.hora).toMatch(/^\d{2}:\d{2}$/)
  })
})

describe('fechaDelPlan', () => {
  it('ubica la comida en el día y la hora local pedidos', () => {
    const hoy = new Date(2026, 7, 19, 17, 42)
    const d = fechaDelPlan(hoy, 13, '08:30')
    expect(d.getDate()).toBe(6)
    expect(d.getMonth()).toBe(7)
    expect(d.getHours()).toBe(8)
    expect(d.getMinutes()).toBe(30)
  })
})
