import { describe, expect, it } from 'vitest'
import { claveDiaLocal, diaDesdeClave, inputValueParaDia, nowLocalInputValue } from './dateUtils'

describe('diaDesdeClave', () => {
  it('devuelve el día que dice la clave, en hora local', () => {
    const d = diaDesdeClave('2025-08-15')!
    expect(d.getFullYear()).toBe(2025)
    expect(d.getMonth()).toBe(7)
    expect(d.getDate()).toBe(15)
  })

  it('va y vuelve con claveDiaLocal sin correrse de día', () => {
    for (const clave of ['2025-01-01', '2025-08-15', '2025-12-31', '2024-02-29']) {
      expect(claveDiaLocal(diaDesdeClave(clave)!)).toBe(clave)
    }
  })

  it('rechaza claves inválidas en vez de inventar una fecha', () => {
    // new Date(2025, 1, 31) daría 3 de marzo sin avisar.
    expect(diaDesdeClave('2025-02-31')).toBeNull()
    expect(diaDesdeClave('2025-13-01')).toBeNull()
    expect(diaDesdeClave('hoy')).toBeNull()
    expect(diaDesdeClave('')).toBeNull()
    expect(diaDesdeClave(null)).toBeNull()
  })
})

describe('inputValueParaDia', () => {
  it('usa el día pedido conservando la hora actual', () => {
    const valor = inputValueParaDia('2025-08-15')
    expect(valor.slice(0, 10)).toBe('2025-08-15')
    expect(valor.slice(11)).toBe(nowLocalInputValue().slice(11))
    expect(valor).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/)
  })

  it('cae en ahora cuando no hay día válido', () => {
    for (const clave of [null, undefined, '', 'cualquier cosa', '2025-02-31']) {
      expect(inputValueParaDia(clave).slice(0, 10)).toBe(nowLocalInputValue().slice(0, 10))
    }
  })
})
