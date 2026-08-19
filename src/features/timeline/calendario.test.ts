import { describe, expect, it } from 'vitest'
import { construirGrillaMes, mismoDia, rangoDelMes, resumirPorDia } from './calendario'
import { claveDiaLocal } from '../../lib/dateUtils'

// Fechas construidas en hora local a propósito: el calendario agrupa por día
// local, así que usar cadenas UTC en los tests probaría otra cosa.
const local = (a: number, m: number, d: number, h = 12) => new Date(a, m - 1, d, h).toISOString()

describe('construirGrillaMes', () => {
  it('arranca en lunes', () => {
    const dias = construirGrillaMes(new Date(2026, 7, 1)) // agosto 2026
    expect(dias[0].getDay()).toBe(1)
  })

  it('devuelve semanas completas', () => {
    for (const mes of [0, 1, 4, 7, 11]) {
      const dias = construirGrillaMes(new Date(2026, mes, 1))
      expect(dias.length % 7).toBe(0)
    }
  })

  it('incluye todos los días del mes', () => {
    const dias = construirGrillaMes(new Date(2026, 7, 1))
    const delMes = dias.filter((d) => d.getMonth() === 7)
    expect(delMes).toHaveLength(31)
  })

  it('cubre febrero de un año bisiesto', () => {
    const dias = construirGrillaMes(new Date(2028, 1, 1))
    expect(dias.filter((d) => d.getMonth() === 1)).toHaveLength(29)
  })

  it('no deja una fila entera fuera del mes', () => {
    for (const mes of [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]) {
      const dias = construirGrillaMes(new Date(2026, mes, 1))
      const ultimaSemana = dias.slice(-7)
      expect(ultimaSemana.some((d) => d.getMonth() === mes)).toBe(true)
    }
  })

  it('cubre un mes de 31 días que empieza domingo, el peor caso', () => {
    // marzo 2026 empieza domingo
    const dias = construirGrillaMes(new Date(2026, 2, 1))
    expect(dias.filter((d) => d.getMonth() === 2)).toHaveLength(31)
    expect(dias.length % 7).toBe(0)
  })
})

describe('resumirPorDia', () => {
  it('cuenta las comidas de cada día', () => {
    const r = resumirPorDia(
      [{ fechaHora: local(2026, 8, 19) }, { fechaHora: local(2026, 8, 19, 20) }, { fechaHora: local(2026, 8, 20) }],
      [],
    )
    expect(r.get('2026-08-19')!.comidas).toBe(2)
    expect(r.get('2026-08-20')!.comidas).toBe(1)
  })

  it('se queda con la peor valoración del día', () => {
    const r = resumirPorDia(
      [],
      [
        { fechaHora: local(2026, 8, 19, 9), valoracion: 'bien' },
        { fechaHora: local(2026, 8, 19, 15), valoracion: 'mal' },
        { fechaHora: local(2026, 8, 19, 21), valoracion: 'bien' },
      ],
    )
    expect(r.get('2026-08-19')!.valoracion).toBe('mal')
  })

  it('prefiere neutro sobre bien', () => {
    const r = resumirPorDia(
      [],
      [
        { fechaHora: local(2026, 8, 19, 9), valoracion: 'bien' },
        { fechaHora: local(2026, 8, 19, 15), valoracion: 'neutro' },
      ],
    )
    expect(r.get('2026-08-19')!.valoracion).toBe('neutro')
  })

  it('deja la valoración en null si el día solo tiene comidas', () => {
    const r = resumirPorDia([{ fechaHora: local(2026, 8, 19) }], [])
    expect(r.get('2026-08-19')).toEqual({ comidas: 1, valoracion: null })
  })

  it('registra un día que tiene sensación pero ninguna comida', () => {
    const r = resumirPorDia([], [{ fechaHora: local(2026, 8, 19), valoracion: 'bien' }])
    expect(r.get('2026-08-19')).toEqual({ comidas: 0, valoracion: 'bien' })
  })

  it('asigna una cena tardía al día local, no al siguiente en UTC', () => {
    // Con toISOString() una cena de las 23:00 en zonas al oeste de Greenwich
    // caería en el día siguiente y aparecería en la casilla equivocada.
    const cena = local(2026, 8, 19, 23)
    const r = resumirPorDia([{ fechaHora: cena }], [])
    expect(r.has('2026-08-19')).toBe(true)
    expect(r.get('2026-08-19')!.comidas).toBe(1)
  })

  it('no inventa días vacíos', () => {
    expect(resumirPorDia([], []).size).toBe(0)
  })
})

describe('mismoDia', () => {
  it('compara por día local ignorando la hora', () => {
    expect(mismoDia(new Date(2026, 7, 19, 1), new Date(2026, 7, 19, 23))).toBe(true)
    expect(mismoDia(new Date(2026, 7, 19), new Date(2026, 7, 20))).toBe(false)
  })
})

describe('rangoDelMes', () => {
  it('abarca desde el primer día de la grilla hasta el último', () => {
    const mes = new Date(2026, 7, 15)
    const { desde, hasta } = rangoDelMes(mes)
    const dias = construirGrillaMes(mes)
    expect(claveDiaLocal(new Date(desde))).toBe(claveDiaLocal(dias[0]))
    expect(claveDiaLocal(new Date(hasta))).toBe(claveDiaLocal(dias[dias.length - 1]))
    expect(new Date(desde).getTime()).toBeLessThan(new Date(hasta).getTime())
  })
})
