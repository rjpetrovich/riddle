import type { QueryClient } from '@tanstack/react-query'

/**
 * Todas las vistas salen del mismo puñado de filas (comidas, sensaciones y sus
 * ingredientes), así que cualquier alta, edición o borrado las afecta a todas:
 * el timeline, los pendientes de registrar, el catálogo de ingredientes y los
 * patrones. Invalidarlas juntas evita el bug de acordarse de unas y olvidarse
 * de otras —así quedaron los patrones mostrando datos viejos tras cargar una
 * comida— y el costo es despreciable con el volumen de un diario personal.
 */
export function invalidarDatosDeRegistro(queryClient: QueryClient) {
  for (const key of [
    'comidas',
    'comida',
    'calendario',
    'comidas-recientes',
    'comidas-pendientes',
    'sensaciones',
    'sensacion',
    'alimentos',
    'datos-patrones',
  ]) {
    queryClient.invalidateQueries({ queryKey: [key] })
  }
}
