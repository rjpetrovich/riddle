import type { Comida, Sensacion, TipoComida, Valoracion } from '../../types/domain'

export type ItemTimeline =
  | {
      tipo: 'comida'
      fechaHora: string
      data: Comida
      /** Las que se muestran; pueden venir recortadas por el filtro. */
      sensaciones: Sensacion[]
      /** Si la comida tiene alguna sensación en la base, más allá del filtro. */
      tieneSensaciones: boolean
    }
  | { tipo: 'sensacion'; fechaHora: string; data: Sensacion }

export interface FiltrosTimeline {
  tipoComida: TipoComida | ''
  valoracion: Valoracion | ''
}

/**
 * Arma la lista del día: cada sensación se muestra dentro de la comida a la
 * que pertenece, y sueltas las que no tienen comida asociada.
 *
 * El agrupado se hace sobre las sensaciones SIN filtrar. Si filtrara antes,
 * una comida cuya sensación no pasa el filtro parecería no tener ninguna y su
 * tarjeta ofrecería "¿Cómo te cayó?", invitando a cargar una segunda sensación
 * para la misma comida y desbalanceando las estadísticas.
 */
export function agruparTimeline(
  comidas: Comida[],
  sensaciones: Sensacion[],
  filtros: FiltrosTimeline,
): ItemTimeline[] {
  const comidasFiltradas = filtros.tipoComida
    ? comidas.filter((c) => c.tipoComida === filtros.tipoComida)
    : comidas

  const idsComidasVisibles = new Set(comidasFiltradas.map((c) => c.id))
  const sensacionesPorComida = new Map<string, Sensacion[]>()
  const sensacionesSueltas: Sensacion[] = []

  for (const s of sensaciones) {
    // Las que apuntan a una comida de otro día (fuera de esta vista) van
    // sueltas para que no desaparezcan del historial.
    if (s.comidaId && idsComidasVisibles.has(s.comidaId)) {
      const previas = sensacionesPorComida.get(s.comidaId) ?? []
      sensacionesPorComida.set(s.comidaId, [...previas, s])
    } else {
      sensacionesSueltas.push(s)
    }
  }

  const coincide = (s: Sensacion) => !filtros.valoracion || s.valoracion === filtros.valoracion

  const items: ItemTimeline[] = comidasFiltradas.flatMap((c) => {
    const propias = (sensacionesPorComida.get(c.id) ?? []).sort((a, b) =>
      a.fechaHora < b.fechaHora ? -1 : 1,
    )
    const visibles = propias.filter(coincide)
    // Con un filtro de valoración activo, una comida solo entra si alguna de
    // sus sensaciones coincide; las que no tienen ninguna no aplican.
    if (filtros.valoracion && visibles.length === 0) return []
    return [
      {
        tipo: 'comida' as const,
        fechaHora: c.fechaHora,
        data: c,
        sensaciones: visibles,
        tieneSensaciones: propias.length > 0,
      },
    ]
  })

  for (const s of sensacionesSueltas.filter(coincide)) {
    items.push({ tipo: 'sensacion', fechaHora: s.fechaHora, data: s })
  }

  return items.sort((a, b) => (a.fechaHora < b.fechaHora ? 1 : -1))
}
