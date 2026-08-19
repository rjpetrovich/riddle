import { describe, expect, it } from 'vitest'
import {
  calcularStatsPorAlimento,
  ocurrenciasDeAlimento,
  peorValoracionPorComida,
  type ComidaCruda,
  type SensacionCruda,
} from './patternDetection'

function comida(id: string, alimentoIds: string[], diasAtras = 0): ComidaCruda {
  const d = new Date('2026-08-19T12:00:00Z')
  d.setDate(d.getDate() - diasAtras)
  return { id, fechaHora: d.toISOString(), nombre: `Comida ${id}`, alimentoIds }
}

const sens = (comidaId: string, valoracion: SensacionCruda['valoracion']): SensacionCruda => ({
  comidaId,
  valoracion,
})

describe('peorValoracionPorComida', () => {
  it('se queda con la peor cuando una comida tiene varias sensaciones', () => {
    const r = peorValoracionPorComida([sens('c1', 'bien'), sens('c1', 'mal'), sens('c1', 'neutro')])
    expect(r.get('c1')).toBe('mal')
  })

  it('no deja que una sensación posterior mejor tape una mala', () => {
    const r = peorValoracionPorComida([sens('c1', 'mal'), sens('c1', 'bien')])
    expect(r.get('c1')).toBe('mal')
  })

  it('prefiere neutro sobre bien', () => {
    const r = peorValoracionPorComida([sens('c1', 'bien'), sens('c1', 'neutro')])
    expect(r.get('c1')).toBe('neutro')
  })
})

describe('calcularStatsPorAlimento', () => {
  it('cuenta las veces comido aunque no haya sensación registrada', () => {
    const comidas = [comida('c1', ['a']), comida('c2', ['a'])]
    const [a] = calcularStatsPorAlimento(comidas, [sens('c1', 'bien')])
    expect(a.vecesComido).toBe(2)
    // El porcentaje sale solo de las que tienen sensación: si contara las dos,
    // una comida sin registrar diluiría la señal como si hubiera caído bien.
    expect(a.conSensacion).toBe(1)
    expect(a.pctBien).toBe(1)
  })

  it('marca sospechoso con 3 registros y más del 60% mal', () => {
    const comidas = [comida('c1', ['a']), comida('c2', ['a']), comida('c3', ['a'])]
    const stats = calcularStatsPorAlimento(comidas, [
      sens('c1', 'mal'),
      sens('c2', 'mal'),
      sens('c3', 'bien'),
    ])
    expect(stats[0].pctMal).toBeCloseTo(2 / 3)
    expect(stats[0].sospechoso).toBe(true)
  })

  it('no marca sospechoso con menos de 3 registros, por más que todo sea mal', () => {
    const comidas = [comida('c1', ['a']), comida('c2', ['a'])]
    const stats = calcularStatsPorAlimento(comidas, [sens('c1', 'mal'), sens('c2', 'mal')])
    expect(stats[0].pctMal).toBe(1)
    expect(stats[0].sospechoso).toBe(false)
  })

  it('no marca sospechoso justo en el 60%: el umbral es estrictamente mayor', () => {
    // 3 de 5 = 60% exacto
    const comidas = ['c1', 'c2', 'c3', 'c4', 'c5'].map((id) => comida(id, ['a']))
    const stats = calcularStatsPorAlimento(comidas, [
      sens('c1', 'mal'),
      sens('c2', 'mal'),
      sens('c3', 'mal'),
      sens('c4', 'bien'),
      sens('c5', 'bien'),
    ])
    expect(stats[0].pctMal).toBeCloseTo(0.6)
    expect(stats[0].sospechoso).toBe(false)
  })

  it('marca seguro solo si nunca hubo neutro ni mal', () => {
    const comidas = ['c1', 'c2', 'c3'].map((id) => comida(id, ['a']))
    const todoBien = calcularStatsPorAlimento(comidas, [
      sens('c1', 'bien'),
      sens('c2', 'bien'),
      sens('c3', 'bien'),
    ])
    expect(todoBien[0].seguro).toBe(true)

    const conUnNeutro = calcularStatsPorAlimento(comidas, [
      sens('c1', 'bien'),
      sens('c2', 'bien'),
      sens('c3', 'neutro'),
    ])
    expect(conUnNeutro[0].seguro).toBe(false)
  })

  it('atribuye la valoración a todos los ingredientes de la comida', () => {
    const comidas = [comida('c1', ['a', 'b'])]
    const stats = calcularStatsPorAlimento(comidas, [sens('c1', 'mal')])
    expect(stats).toHaveLength(2)
    expect(stats.every((s) => s.mal === 1)).toBe(true)
  })

  it('deja en cero los porcentajes de un ingrediente sin ninguna sensación', () => {
    const stats = calcularStatsPorAlimento([comida('c1', ['a'])], [])
    expect(stats[0].conSensacion).toBe(0)
    expect(stats[0].pctBien).toBe(0)
    expect(stats[0].pctMal).toBe(0)
    expect(stats[0].sospechoso).toBe(false)
    expect(stats[0].seguro).toBe(false)
  })

  it('ignora sensaciones de comidas que no están en el período', () => {
    // Al filtrar por rango, las sensaciones llegan sin recortar: las que
    // apuntan a comidas de fuera del período no deben sumar.
    const stats = calcularStatsPorAlimento(
      [comida('c1', ['a'])],
      [sens('c1', 'mal'), sens('c-fuera-de-rango', 'bien')],
    )
    expect(stats[0].conSensacion).toBe(1)
    expect(stats[0].mal).toBe(1)
  })

  it('ordena por veces comido, de mayor a menor', () => {
    const comidas = [comida('c1', ['a', 'b']), comida('c2', ['b']), comida('c3', ['b'])]
    const stats = calcularStatsPorAlimento(comidas, [])
    expect(stats.map((s) => s.alimentoId)).toEqual(['b', 'a'])
  })
})

describe('ocurrenciasDeAlimento', () => {
  it('devuelve solo las comidas que contienen el ingrediente, de la más nueva a la más vieja', () => {
    const comidas = [comida('c1', ['a'], 2), comida('c2', ['b'], 1), comida('c3', ['a'], 0)]
    const oc = ocurrenciasDeAlimento('a', comidas, [sens('c3', 'mal')])
    expect(oc.map((o) => o.comidaId)).toEqual(['c3', 'c1'])
    expect(oc[0].valoracion).toBe('mal')
    expect(oc[1].valoracion).toBeNull()
  })
})
