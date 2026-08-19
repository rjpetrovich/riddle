import { describe, expect, it } from 'vitest'
import { normalizarIngredientes } from './mealsApi'

describe('normalizarIngredientes', () => {
  it('trata como el mismo ingrediente las variantes de mayúsculas', () => {
    // Este era el bug: "Tomate" y "tomate" creaban dos filas distintas en el
    // catálogo y cada una acumulaba sus registros por separado, así que
    // ninguna llegaba al mínimo de 3 que pide la detección de patrones.
    expect(normalizarIngredientes(['Tomate', 'tomate', 'TOMATE'])).toEqual(['Tomate'])
  })

  it('conserva la primera forma escrita, que es la que se muestra', () => {
    expect(normalizarIngredientes(['tomate', 'Tomate'])).toEqual(['tomate'])
  })

  it('recorta espacios sobrantes al principio y al final', () => {
    expect(normalizarIngredientes(['  palta  '])).toEqual(['palta'])
  })

  it('colapsa espacios repetidos del medio', () => {
    expect(normalizarIngredientes(['arroz    integral'])).toEqual(['arroz integral'])
    expect(normalizarIngredientes(['arroz integral', 'arroz  integral'])).toEqual([
      'arroz integral',
    ])
  })

  it('descarta entradas vacías o de solo espacios', () => {
    expect(normalizarIngredientes(['', '   ', 'pollo'])).toEqual(['pollo'])
  })

  it('mantiene el orden en que se cargaron', () => {
    expect(normalizarIngredientes(['pollo', 'arroz', 'palta'])).toEqual([
      'pollo',
      'arroz',
      'palta',
    ])
  })

  it('devuelve lista vacía si no hay nada aprovechable', () => {
    expect(normalizarIngredientes([])).toEqual([])
    expect(normalizarIngredientes(['  '])).toEqual([])
  })

  it('no confunde ingredientes distintos que empiezan igual', () => {
    expect(normalizarIngredientes(['queso', 'queso azul'])).toEqual(['queso', 'queso azul'])
  })
})
