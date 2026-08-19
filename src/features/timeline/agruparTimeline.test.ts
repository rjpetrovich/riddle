import { describe, expect, it } from 'vitest'
import { agruparTimeline } from './agruparTimeline'
import type { Comida, Sensacion } from '../../types/domain'

const comida = (id: string, hora: string, tipoComida: Comida['tipoComida'] = 'almuerzo'): Comida => ({
  id,
  fechaHora: `2026-08-19T${hora}:00Z`,
  tipoComida,
  nombre: `Comida ${id}`,
  fotoUrl: null,
  notas: null,
  alimentos: [],
})

const sensacion = (
  id: string,
  hora: string,
  valoracion: Sensacion['valoracion'],
  comidaId: string | null = null,
): Sensacion => ({
  id,
  comidaId,
  fechaHora: `2026-08-19T${hora}:00Z`,
  valoracion,
  intensidad: null,
  notas: null,
  sintomaIds: [],
})

const sinFiltros = { tipoComida: '' as const, valoracion: '' as const }

describe('agruparTimeline', () => {
  it('anida la sensación dentro de su comida en vez de listarla aparte', () => {
    const items = agruparTimeline(
      [comida('c1', '12:00')],
      [sensacion('s1', '15:00', 'mal', 'c1')],
      sinFiltros,
    )
    expect(items).toHaveLength(1)
    expect(items[0].tipo).toBe('comida')
    if (items[0].tipo === 'comida') {
      expect(items[0].sensaciones.map((s) => s.id)).toEqual(['s1'])
      expect(items[0].tieneSensaciones).toBe(true)
    }
  })

  it('deja sueltas las sensaciones sin comida asociada', () => {
    const items = agruparTimeline([], [sensacion('s1', '09:00', 'bien')], sinFiltros)
    expect(items).toHaveLength(1)
    expect(items[0].tipo).toBe('sensacion')
  })

  it('no pierde una sensación cuya comida es de otro día', () => {
    // Comida de ayer, sensación de hoy: la comida no está en esta vista, pero
    // la sensación tiene que seguir apareciendo en el historial.
    const items = agruparTimeline([], [sensacion('s1', '02:00', 'mal', 'c-de-ayer')], sinFiltros)
    expect(items).toHaveLength(1)
    expect(items[0].tipo).toBe('sensacion')
  })

  it('ordena todo de más nuevo a más viejo', () => {
    const items = agruparTimeline(
      [comida('c1', '08:00'), comida('c2', '20:00')],
      [sensacion('s1', '14:00', 'bien')],
      sinFiltros,
    )
    expect(items.map((i) => i.data.id)).toEqual(['c2', 's1', 'c1'])
  })

  it('filtra por tipo de comida', () => {
    const items = agruparTimeline(
      [comida('c1', '08:00', 'desayuno'), comida('c2', '13:00', 'almuerzo')],
      [],
      { tipoComida: 'desayuno', valoracion: '' },
    )
    expect(items.map((i) => i.data.id)).toEqual(['c1'])
  })

  describe('con filtro de valoración', () => {
    it('no ofrece cargar otra sensación en una comida que ya tiene una', () => {
      // Este era el bug: al filtrar "solo mal", una comida con sensación "bien"
      // aparecía sin sensaciones y su tarjeta invitaba a registrar otra,
      // duplicando el dato y torciendo las estadísticas.
      const items = agruparTimeline(
        [comida('c1', '12:00')],
        [sensacion('s1', '15:00', 'bien', 'c1')],
        { tipoComida: '', valoracion: 'mal' },
      )
      // La comida no coincide con el filtro, así que directamente no se lista.
      expect(items).toHaveLength(0)
    })

    it('si la comida tiene varias, muestra solo las que coinciden pero recuerda que tiene', () => {
      const items = agruparTimeline(
        [comida('c1', '12:00')],
        [sensacion('s1', '13:00', 'bien', 'c1'), sensacion('s2', '18:00', 'mal', 'c1')],
        { tipoComida: '', valoracion: 'mal' },
      )
      expect(items).toHaveLength(1)
      if (items[0].tipo === 'comida') {
        expect(items[0].sensaciones.map((s) => s.id)).toEqual(['s2'])
        expect(items[0].tieneSensaciones).toBe(true)
      }
    })

    it('oculta las comidas sin ninguna sensación', () => {
      const items = agruparTimeline([comida('c1', '12:00')], [], {
        tipoComida: '',
        valoracion: 'bien',
      })
      expect(items).toHaveLength(0)
    })

    it('filtra también las sensaciones sueltas', () => {
      const items = agruparTimeline(
        [],
        [sensacion('s1', '09:00', 'bien'), sensacion('s2', '10:00', 'mal')],
        { tipoComida: '', valoracion: 'mal' },
      )
      expect(items.map((i) => i.data.id)).toEqual(['s2'])
    })
  })

  it('marca tieneSensaciones en false solo cuando de verdad no hay ninguna', () => {
    const items = agruparTimeline([comida('c1', '12:00')], [], sinFiltros)
    if (items[0].tipo === 'comida') {
      expect(items[0].tieneSensaciones).toBe(false)
    }
  })

  it('ordena las sensaciones de una comida cronológicamente', () => {
    const items = agruparTimeline(
      [comida('c1', '12:00')],
      [sensacion('s2', '18:00', 'mal', 'c1'), sensacion('s1', '13:00', 'bien', 'c1')],
      sinFiltros,
    )
    if (items[0].tipo === 'comida') {
      expect(items[0].sensaciones.map((s) => s.id)).toEqual(['s1', 's2'])
    }
  })
})
